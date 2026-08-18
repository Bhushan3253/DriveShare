package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.OwnerDashboardResponse;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.service.OwnerDashboardService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/dashboard")
@CrossOrigin
public class OwnerDashboardController {

    private final OwnerDashboardService ownerDashboardService;

    public OwnerDashboardController(OwnerDashboardService ownerDashboardService) {
        this.ownerDashboardService = ownerDashboardService;
    }

    @GetMapping
    public OwnerDashboardResponse getDashboard(Authentication authentication) {
        String ownerId = requireAuthenticatedUserId(authentication);
        return ownerDashboardService.getOwnerDashboard(ownerId);
    }

    @GetMapping("/bookings")
    public List<Booking> getOwnerBookings(Authentication authentication) {
        String ownerId = requireAuthenticatedUserId(authentication);
        return ownerDashboardService.getOwnerBookings(ownerId);
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
