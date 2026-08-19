package com.carrentalpvt.carpvt.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
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

    private String locationName;

    private Double latitude;

    private Double longitude;

    // MongoDB 2dsphere GeoJSON Point: [longitude, latitude]
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint coordinates;

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

    public GeoJsonPoint getCoordinates() {
        if (coordinates != null) return coordinates;
        if (latitude != null && longitude != null) {
            return new GeoJsonPoint(longitude, latitude);
        }
        return null;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
        if (latitude != null && this.longitude != null) {
            this.coordinates = new GeoJsonPoint(this.longitude, latitude);
        }
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
        if (this.latitude != null && longitude != null) {
            this.coordinates = new GeoJsonPoint(longitude, this.latitude);
        }
    }

    public Double getLatitude() {
        if (latitude != null) return latitude;
        if (coordinates != null) return coordinates.getY();
        return null;
    }

    public Double getLongitude() {
        if (longitude != null) return longitude;
        if (coordinates != null) return coordinates.getX();
        return null;
    }

    public String getLocationName() {
        if (locationName != null && !locationName.trim().isEmpty()) return locationName;
        return location;
    }
}

