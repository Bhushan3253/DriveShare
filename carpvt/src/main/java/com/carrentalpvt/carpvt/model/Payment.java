package com.carrentalpvt.carpvt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    @Indexed
    private String bookingId;

    @Indexed
    private String userId;

    private double amount;

    private String paymentMethod;

    @Indexed
    private String transactionId;

    @Indexed
    private String status;

    @Indexed(sparse = true)
    private String utrNumber;

    @Indexed
    private LocalDateTime createdAt;

    private LocalDateTime submittedAt;

    private LocalDateTime verifiedAt;

    private String verifiedBy;

    private String rejectionReason;
}