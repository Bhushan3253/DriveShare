package com.carrentalpvt.carpvt.dto;

import lombok.Data;

@Data
public class ReviewRequest {

    private String bookingId;
    private int carRating;
    private int ownerRating;
    private String comment;
}
