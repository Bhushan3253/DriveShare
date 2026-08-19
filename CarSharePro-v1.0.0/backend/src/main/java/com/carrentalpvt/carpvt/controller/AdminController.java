package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.AdminDashboardResponse;
import com.carrentalpvt.carpvt.dto.PaymentRejectionRequest;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.Payment;
import com.carrentalpvt.carpvt.model.Review;
import com.carrentalpvt.carpvt.model.User;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.ReviewRepository;
import com.carrentalpvt.carpvt.service.AdminService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final AdminService adminService;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    public AdminController(
            AdminService adminService,
            BookingRepository bookingRepository,
            ReviewRepository reviewRepository) {

        this.adminService = adminService;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    // ==========================================
    // 1. GET ALL BOOKINGS (ADMIN)
    // ==========================================

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ==========================================
    // 2. GET ALL REVIEWS (ADMIN)
    // ==========================================

    @GetMapping("/reviews")
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // ==========================================
    // 2. GET PENDING PAYMENTS
    // ==========================================

    @GetMapping("/payments/pending")
    public List<Payment> getPendingPayments() {
        return adminService.getPendingPayments();
    }

    // ==========================================
    // 3. GET ALL PAYMENTS
    // ==========================================

    @GetMapping("/payments")
    public List<Payment> getAllPayments() {
        return adminService.getAllPayments();
    }

    // ==========================================
    // 4. VERIFY PAYMENT (ADMIN)
    // ==========================================

    @PutMapping("/payments/{paymentId}/verify")
    public Payment verifyPayment(
            @PathVariable String paymentId,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        return adminService.verifyPayment(paymentId, adminId);
    }

    // ==========================================
    // 5. REJECT PAYMENT (ADMIN)
    // ==========================================

    @PutMapping("/payments/{paymentId}/reject")
    public Payment rejectPayment(
            @PathVariable String paymentId,
            @RequestBody PaymentRejectionRequest request,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        return adminService.rejectPayment(paymentId, adminId, request.getReason());
    }

    // ==========================================
    // 6. USER MANAGEMENT & KYC MODERATION
    // ==========================================

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PutMapping("/users/{userId}/kyc/approve")
    public User approveUserKyc(
            @PathVariable String userId,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        return adminService.approveUserKyc(userId, adminId);
    }

    @PutMapping("/users/{userId}/kyc/reject")
    public User rejectUserKyc(
            @PathVariable String userId,
            @RequestBody(required = false) PaymentRejectionRequest request,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        String reason = request != null ? request.getReason() : null;
        return adminService.rejectUserKyc(userId, adminId, reason);
    }

    @PutMapping("/users/{userId}/toggle-status")
    public User toggleUserStatus(
            @PathVariable String userId,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        return adminService.toggleUserStatus(userId, adminId);
    }

    @PutMapping("/users/{userId}/role")
    public User updateUserRole(
            @PathVariable String userId,
            @RequestParam("role") String newRole,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        return adminService.updateUserRole(userId, newRole, adminId);
    }

    @GetMapping("/users/{userId}/dossier")
    public java.util.Map<String, Object> getUserDossier(
            @PathVariable String userId) {

        return adminService.getUserDossier(userId);
    }

    // ==========================================
    // 7. BOOKING DISPUTE / FORCE CANCELLATION
    // ==========================================

    @PutMapping("/bookings/{bookingId}/force-cancel")
    public Booking forceCancelBooking(
            @PathVariable String bookingId,
            @RequestBody(required = false) PaymentRejectionRequest request,
            Authentication authentication) {

        String adminId = requireAuthenticatedUserId(authentication);
        String reason = request != null ? request.getReason() : null;
        return adminService.forceCancelBooking(bookingId, adminId, reason);
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
