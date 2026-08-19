package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.OwnerEarningsSummaryResponse;
import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Payout;
import com.carrentalpvt.carpvt.model.Transaction;
import com.carrentalpvt.carpvt.repository.PayoutRepository;
import com.carrentalpvt.carpvt.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    public PayoutService(
            PayoutRepository payoutRepository,
            TransactionRepository transactionRepository,
            NotificationService notificationService) {

        this.payoutRepository = payoutRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
    }

    // ==========================================
    // 1. CREATE PAYOUT ON BOOKING COMPLETION
    // ==========================================

    public Payout createPayout(Booking booking, Transaction transaction) {
        if (payoutRepository.findByBookingId(booking.getId()).isPresent()) {
            return payoutRepository.findByBookingId(booking.getId()).get();
        }

        double totalAmount = booking.getTotalAmount();
        double platformCommission = totalAmount * 0.15;
        double ownerEarning = totalAmount - platformCommission;

        Payout payout = Payout.builder()
                .ownerId(booking.getOwnerId())
                .bookingId(booking.getId())
                .carId(booking.getCarId())
                .totalAmount(totalAmount)
                .platformCommission(platformCommission)
                .ownerEarning(ownerEarning)
                .status("PENDING")
                .payoutMethod("UPI")
                .createdAt(LocalDateTime.now())
                .build();

        return payoutRepository.save(payout);
    }

    // ==========================================
    // 2. GET OWNER EARNINGS & PAYOUT SUMMARY
    // ==========================================

    public OwnerEarningsSummaryResponse getOwnerEarningsSummary(String ownerId) {
        List<Payout> payouts = payoutRepository.findByOwnerId(ownerId);
        List<Transaction> transactions = transactionRepository.findByOwnerId(ownerId);

        double totalBookingAmount = transactions.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus()))
                .mapToDouble(Transaction::getTotalAmount)
                .sum();

        double totalPlatformCommission = totalBookingAmount * 0.15;
        double totalOwnerEarnings = totalBookingAmount - totalPlatformCommission;

        double pendingPayout = payouts.stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .mapToDouble(Payout::getOwnerEarning)
                .sum();

        double paidPayout = payouts.stream()
                .filter(p -> "PAID".equals(p.getStatus()))
                .mapToDouble(Payout::getOwnerEarning)
                .sum();

        long completedTrips = transactions.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus()))
                .count();

        return OwnerEarningsSummaryResponse.builder()
                .totalBookingAmount(totalBookingAmount)
                .totalPlatformCommission(totalPlatformCommission)
                .totalOwnerEarnings(totalOwnerEarnings)
                .pendingPayout(pendingPayout)
                .paidPayout(paidPayout)
                .completedTrips(completedTrips)
                .payouts(payouts)
                .transactions(transactions)
                .build();
    }

    public List<Payout> getOwnerPayouts(String ownerId) {
        return payoutRepository.findByOwnerId(ownerId);
    }

    public List<Transaction> getOwnerTransactions(String ownerId) {
        return transactionRepository.findByOwnerId(ownerId);
    }

    // ==========================================
    // 3. ADMIN PAYOUT MANAGEMENT
    // ==========================================

    public List<Payout> getPendingPayouts() {
        return payoutRepository.findByStatus("PENDING");
    }

    public List<Payout> getAllPayouts() {
        return payoutRepository.findAll();
    }

    public Payout processPayout(
            String payoutId,
            String adminId,
            String payoutReference,
            String notes) {

        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout record not found: " + payoutId));

        if (!"PENDING".equals(payout.getStatus())) {
            throw new IllegalStateException("Payout is already processed or rejected. Current status: " + payout.getStatus());
        }

        String ref = payoutReference != null ? payoutReference.trim() : "BANK_TRANSFER";

        payout.setStatus("PAID");
        payout.setProcessedBy(adminId);
        payout.setProcessedAt(LocalDateTime.now());
        payout.setPayoutReference(ref);
        payout.setNotes(notes);

        Payout saved = payoutRepository.save(payout);

        // Notify Owner
        notificationService.sendNotification(
                payout.getOwnerId(),
                "Payout Settled! (₹" + payout.getOwnerEarning() + ")",
                "Your payout of ₹" + payout.getOwnerEarning() + " for booking #" + payout.getBookingId().substring(Math.max(0, payout.getBookingId().length() - 6)) + " has been transferred. Reference: " + ref + ".",
                "PAYOUT_SETTLED",
                payout.getId()
        );

        return saved;
    }
}
