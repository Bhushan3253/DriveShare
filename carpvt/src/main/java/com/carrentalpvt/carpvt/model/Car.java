package com.carrentalpvt.carpvt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "cars")
@CompoundIndexes({
    @CompoundIndex(name = "status_active_idx", def = "{'status': 1, 'active': 1}"),
    @CompoundIndex(name = "location_status_idx", def = "{'location': 1, 'status': 1, 'active': 1}")
})
public class Car {

    @Id
    private String id;

    // Owner of the car
    @Indexed
    private String ownerId;

    @Indexed
    private String brand;

    private String model;

    private int year;

    // Unique Vehicle Registration / License Plate Number (e.g. MH 12 AB 1234)
    @Indexed(unique = true)
    private String registrationNumber;

    // Optional Chassis / VIN
    private String chassisNumber;

    // Insurance Information
    private String insurancePolicyNumber;

    private LocalDate insuranceExpiry;

    // Pollution Under Control (PUC) Expiry
    private LocalDate pucExpiry;

    // Compliance Document URLs & Cloudinary Public IDs
    private String rcDocUrl;
    private String rcDocPublicId;

    private String insuranceDocUrl;
    private String insuranceDocPublicId;

    private String pucDocUrl;
    private String pucDocPublicId;

    @Indexed
    private String type;

    @Indexed
    private String fuelType;

    private String transmission;

    private int seats;

    @Indexed
    private double pricePerDay;

    @Indexed
    private String location;

    private String description;

    private String imageUrl;

    private List<CarImage> images = new ArrayList<>();

    // PENDING / APPROVED / REJECTED / BLOCKED
    @Indexed
    private String status = "PENDING";

    @Indexed
    private boolean active = false;

    private String rejectionReason;

    private String blockReason;

    private LocalDateTime reviewedAt;

    private String reviewedBy;

    private double averageRating = 0.0;

    private int reviewCount = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
