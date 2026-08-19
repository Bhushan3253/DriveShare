package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.repository.CarRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminCarService {

    private final CarRepository carRepository;
    private final NotificationService notificationService;

    public AdminCarService(
            CarRepository carRepository,
            NotificationService notificationService) {

        this.carRepository = carRepository;
        this.notificationService = notificationService;
    }

    // ==========================================
    // 1. GET ALL CARS (OPTIONAL STATUS FILTER)
    // ==========================================

    public List<Car> getAllCars(String status) {
        if (status != null && !status.trim().isEmpty()) {
            return carRepository.findByStatus(status.trim().toUpperCase());
        }
        return carRepository.findAll();
    }

    // ==========================================
    // 2. GET CAR BY ID
    // ==========================================

    public Car getCarById(String carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found: " + carId));
    }

    // ==========================================
    // 3. APPROVE CAR
    // ==========================================

    public Car approveCar(String carId, String adminId) {
        Car car = getCarById(carId);

        car.setStatus("APPROVED");
        car.setActive(true);
        car.setReviewedBy(adminId);
        car.setReviewedAt(LocalDateTime.now());
        car.setRejectionReason(null);
        car.setBlockReason(null);

        Car savedCar = carRepository.save(car);

        // Notify Owner
        notificationService.sendNotification(
                car.getOwnerId(),
                "Car Listing Approved!",
                "Your " + car.getBrand() + " " + car.getModel() + " (" + car.getYear() + ") has been approved and is now live for bookings.",
                "CAR_APPROVED",
                car.getId()
        );

        return savedCar;
    }

    // ==========================================
    // 4. REJECT CAR (WITH REASON)
    // ==========================================

    public Car rejectCar(String carId, String adminId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        Car car = getCarById(carId);

        car.setStatus("REJECTED");
        car.setActive(false);
        car.setRejectionReason(reason.trim());
        car.setReviewedBy(adminId);
        car.setReviewedAt(LocalDateTime.now());

        Car savedCar = carRepository.save(car);

        // Notify Owner
        notificationService.sendNotification(
                car.getOwnerId(),
                "Car Listing Rejected",
                "Your " + car.getBrand() + " " + car.getModel() + " listing was rejected. Reason: " + reason.trim(),
                "CAR_REJECTED",
                car.getId()
        );

        return savedCar;
    }

    // ==========================================
    // 5. BLOCK CAR
    // ==========================================

    public Car blockCar(String carId, String adminId, String reason) {
        Car car = getCarById(carId);

        String blockReason = (reason != null && !reason.trim().isEmpty())
                ? reason.trim()
                : "Temporarily blocked by platform administrator";

        car.setStatus("BLOCKED");
        car.setActive(false);
        car.setBlockReason(blockReason);
        car.setReviewedBy(adminId);
        car.setReviewedAt(LocalDateTime.now());

        Car savedCar = carRepository.save(car);

        // Notify Owner
        notificationService.sendNotification(
                car.getOwnerId(),
                "Car Listing Blocked",
                "Your " + car.getBrand() + " " + car.getModel() + " has been blocked. Reason: " + blockReason,
                "CAR_BLOCKED",
                car.getId()
        );

        return savedCar;
    }

    // ==========================================
    // 6. UNBLOCK CAR
    // ==========================================

    public Car unblockCar(String carId, String adminId) {
        Car car = getCarById(carId);

        car.setStatus("APPROVED");
        car.setActive(true);
        car.setBlockReason(null);
        car.setReviewedBy(adminId);
        car.setReviewedAt(LocalDateTime.now());

        Car savedCar = carRepository.save(car);

        // Notify Owner
        notificationService.sendNotification(
                car.getOwnerId(),
                "Car Listing Unblocked",
                "Your " + car.getBrand() + " " + car.getModel() + " is now unblocked and active for rentals.",
                "CAR_UNBLOCKED",
                car.getId()
        );

        return savedCar;
    }
}
