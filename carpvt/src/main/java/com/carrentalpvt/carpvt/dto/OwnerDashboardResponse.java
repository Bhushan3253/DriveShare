package com.carrentalpvt.carpvt.dto;

import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.Payout;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardResponse {

    private long totalCars;
    private long availableCars;
    private long upcomingBookings;
    private long activeRentals;
    private long completedRentals;
    private double totalBookingValue;
    private double platformCommission;
    private double ownerEarnings;

    private double pendingPayout;
    private double paidPayout;

    private List<Booking> recentBookings;
    private List<Car> cars;
    private List<Payout> recentPayouts;
}
