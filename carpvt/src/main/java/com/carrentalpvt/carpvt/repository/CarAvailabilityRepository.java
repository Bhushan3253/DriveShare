package com.carrentalpvt.carpvt.repository;

import com.carrentalpvt.carpvt.model.CarAvailability;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CarAvailabilityRepository
        extends MongoRepository<CarAvailability, String> {

    List<CarAvailability> findByCarId(String carId);

    List<CarAvailability> findByOwnerId(String ownerId);

    void deleteByCarId(String carId);
}
