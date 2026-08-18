package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.BookingCancellationRequest;
import com.carrentalpvt.carpvt.dto.BookingRequest;
import com.carrentalpvt.carpvt.dto.PriceCalculationResponse;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.service.BookingService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ==========================================
    // 0. CALCULATE PRICE & PREVIEW AVAILABILITY (PUBLIC)
    // ==========================================

    @GetMapping("/calculate-price")
    public PriceCalculationResponse calculatePrice(
            @RequestParam String carId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return bookingService.calculatePrice(carId, startDate, endDate);
    }

    // ==========================================
    // 1. CREATE BOOKING (Supports JSON Body or Query Params)
    // ==========================================

    @PostMapping
    public Booking createBooking(
            @RequestBody(required = false) BookingRequest request,
            @RequestParam(required = false) String carId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        String renterId = requireAuthenticatedUserId(authentication);

        String targetCarId = request != null && request.getCarId() != null ? request.getCarId() : carId;
        LocalDate targetStartDate = request != null && request.getStartDate() != null ? request.getStartDate() : startDate;
        LocalDate targetEndDate = request != null && request.getEndDate() != null ? request.getEndDate() : endDate;

        return bookingService.createBooking(targetCarId, renterId, targetStartDate, targetEndDate);
    }

    // ==========================================
    // 2. GET BOOKING BY ID
    // ==========================================

    @GetMapping("/{id}")
    public Booking getBookingById(
            @PathVariable String id,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        return bookingService.getBookingById(id, userId);
    }

    // ==========================================
    // 3. GET RENTER'S BOOKINGS
    // ==========================================

    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings(Authentication authentication) {
        String renterId = requireAuthenticatedUserId(authentication);
        return bookingService.getBookingsByRenter(renterId);
    }

    // ==========================================
    // 4. GET OWNER'S BOOKINGS
    // ==========================================

    @GetMapping("/owner")
    public List<Booking> getOwnerBookings(Authentication authentication) {
        String ownerId = requireAuthenticatedUserId(authentication);
        return bookingService.getBookingsByOwner(ownerId);
    }

    // ==========================================
    // 5. CHECK-IN (RENTER OR OWNER)
    // ==========================================

    @PutMapping("/{id}/check-in")
    public Booking checkIn(
            @PathVariable String id,
            @RequestBody(required = false) com.carrentalpvt.carpvt.dto.BookingInspectionRequest inspection,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        return bookingService.checkIn(id, userId, inspection);
    }

    // ==========================================
    // 6. START RENTAL (TRIP START)
    // ==========================================

    @PutMapping("/{id}/start")
    public Booking startRental(
            @PathVariable String id,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        return bookingService.startRental(id, userId);
    }

    // ==========================================
    // 7. RETURN CAR (RENTER OR OWNER)
    // ==========================================

    @PutMapping("/{id}/return")
    public Booking returnCar(
            @PathVariable String id,
            @RequestBody(required = false) com.carrentalpvt.carpvt.dto.BookingInspectionRequest inspection,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        return bookingService.returnCar(id, userId, inspection);
    }

    // ==========================================
    // 8. COMPLETE BOOKING & FINALIZE EARNINGS (CAR OWNER)
    // ==========================================

    @PutMapping("/{id}/complete")
    public Booking completeBooking(
            @PathVariable String id,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        return bookingService.completeBooking(id, userId);
    }

    // ==========================================
    // 9. CANCEL BOOKING
    // ==========================================

    @PutMapping("/{id}/cancel")
    public Booking cancelBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingCancellationRequest request,
            @RequestParam(required = false) String reason,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        String cancelReason = request != null && request.getReason() != null ? request.getReason() : reason;
        return bookingService.cancelBooking(id, userId, cancelReason);
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}