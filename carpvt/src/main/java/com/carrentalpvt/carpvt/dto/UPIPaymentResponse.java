package com.carrentalpvt.carpvt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UPIPaymentResponse {

    private String paymentId;

    private String bookingId;

    private double amount;

    private String upiUri;

    private String qrCode;
}