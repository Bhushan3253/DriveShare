package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Transaction;
import com.carrentalpvt.carpvt.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TransactionService {

    private static final double COMMISSION = 15.0;

    private final TransactionRepository transactionRepository;

    public TransactionService(
            TransactionRepository transactionRepository) {

        this.transactionRepository = transactionRepository;
    }

    public Transaction createTransaction(Booking booking) {
        if (transactionRepository
                .findByBookingId(booking.getId())
                .isPresent()) {

            throw new IllegalStateException("Transaction already exists for this booking");
        }

        double total = booking.getTotalAmount();
        double platformCommission = total * COMMISSION / 100;
        double ownerEarning = total - platformCommission;

        Transaction transaction = new Transaction();
        transaction.setBookingId(booking.getId());
        transaction.setCarId(booking.getCarId());
        transaction.setOwnerId(booking.getOwnerId());
        transaction.setRenterId(booking.getRenterId());
        transaction.setTotalAmount(total);
        transaction.setCommissionPercentage(COMMISSION);
        transaction.setPlatformCommission(platformCommission);
        transaction.setOwnerEarning(ownerEarning);
        transaction.setStatus("PENDING");
        transaction.setCreatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    public Transaction completeTransaction(String bookingId) {
        Transaction transaction = transactionRepository
                .findByBookingId(bookingId)
                .orElse(null);

        if (transaction != null) {
            transaction.setStatus("COMPLETED");
            transaction.setCompletedAt(LocalDateTime.now());
            return transactionRepository.save(transaction);
        }
        return null;
    }
}