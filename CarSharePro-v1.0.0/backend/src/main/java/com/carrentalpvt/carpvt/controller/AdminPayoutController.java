package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.ProcessPayoutRequest;
import com.carrentalpvt.carpvt.model.Payout;
import com.carrentalpvt.carpvt.service.PayoutService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payouts")
@CrossOrigin
public class AdminPayoutController {

    private final PayoutService payoutService;

    public AdminPayoutController(PayoutService payoutService) {
        this.payoutService = payoutService;
    }

    // 1. GET ALL PENDING PAYOUTS (WAITING FOR BANK/UPI TRANSFER)
    @GetMapping("/pending")
    public List<Payout> getPendingPayouts() {
        return payoutService.getPendingPayouts();
    }

    // 2. GET ALL PAYOUTS
    @GetMapping
    public List<Payout> getAllPayouts() {
        return payoutService.getAllPayouts();
    }

    // 3. PROCESS/SETTLE PAYOUT (MARK AS PAID)
    @PutMapping("/{payoutId}/process")
    public Payout processPayout(
            @PathVariable String payoutId,
            @RequestBody(required = false) ProcessPayoutRequest request,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        String ref = request != null ? request.getPayoutReference() : "BANK_TRANSFER";
        String notes = request != null ? request.getNotes() : null;

        return payoutService.processPayout(payoutId, adminId, ref, notes);
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
