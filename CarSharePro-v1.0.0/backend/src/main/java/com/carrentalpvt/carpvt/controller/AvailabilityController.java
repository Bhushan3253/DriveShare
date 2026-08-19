package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.AvailabilityRequest;
import com.carrentalpvt.carpvt.model.CarAvailability;
import com.carrentalpvt.carpvt.service.AvailabilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    // ==========================================
    // 1. ADD AVAILABILITY (OWNER)
    // ==========================================

    @PostMapping("/{carId}")
    public CarAvailability addAvailability(
            @PathVariable String carId,
            @RequestBody(required = false) AvailabilityRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        String ownerId = requireAuthenticatedUserId(authentication);

        LocalDate targetStartDate = request != null && request.getStartDate() != null ? request.getStartDate() : startDate;
        LocalDate targetEndDate = request != null && request.getEndDate() != null ? request.getEndDate() : endDate;

        return availabilityService.addAvailability(
                carId,
                ownerId,
                targetStartDate,
                targetEndDate
        );
    }

    // ==========================================
    // 2. GET AVAILABILITY BY CAR (PUBLIC)
    // ==========================================

    @GetMapping("/{carId}")
    public List<CarAvailability> getAvailability(@PathVariable String carId) {
        return availabilityService.getAvailability(carId);
    }

    // ==========================================
    // 3. GET AVAILABILITY BY LOGGED IN OWNER
    // ==========================================

    @GetMapping("/my-availability")
    public List<CarAvailability> getMyAvailability(Authentication authentication) {
        String ownerId = requireAuthenticatedUserId(authentication);
        return availabilityService.getAvailabilityByOwner(ownerId);
    }

    // ==========================================
    // 4. REMOVE AVAILABILITY WINDOW (OWNER)
    // ==========================================

    @DeleteMapping("/{availabilityId}")
    public String removeAvailability(
            @PathVariable String availabilityId,
            Authentication authentication) {

        String ownerId = requireAuthenticatedUserId(authentication);
        availabilityService.removeAvailability(availabilityId, ownerId);
        return "Availability window removed successfully";
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}