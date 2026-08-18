package com.carrentalpvt.carpvt.dto;

import com.carrentalpvt.carpvt.model.Payout;
import com.carrentalpvt.carpvt.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerEarningsSummaryResponse {

    private double totalBookingAmount;
    private double totalPlatformCommission;
    private double totalOwnerEarnings;
    private double pendingPayout;
    private double paidPayout;
    private long completedTrips;

    private List<Payout> payouts;
    private List<Transaction> transactions;
}
