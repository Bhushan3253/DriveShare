package com.carrentalpvt.carpvt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UPIPaymentResponse {

    private String paymentId;

    private String bookingId;

    private double amount;

    private String upiUri;

    private String qrCode;

    private String upiId;

    private String upiName;
}