package com.carrentalpvt.carpvt.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payouts")
public class Payout {

    @Id
    private String id;

    @Indexed
    private String ownerId;

    @Indexed
    private String bookingId;

    @Indexed
    private String carId;

    private double totalAmount;

    private double platformCommission;

    private double ownerEarning;

    // PENDING -> PAID / REJECTED
    @Indexed
    @Builder.Default
    private String status = "PENDING";

    @Builder.Default
    private String payoutMethod = "UPI";

    private String payoutReference;

    private String notes;

    @Indexed
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime processedAt;

    private String processedBy;
}
