package com.carrentalpvt.carpvt.repository;


import com.carrentalpvt.carpvt.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends MongoRepository<Transaction, String> {

    List<Transaction> findByOwnerId(String ownerId);

    List<Transaction> findByRenterId(String renterId);

    List<Transaction> findByStatus(String status);

   Optional<Transaction> findByBookingId(String bookingId);

}