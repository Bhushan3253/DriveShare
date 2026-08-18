package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.UPIPaymentResponse;
import com.carrentalpvt.carpvt.dto.UTRRequest;
import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Payment;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.PaymentRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UPIPaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final QRCodeService qrCodeService;
    private final TransactionService transactionService;
    private final NotificationService notificationService;

    @Value("${payment.upi.id}")
    private String upiId;

    @Value("${payment.upi.name}")
    private String upiName;

    public UPIPaymentService(
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            QRCodeService qrCodeService,
            TransactionService transactionService,
            NotificationService notificationService) {

        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.qrCodeService = qrCodeService;
        this.transactionService = transactionService;
        this.notificationService = notificationService;
    }

    // ==========================================
    // 1. CREATE UPI PAYMENT
    // ==========================================

    public UPIPaymentResponse createUPIPayment(
            String bookingId,
            String userId) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getRenterId().equals(userId)) {
            throw new AccessDeniedException("You cannot pay for this booking");
        }

        if ("CANCELLED".equals(booking.getStatus()) || "EXPIRED".equals(booking.getPaymentStatus())) {
            throw new IllegalStateException("This booking reservation has expired or been cancelled. Please book again.");
        }

        if (!"PENDING".equals(booking.getPaymentStatus())) {
            throw new IllegalStateException("Payment already processed or under review");
        }

        double amount = booking.getTotalAmount();

        Payment payment = paymentRepository.findByBookingId(bookingId).orElseGet(() -> {
            Payment newPayment = new Payment();
            newPayment.setBookingId(bookingId);
            newPayment.setUserId(userId);
            newPayment.setAmount(amount);
            newPayment.setPaymentMethod("UPI");
            newPayment.setStatus("PENDING");
            newPayment.setCreatedAt(LocalDateTime.now());
            return paymentRepository.save(newPayment);
        });

        String upiUri = "upi://pay"
                + "?pa=" + encode(upiId)
                + "&pn=" + encode(upiName)
                + "&am=" + amount
                + "&cu=INR"
                + "&tn=" + encode("Car Rental Booking " + bookingId);

        String qrCode;
        try {
            qrCode = qrCodeService.generateQRCode(upiUri);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }

        return new UPIPaymentResponse(
                payment.getId(),
                bookingId,
                amount,
                upiUri,
                qrCode);
    }

    // ==========================================
    // 2. SUBMIT UTR
    // ==========================================

    public Payment submitUTR(
            String paymentId,
            String userId,
            UTRRequest request) {

        Payment payment = paymentRepository
                .findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getUserId().equals(userId)) {
            throw new AccessDeniedException("You cannot update this payment");
        }

        if (!"PENDING".equals(payment.getStatus())) {
            throw new IllegalStateException("Payment cannot be updated. Current status: " + payment.getStatus());
        }

        if (request == null || request.getUtrNumber() == null || request.getUtrNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("UTR number is required");
        }

        String utr = request.getUtrNumber().trim();

        if (paymentRepository.findByUtrNumber(utr).isPresent()) {
            throw new IllegalStateException("This UTR has already been submitted for verification");
        }

        payment.setUtrNumber(utr);
        payment.setStatus("PENDING_VERIFICATION");
        payment.setSubmittedAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        bookingRepository.findById(payment.getBookingId()).ifPresent(b -> {
            b.setUtrNumber(utr);
            bookingRepository.save(b);

            // Notify Owner
            notificationService.sendNotification(
                    b.getOwnerId(),
                    "Payment UTR Submitted",
                    "Renter has submitted UTR (" + utr + ") for booking #" + b.getId().substring(Math.max(0, b.getId().length() - 6)) + ". Awaiting Admin verification.",
                    "UTR_SUBMITTED",
                    b.getId()
            );
        });

        return savedPayment;
    }

    // ==========================================
    // 3. GET PENDING PAYMENTS (ADMIN)
    // ==========================================

    public List<Payment> getPendingPayments() {
        return paymentRepository.findByStatus("PENDING_VERIFICATION");
    }

    // ==========================================
    // 4. ADMIN VERIFY PAYMENT
    // ==========================================

    public Payment verifyPayment(
            String paymentId,
            String adminId) {

        Payment payment = paymentRepository
                .findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!"PENDING_VERIFICATION".equals(payment.getStatus())) {
            throw new IllegalStateException("Payment is not waiting for verification");
        }

        if (payment.getUtrNumber() == null || payment.getUtrNumber().trim().isEmpty()) {
            throw new IllegalStateException("Payment does not have a valid UTR number");
        }

        payment.setStatus("SUCCESS");
        payment.setVerifiedBy(adminId);
        payment.setVerifiedAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // Update Booking
        Booking booking = bookingRepository
                .findById(payment.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + payment.getBookingId()));

        booking.setPaymentStatus("PAID");
        booking.setStatus("CONFIRMED");

        bookingRepository.save(booking);

        // Create transaction
        transactionService.createTransaction(booking);

        // Notify Renter
        notificationService.sendNotification(
                booking.getRenterId(),
                "Payment Verified & Booking Confirmed!",
                "Your UPI payment of ₹" + booking.getTotalAmount() + " is verified. Booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 6)) + " is now CONFIRMED.",
                "PAYMENT_VERIFIED",
                booking.getId()
        );

        // Notify Owner
        notificationService.sendNotification(
                booking.getOwnerId(),
                "Booking Confirmed!",
                "Payment for booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 6)) + " has been verified. Car is ready for check-in on " + booking.getStartDate() + ".",
                "PAYMENT_VERIFIED",
                booking.getId()
        );

        return savedPayment;
    }

    // ==========================================
    // 5. ADMIN REJECT PAYMENT
    // ==========================================

    public Payment rejectPayment(
            String paymentId,
            String adminId,
            String reason) {

        Payment payment = paymentRepository
                .findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!"PENDING_VERIFICATION".equals(payment.getStatus())) {
            throw new IllegalStateException("Payment is not waiting for verification");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        payment.setStatus("REJECTED");
        payment.setVerifiedBy(adminId);
        payment.setVerifiedAt(LocalDateTime.now());
        payment.setRejectionReason(reason.trim());

        Payment savedPayment = paymentRepository.save(payment);

        bookingRepository.findById(payment.getBookingId()).ifPresent(b -> {
            b.setStatus("CANCELLED");
            b.setPaymentStatus("REJECTED");
            b.setCancelledAt(LocalDateTime.now());
            b.setCancelledBy("ADMIN");
            b.setCancellationReason("Payment rejected by admin: " + reason.trim());
            bookingRepository.save(b);

            // Notify Renter
            notificationService.sendNotification(
                    b.getRenterId(),
                    "Payment Verification Rejected",
                    "Your payment for booking #" + b.getId().substring(Math.max(0, b.getId().length() - 6)) + " was rejected: " + reason.trim(),
                    "PAYMENT_REJECTED",
                    b.getId()
            );
        });

        return savedPayment;
    }

    // ==========================================
    // 6. ENCODE UPI DATA
    // ==========================================

    private String encode(String value) {
        if (value == null) return "";
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}