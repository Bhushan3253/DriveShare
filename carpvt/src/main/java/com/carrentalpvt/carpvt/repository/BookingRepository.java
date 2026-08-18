package com.carrentalpvt.carpvt.repository;

import com.carrentalpvt.carpvt.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByCarId(String carId);

    List<Booking> findByRenterId(String renterId);

    List<Booking> findByOwnerId(String ownerId);

    List<Booking> findByStatus(String status);

    List<Booking> findByStatusAndExpiresAtBefore(String status, LocalDateTime time);

    List<Booking> findByCarIdAndStatusIn(String carId, List<String> statuses);

    boolean existsByCarIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            String carId,
            LocalDate endDate,
            LocalDate startDate
    );
}
