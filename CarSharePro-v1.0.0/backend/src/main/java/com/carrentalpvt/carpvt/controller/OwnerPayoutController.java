package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.OwnerEarningsSummaryResponse;
import com.carrentalpvt.carpvt.model.Payout;
import com.carrentalpvt.carpvt.model.Transaction;
import com.carrentalpvt.carpvt.service.PayoutService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/owner")
@CrossOrigin
public class OwnerPayoutController {

    private final PayoutService payoutService;

    public OwnerPayoutController(PayoutService payoutService) {
        this.payoutService = payoutService;
    }

    // 1. GET OWNER EARNINGS & PAYOUTS FULL SUMMARY
    @GetMapping("/earnings/summary")
    public OwnerEarningsSummaryResponse getEarningsSummary(Authentication authentication) {
        String ownerId = requireAuthenticatedUserId(authentication);
        return payoutService.getOwnerEarningsSummary(ownerId);
    }

    // 2. GET OWNER PAYOUT RECORDS
    @GetMapping("/payouts")
    public List<Payout> getOwnerPayouts(Authentication authentication) {
        String ownerId = requireAuthenticatedUserId(authentication);
        return payoutService.getOwnerPayouts(ownerId);
    }

    // 3. GET OWNER TRANSACTION LEDGER
    @GetMapping("/transactions")
    public List<Transaction> getOwnerTransactions(Authentication authentication) {
        String ownerId = requireAuthenticatedUserId(authentication);
        return payoutService.getOwnerTransactions(ownerId);
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
