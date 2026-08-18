package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.PaymentRejectionRequest;
import com.carrentalpvt.carpvt.dto.UPIPaymentResponse;
import com.carrentalpvt.carpvt.dto.UTRRequest;
import com.carrentalpvt.carpvt.model.Payment;
import com.carrentalpvt.carpvt.service.UPIPaymentService;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/upi")
public class UPIPaymentController {

        private final UPIPaymentService upiPaymentService;

        public UPIPaymentController(
                        UPIPaymentService upiPaymentService) {

                this.upiPaymentService = upiPaymentService;
        }

        // ==========================================
        // 1. CREATE UPI PAYMENT / QR CODE
        // ==========================================

        @PostMapping("/create")
        public UPIPaymentResponse createPayment(
                        @RequestParam String bookingId,
                        Authentication authentication) {

                String userId = authentication.getName();

                return upiPaymentService.createUPIPayment(
                                bookingId,
                                userId);
        }

        // ==========================================
        // 2. SUBMIT UTR
        // ==========================================

        @PostMapping("/{paymentId}/utr")
        public Payment submitUTR(
                        @PathVariable String paymentId,
                        @RequestBody UTRRequest request,
                        Authentication authentication) {

                String userId = authentication.getName();

                return upiPaymentService.submitUTR(
                                paymentId,
                                userId,
                                request);
        }

        // ==========================================
        // 3. GET PENDING PAYMENTS (ADMIN)
        // ==========================================

        @GetMapping("/admin/pending")
        public List<Payment> getPendingPayments() {
                return upiPaymentService.getPendingPayments();
        }

        // ==========================================
        // 4. ADMIN VERIFY PAYMENT
        // ==========================================

        @PutMapping("/admin/{paymentId}/verify")
        public Payment verifyPayment(
                        @PathVariable String paymentId,
                        Authentication authentication) {

                String adminId = authentication.getName();

                return upiPaymentService.verifyPayment(
                                paymentId,
                                adminId);
        }

        // ==========================================
        // 4. ADMIN REJECT PAYMENT
        // ==========================================

        @PutMapping("/admin/{paymentId}/reject")
        public Payment rejectPayment(
                        @PathVariable String paymentId,
                        @RequestBody PaymentRejectionRequest request,
                        Authentication authentication) {

                String adminId = authentication.getName();

                return upiPaymentService.rejectPayment(
                                paymentId,
                                adminId,
                                request.getReason());
        }
}