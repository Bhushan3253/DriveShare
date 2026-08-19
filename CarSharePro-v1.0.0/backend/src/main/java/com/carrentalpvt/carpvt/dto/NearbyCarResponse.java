package com.carrentalpvt.carpvt.dto;

import com.carrentalpvt.carpvt.model.CarImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyCarResponse {

    private String id;
    private String ownerId;
    private String brand;
    private String model;
    private int year;
    private String type;
    private String fuelType;
    private String transmission;
    private int seats;
    private double pricePerDay;
    private String location;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private double distanceKm;
    private String imageUrl;
    private List<CarImage> images;
    private double averageRating;
    private int reviewCount;
    private boolean available;
    private String status;
    private boolean active;
    private String description;
    private boolean verified;

    public NearbyCarResponse(com.carrentalpvt.carpvt.model.Car car, double distanceKm) {
        if (car != null) {
            this.id = car.getId();
            this.ownerId = car.getOwnerId();
            this.brand = car.getBrand();
            this.model = car.getModel();
            this.year = car.getYear();
            this.type = car.getType();
            this.fuelType = car.getFuelType();
            this.transmission = car.getTransmission();
            this.seats = car.getSeats();
            this.pricePerDay = car.getPricePerDay();
            this.location = car.getLocation();
            this.locationName = car.getLocationName();
            this.latitude = car.getLatitude();
            this.longitude = car.getLongitude();
            this.imageUrl = car.getImageUrl();
            this.images = car.getImages();
            this.averageRating = car.getAverageRating();
            this.reviewCount = car.getReviewCount();
            this.available = car.isActive() && "APPROVED".equalsIgnoreCase(car.getStatus());
            this.status = car.getStatus();
            this.active = car.isActive();
            this.description = car.getDescription();
            this.verified = "APPROVED".equalsIgnoreCase(car.getStatus());
        }
        this.distanceKm = Math.round(distanceKm * 100.0) / 100.0;
    }
}
