package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.User;
import com.carrentalpvt.carpvt.repository.UserRepository;
import com.carrentalpvt.carpvt.service.CloudinaryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public UserController(
            UserRepository userRepository,
            CloudinaryService cloudinaryService) {

        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    // ==========================================
    // 1. GET CURRENT USER PROFILE
    // ==========================================

    @GetMapping("/profile")
    public User getProfile(Authentication authentication) {
        String userId = requireAuthenticatedUserId(authentication);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    // ==========================================
    // 2. UPDATE PROFILE
    // ==========================================

    @PutMapping("/profile")
    public User updateProfile(
            @RequestBody User profileData,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (profileData.getName() != null && !profileData.getName().trim().isEmpty()) {
            user.setName(profileData.getName().trim());
        }
        if (profileData.getPhone() != null && !profileData.getPhone().trim().isEmpty()) {
            user.setPhone(profileData.getPhone().trim());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    // ==========================================
    // 3. SUBMIT DRIVING LICENSE (KYC)
    // ==========================================

    @PostMapping("/kyc/driving-license")
    public User submitDrivingLicense(
            @RequestParam("file") MultipartFile file,
            @RequestParam("dlNumber") String dlNumber,
            @RequestParam(value = "expiry", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiry,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (dlNumber == null || dlNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Driving license number is required.");
        }

        // Upload to Cloudinary under kyc folder
        Map<String, String> uploadResult = cloudinaryService.uploadDocument(file, "kyc");
        String url = uploadResult.get("url");
        String publicId = uploadResult.get("publicId");

        // Clean up old document if exists
        if (user.getDrivingLicensePublicId() != null) {
            try {
                cloudinaryService.deleteImage(user.getDrivingLicensePublicId());
            } catch (Exception ignored) {}
        }

        user.setDrivingLicenseNumber(dlNumber.trim().toUpperCase());
        if (expiry != null) {
            user.setDrivingLicenseExpiry(expiry);
        }
        user.setDrivingLicenseUrl(url);
        user.setDrivingLicensePublicId(publicId);
        user.setKycStatus("PENDING_VERIFICATION");
        user.setKycRejectionReason(null);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
