package com.carrentalpvt.carpvt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "bookings")
@CompoundIndexes({
    @CompoundIndex(name = "car_dates_idx", def = "{'carId': 1, 'startDate': 1, 'endDate': 1}"),
    @CompoundIndex(name = "renter_status_idx", def = "{'renterId': 1, 'status': 1}")
})
public class Booking {

    @Id
    private String id;

    @Indexed
    private String carId;

    @Indexed
    private String ownerId;

    @Indexed
    private String renterId;

    @Indexed
    private LocalDate startDate;

    @Indexed
    private LocalDate endDate;

    private long totalDays;

    private double pricePerDay;

    private double totalAmount;

    // PAYMENT_PENDING -> CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> RETURNED -> COMPLETED / CANCELLED
    @Indexed
    private String status = "PAYMENT_PENDING";

    // PENDING -> PAID -> CANCELLED / FAILED
    @Indexed
    private String paymentStatus = "PENDING";

    @Indexed
    private String utrNumber;

    // Temporary hold timeout for UPI payment completion (15 mins)
    @Indexed
    private LocalDateTime expiresAt;

    @Indexed
    private LocalDateTime createdAt;

    private LocalDateTime checkedInAt;

    private LocalDateTime startedAt;

    private LocalDateTime returnedAt;

    private LocalDateTime completedAt;

    private LocalDateTime cancelledAt;

    private String cancelledBy;

    private String cancellationReason;
}