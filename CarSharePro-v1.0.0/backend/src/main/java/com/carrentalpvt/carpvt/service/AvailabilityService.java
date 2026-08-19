package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.CarAvailability;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.CarAvailabilityRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AvailabilityService {

    private final CarAvailabilityRepository availabilityRepository;
    private final CarService carService;
    private final BookingRepository bookingRepository;

    public AvailabilityService(
            CarAvailabilityRepository availabilityRepository,
            CarService carService,
            BookingRepository bookingRepository) {

        this.availabilityRepository = availabilityRepository;
        this.carService = carService;
        this.bookingRepository = bookingRepository;
    }

    // ==========================================
    // 1. ADD AVAILABILITY WINDOW (OWNER)
    // ==========================================

    public CarAvailability addAvailability(
            String carId,
            String ownerId,
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot set availability for past dates");
        }

        Car car = carService.getCarById(carId);

        if (!car.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("You are not the owner of this car");
        }

        CarAvailability availability = new CarAvailability();
        availability.setCarId(carId);
        availability.setOwnerId(ownerId);
        availability.setStartDate(startDate);
        availability.setEndDate(endDate);
        availability.setAvailable(true);
        availability.setCreatedAt(LocalDateTime.now());

        return availabilityRepository.save(availability);
    }

    // ==========================================
    // 2. REMOVE AVAILABILITY WINDOW (OWNER)
    // ==========================================

    public void removeAvailability(String availabilityId, String ownerId) {
        CarAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability record not found: " + availabilityId));

        if (!availability.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("You are not authorized to delete this availability window");
        }

        // Prevent removing dates that already have active bookings
        List<Booking> bookings = bookingRepository.findByCarId(availability.getCarId());
        boolean hasActiveBooking = bookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()) && !"REJECTED".equals(b.getStatus()))
                .anyMatch(b -> !b.getStartDate().isAfter(availability.getEndDate())
                        && !b.getEndDate().isBefore(availability.getStartDate()));

        if (hasActiveBooking) {
            throw new IllegalStateException("Cannot remove availability for dates that already have active bookings");
        }

        availabilityRepository.deleteById(availabilityId);
    }

    // ==========================================
    // 3. GET AVAILABILITY QUERIES
    // ==========================================

    public List<CarAvailability> getAvailability(String carId) {
        return availabilityRepository.findByCarId(carId);
    }

    public List<CarAvailability> getAvailabilityByOwner(String ownerId) {
        return availabilityRepository.findByOwnerId(ownerId);
    }

    public boolean isCarAvailable(String carId, LocalDate startDate, LocalDate endDate) {
        List<CarAvailability> availabilities = availabilityRepository.findByCarId(carId);

        return availabilities.stream().anyMatch(a ->
                !startDate.isBefore(a.getStartDate()) && !endDate.isAfter(a.getEndDate())
        );
    }
}