package com.carrentalpvt.carpvt.dto;

import lombok.Data;
import java.util.List;

@Data
public class BookingInspectionRequest {

    private Integer odometer;

    private String fuelLevel;

    private String notes;

    private List<String> photos;
}
