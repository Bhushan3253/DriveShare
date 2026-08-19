package com.carrentalpvt.carpvt.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AvailabilityRequest {

    private String carId;
    private LocalDate startDate;
    private LocalDate endDate;
}
