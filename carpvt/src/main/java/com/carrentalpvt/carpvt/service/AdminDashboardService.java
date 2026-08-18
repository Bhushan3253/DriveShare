package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.AdminDashboardResponse;
import com.carrentalpvt.carpvt.model.*;
import com.carrentalpvt.carpvt.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PayoutRepository payoutRepository;
    private final ReviewRepository reviewRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            CarRepository carRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            PayoutRepository payoutRepository,
            ReviewRepository reviewRepository) {

        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.payoutRepository = payoutRepository;
        this.reviewRepository = reviewRepository;
    }

    public AdminDashboardResponse getDashboardAnalytics() {
        // Users
        long totalUsers = userRepository.count();
        long totalCarOwners = userRepository.countByCarOwner(true);

        // Fleet
        List<Car> allCars = carRepository.findAll();
        long totalCars = allCars.size();
        long pendingCars = allCars.stream().filter(c -> "PENDING".equals(c.getStatus())).count();
        long approvedCars = allCars.stream().filter(c -> "APPROVED".equals(c.getStatus())).count();
        List<Car> pendingCarApprovals = allCars.stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .toList();

        // Bookings
        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();
        long activeBookings = allBookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus())
                        || "CHECKED_IN".equals(b.getStatus())
                        || "IN_PROGRESS".equals(b.getStatus())
                        || "RETURNED".equals(b.getStatus()))
                .count();
        long completedBookings = allBookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .count();

        // Payments
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

        // Revenue (From verified payments)
        double totalBookingValue = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        double platformCommission = totalBookingValue * 0.15; // 15% Platform Commission
        double ownerEarnings = totalBookingValue - platformCommission; // 85% Owner Earnings

        // Payouts
        List<Payout> allPayouts = payoutRepository.findAll();
        long pendingPayouts = allPayouts.stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .count();
        double pendingPayoutAmount = allPayouts.stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .mapToDouble(Payout::getOwnerEarning)
                .sum();
        double paidPayoutAmount = allPayouts.stream()
                .filter(p -> "PAID".equals(p.getStatus()))
                .mapToDouble(Payout::getOwnerEarning)
                .sum();
        List<Payout> recentPendingPayouts = allPayouts.stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .toList();

        // Reviews
        List<Review> recentReviews = reviewRepository.findAll();

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
                .pendingPayouts(pendingPayouts)
                .pendingPayoutAmount(pendingPayoutAmount)
                .paidPayoutAmount(paidPayoutAmount)
                .totalBookingValue(totalBookingValue)
                .platformCommission(platformCommission)
                .ownerEarnings(ownerEarnings)
                .recentPendingPayments(paymentRepository.findByStatus("PENDING_VERIFICATION"))
                .recentBookings(allBookings)
                .recentPendingPayouts(recentPendingPayouts)
                .pendingCarApprovals(pendingCarApprovals)
                .recentReviews(recentReviews)
                .build();
    }
}
