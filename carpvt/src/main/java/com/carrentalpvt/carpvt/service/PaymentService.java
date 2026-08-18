package com.carrentalpvt.carpvt.service;


import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Payment;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.PaymentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final TransactionService transactionService;

  
    public PaymentService(
        PaymentRepository paymentRepository,
        BookingRepository bookingRepository,
        TransactionService transactionService) {

    this.paymentRepository = paymentRepository;
    this.bookingRepository = bookingRepository;
    this.transactionService =
            transactionService;
}

    public Payment createPayment(
            String bookingId,
            String userId,
            String paymentMethod) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        // Make sure booking belongs to logged-in user
        if (!booking.getRenterId().equals(userId)) {
                        throw new AccessDeniedException(
                    "You cannot pay for this booking");
        }

        if (!booking.getPaymentStatus()
                .equals("PENDING")) {

                        throw new IllegalStateException(
                    "Payment already processed");
        }

        Payment payment = new Payment();

        payment.setBookingId(bookingId);
        payment.setUserId(userId);
        payment.setAmount(
                booking.getTotalAmount());

        payment.setPaymentMethod(paymentMethod);

        payment.setTransactionId(
                UUID.randomUUID().toString());

        payment.setStatus("PENDING");

        payment.setCreatedAt(
                LocalDateTime.now());

        return paymentRepository.save(payment);
    }
    public Payment verifyPayment(String paymentId) {

    Payment payment = paymentRepository
            .findById(paymentId)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Payment not found"));

    if (payment.getStatus().equals("SUCCESS")) {
        throw new IllegalStateException(
                "Payment already completed");
    }

    payment.setStatus("SUCCESS");

    Payment savedPayment =
            paymentRepository.save(payment);

    // Update booking
    Booking booking = bookingRepository
            .findById(payment.getBookingId())
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Booking not found"));

    booking.setPaymentStatus("PAID");
    booking.setStatus("CONFIRMED");

    bookingRepository.save(booking);
        transactionService.createTransaction(booking);

    return savedPayment;
}
}