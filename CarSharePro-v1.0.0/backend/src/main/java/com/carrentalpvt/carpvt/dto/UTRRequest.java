package com.carrentalpvt.carpvt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UTRRequest {

    @NotBlank(message = "UTR / Transaction reference number is required")
    @Size(min = 6, max = 50, message = "UTR number must be between 6 and 50 characters")
    private String utrNumber;
}