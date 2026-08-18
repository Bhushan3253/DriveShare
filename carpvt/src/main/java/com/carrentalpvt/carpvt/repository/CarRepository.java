package com.carrentalpvt.carpvt.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.carrentalpvt.carpvt.model.Car;

public interface CarRepository extends MongoRepository<Car, String> {
        List<Car> findByStatusAndActive(
            String status,
            boolean active);
        List<Car> findByOwnerId(String ownerId);

        List<Car> findByLocation(String location);

        List<Car> findByStatus(String status);

}
