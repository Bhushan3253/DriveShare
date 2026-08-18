package com.carrentalpvt.carpvt.repository;

import com.carrentalpvt.carpvt.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends MongoRepository<Payment, String> {

    Optional<Payment> findByBookingId(String bookingId);

    List<Payment> findByStatus(String status);

    Optional<Payment> findByUtrNumber(String utrNumber);
}