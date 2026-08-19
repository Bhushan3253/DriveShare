package com.carrentalpvt.carpvt.repository;

import com.carrentalpvt.carpvt.model.Payout;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PayoutRepository extends MongoRepository<Payout, String> {

    List<Payout> findByOwnerId(String ownerId);

    List<Payout> findByStatus(String status);

    Optional<Payout> findByBookingId(String bookingId);

    List<Payout> findByOwnerIdAndStatus(String ownerId, String status);
}
