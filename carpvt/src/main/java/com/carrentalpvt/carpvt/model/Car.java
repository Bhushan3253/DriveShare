package com.carrentalpvt.carpvt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
}
