package com.carrentalpvt.carpvt.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.CarAvailability;
import com.carrentalpvt.carpvt.model.CarImage;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.CarAvailabilityRepository;
import com.carrentalpvt.carpvt.repository.CarRepository;

@Service
public class CarService {

    private final CarRepository carRepository;
    private final CloudinaryService cloudinaryService;
    private final CarAvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;

    public CarService(
            CarRepository carRepository,
            CloudinaryService cloudinaryService,
            CarAvailabilityRepository availabilityRepository,
            BookingRepository bookingRepository) {

        this.carRepository = carRepository;
        this.cloudinaryService = cloudinaryService;
        this.availabilityRepository = availabilityRepository;
        this.bookingRepository = bookingRepository;
    }

    public Car addCar(Car car) {
        car.setStatus("PENDING");
        car.setActive(false);
        if (car.getImages() == null) {
            car.setImages(new ArrayList<>());
        }
        return carRepository.save(car);
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public Car getCarById(String id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found"));
    }

    public List<Car> getCarsByOwner(String ownerId) {
        return carRepository.findByOwnerId(ownerId);
    }

    public List<Car> getCarsByLocation(String location) {
        return carRepository.findByLocation(location);
    }

    public void deleteCar(String carId, String userId, boolean isAdmin) {
        Car car = getCarById(carId);
        if (!isAdmin && !car.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to delete this car");
        }

        List<Booking> bookings = bookingRepository.findByCarId(carId);
        boolean hasActiveBookings = bookings.stream()
                .anyMatch(b -> !"CANCELLED".equals(b.getStatus()) && !"REJECTED".equals(b.getStatus()) && !"COMPLETED".equals(b.getStatus()));

        if (hasActiveBookings) {
            throw new IllegalStateException("Cannot delete car with active reservations or ongoing rentals.");
        }

        availabilityRepository.deleteByCarId(carId);
        carRepository.deleteById(carId);
    }

    public Car approveCar(String id) {
        Car car = getCarById(id);
        car.setStatus("APPROVED");
        car.setActive(true);
        return carRepository.save(car);
    }

    public List<Car> getAvailableCars() {
        return carRepository.findByStatusAndActive("APPROVED", true);
    }

    // ==========================================
    // CAR SEARCH & ADVANCED FILTERING
    // ==========================================

    public List<Car> searchCars(
            String location,
            String brand,
            String type,
            String fuelType,
            String transmission,
            Double minPrice,
            Double maxPrice,
            LocalDate startDate,
            LocalDate endDate) {

        List<Car> approvedCars = carRepository.findByStatusAndActive("APPROVED", true);

        return approvedCars.stream()
                .filter(car -> {
                    if (location != null && !location.trim().isEmpty()) {
                        if (car.getLocation() == null || !car.getLocation().toLowerCase().contains(location.trim().toLowerCase())) {
                            return false;
                        }
                    }
                    if (brand != null && !brand.trim().isEmpty()) {
                        if (car.getBrand() == null || !car.getBrand().equalsIgnoreCase(brand.trim())) {
                            return false;
                        }
                    }
                    if (type != null && !type.trim().isEmpty()) {
                        if (car.getType() == null || !car.getType().equalsIgnoreCase(type.trim())) {
                            return false;
                        }
                    }
                    if (fuelType != null && !fuelType.trim().isEmpty()) {
                        if (car.getFuelType() == null || !car.getFuelType().equalsIgnoreCase(fuelType.trim())) {
                            return false;
                        }
                    }
                    if (transmission != null && !transmission.trim().isEmpty()) {
                        if (car.getTransmission() == null || !car.getTransmission().equalsIgnoreCase(transmission.trim())) {
                            return false;
                        }
                    }
                    if (minPrice != null && car.getPricePerDay() < minPrice) {
                        return false;
                    }
                    if (maxPrice != null && car.getPricePerDay() > maxPrice) {
                        return false;
                    }

                    // Date range availability filter
                    if (startDate != null && endDate != null) {
                        if (startDate.isAfter(endDate)) {
                            return false;
                        }

                        // 1. Check owner availability window
                        List<CarAvailability> availabilities = availabilityRepository.findByCarId(car.getId());
                        boolean isCovered = availabilities.stream().anyMatch(a ->
                                !startDate.isBefore(a.getStartDate()) && !endDate.isAfter(a.getEndDate())
                        );
                        if (!isCovered) {
                            return false;
                        }

                        // 2. Check no conflicting active bookings
                        List<Booking> bookings = bookingRepository.findByCarId(car.getId());
                        boolean hasConflict = bookings.stream()
                                .filter(b -> !"CANCELLED".equals(b.getStatus()) && !"REJECTED".equals(b.getStatus()))
                                .anyMatch(b -> !startDate.isAfter(b.getEndDate()) && !endDate.isBefore(b.getStartDate()));

                        if (hasConflict) {
                            return false;
                        }
                    }

                    return true;
                })
                .toList();
    }

    // ==========================================
    // CLOUDINARY CAR IMAGE MANAGEMENT
    // ==========================================

    public Car uploadCarImage(String carId, String ownerId, MultipartFile file) {
        Car car = getCarById(carId);

        if (!car.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("You are not authorized to modify images for this car");
        }

        Map<String, String> uploadResult = cloudinaryService.uploadImage(file);
        String url = uploadResult.get("url");
        String publicId = uploadResult.get("publicId");

        if (car.getImages() == null) {
            car.setImages(new ArrayList<>());
        }

        boolean isPrimary = car.getImages().isEmpty();
        CarImage carImage = new CarImage(url, publicId, isPrimary);
        car.getImages().add(carImage);

        if (isPrimary || car.getImageUrl() == null || car.getImageUrl().isEmpty()) {
            car.setImageUrl(url);
        }

        return carRepository.save(car);
    }

    public Car deleteCarImage(String carId, String publicId, String ownerId) {
        Car car = getCarById(carId);

        if (!car.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("You are not authorized to delete images from this car");
        }

        if (car.getImages() == null || car.getImages().isEmpty()) {
            throw new ResourceNotFoundException("No images found for this car");
        }

        CarImage imageToDelete = car.getImages().stream()
                .filter(img -> img.getPublicId().equals(publicId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Image with publicId not found: " + publicId));

        cloudinaryService.deleteImage(publicId);
        car.getImages().remove(imageToDelete);

        if (imageToDelete.isPrimary()) {
            if (!car.getImages().isEmpty()) {
                car.getImages().get(0).setPrimary(true);
                car.setImageUrl(car.getImages().get(0).getUrl());
            } else {
                car.setImageUrl(null);
            }
        }

        return carRepository.save(car);
    }

    public Car setPrimaryImage(String carId, String publicId, String ownerId) {
        Car car = getCarById(carId);

        if (!car.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("You are not authorized to update images for this car");
        }

        if (car.getImages() == null || car.getImages().isEmpty()) {
            throw new ResourceNotFoundException("No images found for this car");
        }

        boolean found = false;
        for (CarImage img : car.getImages()) {
            if (img.getPublicId().equals(publicId)) {
                img.setPrimary(true);
                car.setImageUrl(img.getUrl());
                found = true;
            } else {
                img.setPrimary(false);
            }
        }

        if (!found) {
            throw new ResourceNotFoundException("Image with publicId not found: " + publicId);
        }

        return carRepository.save(car);
    }
}
