package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.model.Transaction;
import com.carrentalpvt.carpvt.repository.TransactionRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner")
@CrossOrigin
public class OwnerController {

    private final TransactionRepository transactionRepository;

    public OwnerController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/{ownerId}/earnings")
    public List<Transaction> getEarnings(
            @PathVariable String ownerId,
            Authentication authentication) {

        String authenticatedUserId = requireAuthenticatedUserId(authentication);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!isAdmin && !ownerId.equals(authenticatedUserId)) {
            throw new AccessDeniedException("You are not authorized to view another host's earnings");
        }

        return transactionRepository.findByOwnerId(ownerId);
    }

    @GetMapping("/{ownerId}/total-earnings")
    public double getTotalEarnings(
            @PathVariable String ownerId,
            Authentication authentication) {

        String authenticatedUserId = requireAuthenticatedUserId(authentication);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!isAdmin && !ownerId.equals(authenticatedUserId)) {
            throw new AccessDeniedException("You are not authorized to view another host's earnings");
        }

        List<Transaction> transactions = transactionRepository.findByOwnerId(ownerId);

        return transactions.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus()))
                .mapToDouble(Transaction::getOwnerEarning)
                .sum();
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}