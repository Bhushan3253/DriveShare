package com.carrentalpvt.carpvt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    @Indexed
    private String bookingId;

    @Indexed
    private String carId;

    @Indexed
    private String ownerId;

    @Indexed
    private String renterId;

    private double totalAmount;

    private double commissionPercentage;

    private double platformCommission;

    private double ownerEarning;

    // PENDING -> COMPLETED
    @Indexed
    private String status;

    @Indexed
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;
}