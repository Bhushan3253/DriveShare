package com.carrentalpvt.carpvt.dto;

import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.Payment;
import com.carrentalpvt.carpvt.model.Payout;
import com.carrentalpvt.carpvt.model.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalCarOwners;
    private long totalCars;
    private long pendingCars;
    private long approvedCars;
    private long totalBookings;
    private long activeBookings;
    private long completedBookings;
    private long pendingPayments;
    private long verifiedPayments;
    private long rejectedPayments;
    private long pendingPayouts;
    private double pendingPayoutAmount;
    private double paidPayoutAmount;
    private double totalBookingValue;
    private double platformCommission;
    private double ownerEarnings;

    private List<Payment> recentPendingPayments;
    private List<Booking> recentBookings;
    private List<Payout> recentPendingPayouts;
    private List<Car> pendingCarApprovals;
    private List<Review> recentReviews;
}
