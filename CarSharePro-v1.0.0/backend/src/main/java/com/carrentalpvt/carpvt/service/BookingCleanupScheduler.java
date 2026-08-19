package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class BookingCleanupScheduler {

    private final BookingRepository bookingRepository;

    public BookingCleanupScheduler(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Runs every 60 seconds to release date locks for expired PAYMENT_PENDING bookings
     * where the renter did not submit a UTR within the 15-minute hold window.
     */
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredPendingBookings = bookingRepository.findByStatusAndExpiresAtBefore("PAYMENT_PENDING", now);

        for (Booking booking : expiredPendingBookings) {
            // If UTR has NOT been submitted, cancel it to release the car calendar
            if (booking.getUtrNumber() == null || booking.getUtrNumber().trim().isEmpty()) {
                booking.setStatus("CANCELLED");
                booking.setPaymentStatus("EXPIRED");
                booking.setCancelledAt(now);
                booking.setCancelledBy("SYSTEM_TIMEOUT");
                booking.setCancellationReason("Payment window expired (15 minutes). Reservation released.");
                bookingRepository.save(booking);
                log.info("Auto-cancelled expired booking: {} for car: {}", booking.getId(), booking.getCarId());
            }
        }
    }
}
