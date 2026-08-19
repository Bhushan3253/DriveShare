package com.carrentalpvt.carpvt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private String id;
    private String bookingId;
    private String carId;
    private String ownerId;
    private String renterId;
    private String renterName;
    private int carRating;
    private int ownerRating;
    private String comment;
    private LocalDateTime createdAt;
}
