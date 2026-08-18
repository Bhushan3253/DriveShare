package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.LoginRequest;
import com.carrentalpvt.carpvt.dto.LoginResponse;
import com.carrentalpvt.carpvt.dto.RegisterRequest;
import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.EmailVerificationToken;
import com.carrentalpvt.carpvt.model.User;
import com.carrentalpvt.carpvt.repository.EmailVerificationTokenRepository;
import com.carrentalpvt.carpvt.repository.UserRepository;
import com.carrentalpvt.carpvt.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AuthService(
            UserRepository userRepository,
            EmailVerificationTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // ==========================================
    // 1. REGISTER WITH SECURE EMAIL VERIFICATION
    // ==========================================

    public Map<String, Object> register(RegisterRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        java.util.Optional<User> existingUserOpt = userRepository.findByEmail(normalizedEmail);

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            // If account is already verified, block duplicate registration
            if (existingUser.isEmailVerified()) {
                throw new IllegalStateException("Email already registered and verified. Please sign in.");
            }

            // If account exists but is UNVERIFIED, update details and resend verification
            existingUser.setName(request.getName() != null ? request.getName().trim() : existingUser.getName());
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
                existingUser.setPhone(request.getPhone().trim());
            }
            existingUser.setEnabled(true);

            User savedUser = userRepository.save(existingUser);

            // Invalidate any previous pending tokens for this user
            tokenRepository.deleteByUserId(savedUser.getId());

            // Generate and dispatch fresh verification token
            String rawToken = generateAndSendVerificationToken(savedUser);
            String verificationUrl = getCleanFrontendUrl() + "/verify-email?token=" + rawToken;

            return Map.of(
                    "status", "SUCCESS",
                    "message", "Registration renewed! A new verification link has been sent to your email.",
                    "user", savedUser,
                    "verificationToken", rawToken,
                    "verificationUrl", verificationUrl
            );
        }

        // New user creation
        User user = new User();
        user.setName(request.getName() != null ? request.getName().trim() : "User");
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setRole("USER");
        user.setCarOwner(false);
        user.setEnabled(true);
        user.setEmailVerified(false); // Must verify email before logging in

        User savedUser = userRepository.save(user);

        // Generate and send verification token
        String rawToken = generateAndSendVerificationToken(savedUser);
        String verificationUrl = getCleanFrontendUrl() + "/verify-email?token=" + rawToken;

        return Map.of(
                "status", "SUCCESS",
                "message", "Registration successful. Please verify your email.",
                "user", savedUser,
                "verificationToken", rawToken,
                "verificationUrl", verificationUrl
        );
    }

    private String getCleanFrontendUrl() {
        if (frontendUrl != null && !frontendUrl.trim().isEmpty() && !frontendUrl.contains("localhost")) {
            return frontendUrl.trim().replaceAll("/+$", "");
        }
        return "https://drive-share-jj4ehucbv-bhushans-projects-48426fb6.vercel.app";
    }

    // ==========================================
    // 2. VERIFY EMAIL TOKEN
    // ==========================================

    public Map<String, Object> verifyEmail(String rawToken) {
        if (rawToken == null || rawToken.trim().isEmpty()) {
            throw new IllegalArgumentException("Verification token is required");
        }

        String tokenHash = hashToken(rawToken.trim());

        EmailVerificationToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("This verification link is invalid."));

        if (token.isUsed()) {
            throw new IllegalArgumentException("This verification link has already been used.");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This verification link has expired. Please request a new verification email.");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User associated with this token no longer exists."));

        // If already verified
        if (user.isEmailVerified()) {
            token.setUsed(true);
            tokenRepository.save(token);
            return Map.of(
                    "status", "ALREADY_VERIFIED",
                    "message", "Your email is already verified. You can log in."
            );
        }

        // Mark as verified
        user.setEmailVerified(true);
        user.setEnabled(true);
        userRepository.save(user);

        // Invalidate token
        token.setUsed(true);
        tokenRepository.save(token);

        return Map.of(
                "status", "SUCCESS",
                "message", "Email verified successfully! You can now log in to your account."
        );
    }

    // ==========================================
    // 3. RESEND VERIFICATION EMAIL (WITH 60s COOLDOWN)
    // ==========================================

    public Map<String, Object> resendVerification(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + normalizedEmail));

        if (user.isEmailVerified()) {
            return Map.of(
                    "status", "ALREADY_VERIFIED",
                    "message", "Your email is already verified. You can log in directly."
            );
        }

        // Rate limiting check (60-second cooldown)
        tokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId()).ifPresent(lastToken -> {
            if (lastToken.getCreatedAt().plusSeconds(60).isAfter(LocalDateTime.now())) {
                long remainingSecs = java.time.Duration.between(LocalDateTime.now(), lastToken.getCreatedAt().plusSeconds(60)).toSeconds();
                throw new IllegalArgumentException("Please wait " + Math.max(1, remainingSecs) + " seconds before requesting another verification email.");
            }
        });

        // Invalidate previous unused tokens
        tokenRepository.deleteByUserId(user.getId());

        // Generate and dispatch new token
        String rawToken = generateAndSendVerificationToken(user);
        String verificationUrl = getCleanFrontendUrl() + "/verify-email?token=" + rawToken;

        return Map.of(
                "status", "SUCCESS",
                "message", "A new verification email has been sent to " + normalizedEmail + ". Please check your inbox.",
                "verificationToken", rawToken,
                "verificationUrl", verificationUrl
        );
    }

    // ==========================================
    // 4. LOGIN WITH EMAIL VERIFICATION & STATUS ENFORCEMENT
    // ==========================================

    public LoginResponse login(LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Email and password are required");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Block login if account disabled
        if (!user.isEnabled()) {
            throw new BadCredentialsException("Your account has been disabled. Please contact customer support.");
        }

        // Block login if email is not verified
        if (!user.isEmailVerified()) {
            throw new BadCredentialsException("EMAIL_NOT_VERIFIED: Please verify your email address before logging in. Check your inbox.");
        }

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getRole()
        );
    }

    // ==========================================
    // HELPER: TOKEN GENERATION & HASHING
    // ==========================================

    private String generateAndSendVerificationToken(User user) {
        String rawToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        String tokenHash = hashToken(rawToken);

        EmailVerificationToken token = EmailVerificationToken.builder()
                .userId(user.getId())
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(30)) // 30 minute expiry
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        tokenRepository.save(token);

        emailService.sendVerificationEmail(user.getEmail(), user.getName(), rawToken);
        return rawToken;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}