package com.carrentalpvt.carpvt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceCalculationResponse {

    private String carId;
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalDays;
    private double pricePerDay;
    private double totalAmount;
    private double platformCommission;
    private double ownerEarnings;
    private boolean available;
    private String message;
}
