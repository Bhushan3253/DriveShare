package com.carrentalpvt.carpvt.repository;

import com.carrentalpvt.carpvt.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {

    Optional<Review> findByBookingId(String bookingId);

    boolean existsByBookingId(String bookingId);

    List<Review> findByCarId(String carId);

    List<Review> findByOwnerId(String ownerId);

    List<Review> findByRenterId(String renterId);
}
