package com.carrentalpvt.carpvt.model;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime expiresAt;

    @Indexed
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime checkedInAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime startedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime returnedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime completedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime cancelledAt;

    private String cancelledBy;

    private String cancellationReason;

    // Pre-Trip Handover Inspection
    private Integer startOdometer;

    private String startFuelLevel;

    private java.util.List<String> checkInPhotos = new java.util.ArrayList<>();

    private String checkInNotes;

    // Post-Trip Return Inspection
    private Integer endOdometer;

    private Integer totalDistanceDriven;

    private String endFuelLevel;

    private java.util.List<String> checkOutPhotos = new java.util.ArrayList<>();

    private String checkOutNotes;
}