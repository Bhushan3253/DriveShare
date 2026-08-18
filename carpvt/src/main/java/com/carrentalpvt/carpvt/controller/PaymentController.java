package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.model.Payment;
import com.carrentalpvt.carpvt.service.PaymentService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public Payment createPayment(
            @RequestParam String bookingId,
            @RequestParam String paymentMethod,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);

        return paymentService.createPayment(
                bookingId,
                userId,
                paymentMethod
        );
    }
    @PutMapping("/{paymentId}/verify")
public Payment verifyPayment(
        @PathVariable String paymentId) {

    return paymentService.verifyPayment(paymentId);
}

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}