package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.CarBlockRequest;
import com.carrentalpvt.carpvt.dto.CarRejectionRequest;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.service.AdminCarService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cars")
@CrossOrigin
public class AdminCarController {

    private final AdminCarService adminCarService;

    public AdminCarController(AdminCarService adminCarService) {
        this.adminCarService = adminCarService;
    }

    // 1. GET ALL CARS (WITH OPTIONAL STATUS FILTER)
    @GetMapping
    public List<Car> getAllCars(@RequestParam(required = false) String status) {
        return adminCarService.getAllCars(status);
    }

    // 2. GET CAR DETAILS BY ID
    @GetMapping("/{id}")
    public Car getCarById(@PathVariable String id) {
        return adminCarService.getCarById(id);
    }

    // 3. APPROVE CAR
    @PutMapping("/{id}/approve")
    public Car approveCar(
            @PathVariable String id,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        return adminCarService.approveCar(id, adminId);
    }

    // 4. REJECT CAR (WITH REASON)
    @PutMapping("/{id}/reject")
    public Car rejectCar(
            @PathVariable String id,
            @RequestBody CarRejectionRequest request,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        String reason = request != null ? request.getReason() : null;
        return adminCarService.rejectCar(id, adminId, reason);
    }

    // 5. BLOCK CAR
    @PutMapping("/{id}/block")
    public Car blockCar(
            @PathVariable String id,
            @RequestBody(required = false) CarBlockRequest request,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        String reason = request != null ? request.getReason() : null;
        return adminCarService.blockCar(id, adminId, reason);
    }

    // 6. UNBLOCK CAR
    @PutMapping("/{id}/unblock")
    public Car unblockCar(
            @PathVariable String id,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        return adminCarService.unblockCar(id, adminId);
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
