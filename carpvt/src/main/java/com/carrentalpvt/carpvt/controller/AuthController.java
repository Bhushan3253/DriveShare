package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.LoginRequest;
import com.carrentalpvt.carpvt.dto.LoginResponse;
import com.carrentalpvt.carpvt.dto.RegisterRequest;
import com.carrentalpvt.carpvt.model.User;
import com.carrentalpvt.carpvt.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // ==========================================
    // 3. VERIFY EMAIL TOKEN
    // ==========================================

    @GetMapping("/verify-email")
    public Map<String, Object> verifyEmail(@RequestParam String token) {
        return authService.verifyEmail(token);
    }

    // ==========================================
    // 4. RESEND VERIFICATION EMAIL
    // ==========================================

    @PostMapping("/resend-verification")
    public Map<String, Object> resendVerification(
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String email) {

        String targetEmail = body != null && body.containsKey("email") ? body.get("email") : email;
        return authService.resendVerification(targetEmail);
    }
}