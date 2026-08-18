package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.AdminDashboardResponse;
import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.Payment;
import com.carrentalpvt.carpvt.model.User;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.CarRepository;
import com.carrentalpvt.carpvt.repository.PaymentRepository;
import com.carrentalpvt.carpvt.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UPIPaymentService upiPaymentService;
    private final CarService carService;
    private final NotificationService notificationService;

    public AdminService(
            UserRepository userRepository,
            CarRepository carRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            UPIPaymentService upiPaymentService,
            CarService carService,
            NotificationService notificationService) {

        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.upiPaymentService = upiPaymentService;
        this.carService = carService;
        this.notificationService = notificationService;
    }

    public AdminDashboardResponse getDashboardSummary() {
        long totalUsers = userRepository.count();
        long totalCarOwners = userRepository.countByCarOwner(true);

        List<Car> allCars = carRepository.findAll();
        long totalCars = allCars.size();
        long pendingCars = allCars.stream().filter(c -> "PENDING".equals(c.getStatus())).count();
        long approvedCars = allCars.stream().filter(c -> "APPROVED".equals(c.getStatus())).count();

        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();
        long activeBookings = allBookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus())
                        || "CHECKED_IN".equals(b.getStatus())
                        || "IN_PROGRESS".equals(b.getStatus()))
                .count();
        long completedBookings = allBookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .count();

        List<Payment> allPayments = paymentRepository.findAll();
        long pendingPayments = allPayments.stream()
                .filter(p -> "PENDING_VERIFICATION".equals(p.getStatus()))
                .count();
        long verifiedPayments = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .count();
        long rejectedPayments = allPayments.stream()
                .filter(p -> "REJECTED".equals(p.getStatus()))
                .count();

        double totalBookingValue = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        double platformCommission = totalBookingValue * 0.15;
        double ownerEarnings = totalBookingValue - platformCommission;

        List<Payment> recentPendingPayments = paymentRepository.findByStatus("PENDING_VERIFICATION");

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalCarOwners(totalCarOwners)
                .totalCars(totalCars)
                .pendingCars(pendingCars)
                .approvedCars(approvedCars)
                .totalBookings(totalBookings)
                .activeBookings(activeBookings)
                .completedBookings(completedBookings)
                .pendingPayments(pendingPayments)
                .verifiedPayments(verifiedPayments)
                .rejectedPayments(rejectedPayments)
                .totalBookingValue(totalBookingValue)
                .platformCommission(platformCommission)
                .ownerEarnings(ownerEarnings)
                .recentPendingPayments(recentPendingPayments)
                .recentBookings(allBookings)
                .build();
    }

    public List<Payment> getPendingPayments() {
        return paymentRepository.findByStatus("PENDING_VERIFICATION");
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment verifyPayment(String paymentId, String adminId) {
        return upiPaymentService.verifyPayment(paymentId, adminId);
    }

    public Payment rejectPayment(String paymentId, String adminId, String reason) {
        return upiPaymentService.rejectPayment(paymentId, adminId, reason);
    }

    public Car approveCar(String carId) {
        return carService.approveCar(carId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    // ==========================================
    // RENTER KYC & DRIVING LICENSE VERIFICATION
    // ==========================================

    public User approveUserKyc(String userId, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setKycStatus("VERIFIED");
        user.setKycReviewedBy(adminId);
        user.setKycReviewedAt(LocalDateTime.now());
        user.setKycRejectionReason(null);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        notificationService.sendNotification(
                user.getId(),
                "Driving License Verified!",
                "Your Driving License has been approved by admin. You are now a Verified Driver on DriveShare.",
                "KYC_APPROVED",
                user.getId()
        );

        return savedUser;
    }

    public User rejectUserKyc(String userId, String adminId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String rejectReason = (reason != null && !reason.trim().isEmpty())
                ? reason.trim()
                : "Driving License document is unclear or expired";

        user.setKycStatus("REJECTED");
        user.setKycRejectionReason(rejectReason);
        user.setKycReviewedBy(adminId);
        user.setKycReviewedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        notificationService.sendNotification(
                user.getId(),
                "Driving License Verification Failed",
                "Your KYC was rejected. Reason: " + rejectReason + ". Please upload a clear photo of your valid license in your Profile.",
                "KYC_REJECTED",
                user.getId()
        );

        return savedUser;
    }

    // ==========================================
    // USER ACCOUNT CONTROLS (BAN / UNBAN / ROLE)
    // ==========================================

    public User toggleUserStatus(String userId, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setEnabled(!user.isEnabled());
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        notificationService.sendNotification(
                user.getId(),
                user.isEnabled() ? "Account Re-activated" : "Account Suspended",
                user.isEnabled() ? "Your account access has been restored." : "Your account has been suspended by platform administration.",
                "ACCOUNT_STATUS",
                user.getId()
        );

        return saved;
    }

    public User updateUserRole(String userId, String newRole, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (newRole == null || (!newRole.equalsIgnoreCase("USER") && !newRole.equalsIgnoreCase("ADMIN"))) {
            throw new IllegalArgumentException("Role must be USER or ADMIN");
        }

        user.setRole(newRole.toUpperCase());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    // ==========================================
    // USER ACTIVITY DOSSIER
    // ==========================================

    public Map<String, Object> getUserDossier(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Booking> renterBookings = bookingRepository.findByRenterId(userId);
        List<Car> ownedCars = carRepository.findByOwnerId(userId);
        List<Booking> hostBookings = bookingRepository.findByOwnerId(userId);

        double totalSpent = renterBookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()) && !"REJECTED".equals(b.getStatus()))
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        double totalEarned = hostBookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .mapToDouble(b -> b.getTotalAmount() * 0.85)
                .sum();

        Map<String, Object> dossier = new HashMap<>();
        dossier.put("user", user);
        dossier.put("totalBookings", renterBookings.size());
        dossier.put("totalSpent", totalSpent);
        dossier.put("renterBookings", renterBookings);
        dossier.put("totalCars", ownedCars.size());
        dossier.put("totalEarned", totalEarned);
        dossier.put("ownedCars", ownedCars);
        dossier.put("hostBookings", hostBookings);

        return dossier;
    }

    // ==========================================
    // BOOKING DISPUTE & FORCE CANCELLATION
    // ==========================================

    public Booking forceCancelBooking(String bookingId, String adminId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if ("COMPLETED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new IllegalStateException("Cannot cancel a booking that is already " + booking.getStatus());
        }

        String cancelReason = (reason != null && !reason.trim().isEmpty())
                ? "ADMIN OVERRIDE: " + reason.trim()
                : "Cancelled by platform administrator";

        booking.setStatus("CANCELLED");
        booking.setCancelledBy("ADMIN (" + adminId + ")");
        booking.setCancellationReason(cancelReason);
        booking.setCancelledAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        // Notify Renter & Host
        notificationService.sendNotification(
                booking.getRenterId(),
                "Booking Force-Cancelled by Admin",
                "Booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 8)) + " was cancelled by admin. Reason: " + cancelReason,
                "BOOKING_CANCELLED",
                booking.getId()
        );

        notificationService.sendNotification(
                booking.getOwnerId(),
                "Booking Cancelled by Admin Override",
                "Booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 8)) + " was cancelled by admin.",
                "BOOKING_CANCELLED",
                booking.getId()
        );

        return savedBooking;
    }
}
