package com.carrentalpvt.carpvt.dto;

import lombok.Data;

@Data
public class ProcessPayoutRequest {

    private String payoutReference;
    private String notes;
}
