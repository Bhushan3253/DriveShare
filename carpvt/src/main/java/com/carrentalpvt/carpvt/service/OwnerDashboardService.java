package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.OwnerDashboardResponse;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.Payout;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.CarRepository;
import com.carrentalpvt.carpvt.repository.PayoutRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OwnerDashboardService {

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PayoutRepository payoutRepository;

    public OwnerDashboardService(
            CarRepository carRepository,
            BookingRepository bookingRepository,
            PayoutRepository payoutRepository) {

        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.payoutRepository = payoutRepository;
    }

    public OwnerDashboardResponse getOwnerDashboard(String ownerId) {
        List<Car> cars = carRepository.findByOwnerId(ownerId);
        List<Booking> bookings = bookingRepository.findByOwnerId(ownerId);
        List<Payout> payouts = payoutRepository.findByOwnerId(ownerId);

        long totalCars = cars.size();

        long availableCars = cars.stream()
                .filter(c -> c.isActive() && "APPROVED".equals(c.getStatus()))
                .count();

        long upcomingBookings = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) || "CHECKED_IN".equals(b.getStatus()))
                .count();

        long activeRentals = bookings.stream()
                .filter(b -> "IN_PROGRESS".equals(b.getStatus()))
                .count();

        long completedRentals = bookings.stream()
                .filter(b -> "COMPLETED".equals(b.getStatus()))
                .count();

        // Calculate earnings from paid/confirmed bookings
        double totalBookingValue = bookings.stream()
                .filter(b -> "PAID".equals(b.getPaymentStatus())
                        || "CONFIRMED".equals(b.getStatus())
                        || "CHECKED_IN".equals(b.getStatus())
                        || "IN_PROGRESS".equals(b.getStatus())
                        || "RETURNED".equals(b.getStatus())
                        || "COMPLETED".equals(b.getStatus()))
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        double platformCommission = totalBookingValue * 0.15;
        double ownerEarnings = totalBookingValue - platformCommission;

        double pendingPayout = payouts.stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .mapToDouble(Payout::getOwnerEarning)
                .sum();

        double paidPayout = payouts.stream()
                .filter(p -> "PAID".equals(p.getStatus()))
                .mapToDouble(Payout::getOwnerEarning)
                .sum();

        return OwnerDashboardResponse.builder()
                .totalCars(totalCars)
                .availableCars(availableCars)
                .upcomingBookings(upcomingBookings)
                .activeRentals(activeRentals)
                .completedRentals(completedRentals)
                .totalBookingValue(totalBookingValue)
                .platformCommission(platformCommission)
                .ownerEarnings(ownerEarnings)
                .pendingPayout(pendingPayout)
                .paidPayout(paidPayout)
                .recentBookings(bookings)
                .cars(cars)
                .recentPayouts(payouts)
                .build();
    }

    public List<Booking> getOwnerBookings(String ownerId) {
        return bookingRepository.findByOwnerId(ownerId);
    }
}
