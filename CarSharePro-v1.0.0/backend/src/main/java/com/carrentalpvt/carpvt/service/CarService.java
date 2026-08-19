package com.carrentalpvt.carpvt.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.geo.GeoResult;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.NearQuery;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.carrentalpvt.carpvt.dto.NearbyCarResponse;
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
    private final MongoTemplate mongoTemplate;

    public CarService(
            CarRepository carRepository,
            CloudinaryService cloudinaryService,
            CarAvailabilityRepository availabilityRepository,
            BookingRepository bookingRepository,
            MongoTemplate mongoTemplate) {

        this.carRepository = carRepository;
        this.cloudinaryService = cloudinaryService;
        this.availabilityRepository = availabilityRepository;
        this.bookingRepository = bookingRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Car addCar(Car car) {
        if (car.getRegistrationNumber() == null || car.getRegistrationNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle registration number is required.");
        }

        String normalizedReg = car.getRegistrationNumber().trim().toUpperCase().replaceAll("\\s+", " ");
        if (carRepository.existsByRegistrationNumber(normalizedReg)) {
            throw new IllegalArgumentException("A vehicle with registration number '" + normalizedReg + "' is already registered in the system.");
        }
        car.setRegistrationNumber(normalizedReg);

        // Synchronize and validate geographic coordinates
        if (car.getLatitude() != null && car.getLongitude() != null) {
            validateCoordinates(car.getLatitude(), car.getLongitude());
            car.setCoordinates(new GeoJsonPoint(car.getLongitude(), car.getLatitude()));
        } else if (car.getCoordinates() != null) {
            validateCoordinates(car.getCoordinates().getY(), car.getCoordinates().getX());
            car.setLatitude(car.getCoordinates().getY());
            car.setLongitude(car.getCoordinates().getX());
        }

        if (car.getLocationName() == null && car.getLocation() != null) {
            car.setLocationName(car.getLocation());
        } else if (car.getLocation() == null && car.getLocationName() != null) {
            car.setLocation(car.getLocationName());
        }

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
    // GEOSPATIAL NEARBY CAR DISCOVERY
    // ==========================================

    public List<NearbyCarResponse> findNearbyCars(
            Double latitude,
            Double longitude,
            Double radiusKm,
            LocalDate startDate,
            LocalDate endDate,
            String brand,
            String type,
            String fuelType,
            String transmission,
            Double minPrice,
            Double maxPrice,
            String currentUserId) {

        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Latitude and longitude query parameters are required for nearby car discovery.");
        }

        validateCoordinates(latitude, longitude);

        double effectiveRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 10.0;
        if (effectiveRadius > 500.0) {
            throw new IllegalArgumentException("Search radius cannot exceed 500 km.");
        }

        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("startDate cannot be after endDate.");
        }

        Point searchPoint = new Point(longitude, latitude);

        // 1. Query MongoDB 2dsphere index within radius for APPROVED & ACTIVE vehicles
        NearQuery nearQuery = NearQuery.near(searchPoint, Metrics.KILOMETERS)
                .maxDistance(effectiveRadius)
                .query(new Query(Criteria.where("status").is("APPROVED").and("active").is(true)));

        GeoResults<Car> geoResults;
        try {
            geoResults = mongoTemplate.geoNear(nearQuery, Car.class);
        } catch (Exception e) {
            // Fallback: If 2dsphere index is still building or empty, fetch approved cars and filter by Haversine distance
            List<Car> approvedCars = carRepository.findByStatusAndActive("APPROVED", true);
            List<GeoResult<Car>> fallbackList = new ArrayList<>();
            for (Car car : approvedCars) {
                if (car.getLatitude() != null && car.getLongitude() != null) {
                    double dist = calculateHaversineDistanceKm(latitude, longitude, car.getLatitude(), car.getLongitude());
                    if (dist <= effectiveRadius) {
                        fallbackList.add(new GeoResult<>(car, new org.springframework.data.geo.Distance(dist, Metrics.KILOMETERS)));
                    }
                }
            }
            fallbackList.sort((a, b) -> Double.compare(a.getDistance().getValue(), b.getDistance().getValue()));
            geoResults = new GeoResults<>(fallbackList);
        }

        LocalDateTime now = LocalDateTime.now();
        List<NearbyCarResponse> results = new ArrayList<>();

        for (GeoResult<Car> result : geoResults) {
            Car car = result.getContent();
            double distanceKm = result.getDistance().getValue();

            // Renter cannot book their own car
            if (currentUserId != null && currentUserId.equals(car.getOwnerId())) {
                continue;
            }

            // Filters
            if (brand != null && !brand.trim().isEmpty() && (car.getBrand() == null || !car.getBrand().equalsIgnoreCase(brand.trim()))) {
                continue;
            }
            if (type != null && !type.trim().isEmpty() && (car.getType() == null || !car.getType().equalsIgnoreCase(type.trim()))) {
                continue;
            }
            if (fuelType != null && !fuelType.trim().isEmpty() && (car.getFuelType() == null || !car.getFuelType().equalsIgnoreCase(fuelType.trim()))) {
                continue;
            }
            if (transmission != null && !transmission.trim().isEmpty() && (car.getTransmission() == null || !car.getTransmission().equalsIgnoreCase(transmission.trim()))) {
                continue;
            }
            if (minPrice != null && car.getPricePerDay() < minPrice) {
                continue;
            }
            if (maxPrice != null && car.getPricePerDay() > maxPrice) {
                continue;
            }

            // Date-based availability & conflict check
            if (startDate != null && endDate != null) {
                // Check owner availability window
                List<CarAvailability> availabilities = availabilityRepository.findByCarId(car.getId());
                boolean isCovered = availabilities.stream().anyMatch(a ->
                        !startDate.isBefore(a.getStartDate()) && !endDate.isAfter(a.getEndDate())
                );
                if (!isCovered) {
                    continue;
                }

                // Check active booking conflicts
                List<Booking> bookings = bookingRepository.findByCarId(car.getId());
                boolean hasConflict = bookings.stream()
                        .filter(b -> isBookingActive(b, now))
                        .anyMatch(b -> !startDate.isAfter(b.getEndDate()) && !endDate.isBefore(b.getStartDate()));

                if (hasConflict) {
                    continue;
                }
            }

            NearbyCarResponse resp = NearbyCarResponse.builder()
                    .id(car.getId())
                    .ownerId(car.getOwnerId())
                    .brand(car.getBrand())
                    .model(car.getModel())
                    .year(car.getYear())
                    .type(car.getType())
                    .fuelType(car.getFuelType())
                    .transmission(car.getTransmission())
                    .seats(car.getSeats())
                    .pricePerDay(car.getPricePerDay())
                    .location(car.getLocation())
                    .locationName(car.getLocationName())
                    .latitude(car.getLatitude())
                    .longitude(car.getLongitude())
                    .distanceKm(Math.round(distanceKm * 10.0) / 10.0)
                    .imageUrl(car.getImageUrl())
                    .images(car.getImages())
                    .averageRating(car.getAverageRating())
                    .reviewCount(car.getReviewCount())
                    .available(true)
                    .status(car.getStatus())
                    .active(car.isActive())
                    .description(car.getDescription())
                    .verified(car.getRcDocUrl() != null && !car.getRcDocUrl().isEmpty())
                    .build();

            results.add(resp);
        }

        return results;
    }

    public void validateCoordinates(Double latitude, Double longitude) {
        if (latitude != null || longitude != null) {
            if (latitude == null || longitude == null) {
                throw new IllegalArgumentException("Both latitude and longitude must be provided together.");
            }
            if (latitude < -90.0 || latitude > 90.0) {
                throw new IllegalArgumentException("Latitude must be between -90 and 90 degrees. Received: " + latitude);
            }
            if (longitude < -180.0 || longitude > 180.0) {
                throw new IllegalArgumentException("Longitude must be between -180 and 180 degrees. Received: " + longitude);
            }
        }
    }

    private boolean isBookingActive(Booking b, LocalDateTime now) {
        if ("CANCELLED".equals(b.getStatus()) || "REJECTED".equals(b.getStatus())) {
            return false;
        }

        if ("PAYMENT_PENDING".equals(b.getStatus())) {
            if ((b.getUtrNumber() == null || b.getUtrNumber().trim().isEmpty())
                    && b.getExpiresAt() != null
                    && b.getExpiresAt().isBefore(now)) {
                return false;
            }
        }

        return true;
    }

    public static double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
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

    // ==========================================
    // CAR DETAILS UPDATE
    // ==========================================

    public Car updateCar(String carId, Car updatedData, String userId, boolean isAdmin) {
        Car car = getCarById(carId);

        if (!isAdmin && !car.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to edit this car listing");
        }

        if (updatedData.getRegistrationNumber() != null && !updatedData.getRegistrationNumber().trim().isEmpty()) {
            String normalizedReg = updatedData.getRegistrationNumber().trim().toUpperCase().replaceAll("\\s+", " ");
            if (!normalizedReg.equalsIgnoreCase(car.getRegistrationNumber())) {
                Optional<Car> existing = carRepository.findByRegistrationNumber(normalizedReg);
                if (existing.isPresent() && !existing.get().getId().equals(carId)) {
                    throw new IllegalArgumentException("A vehicle with registration number '" + normalizedReg + "' is already registered.");
                }
                car.setRegistrationNumber(normalizedReg);
            }
        }

        if (updatedData.getBrand() != null) car.setBrand(updatedData.getBrand());
        if (updatedData.getModel() != null) car.setModel(updatedData.getModel());
        if (updatedData.getYear() > 0) car.setYear(updatedData.getYear());
        if (updatedData.getType() != null) car.setType(updatedData.getType());
        if (updatedData.getFuelType() != null) car.setFuelType(updatedData.getFuelType());
        if (updatedData.getTransmission() != null) car.setTransmission(updatedData.getTransmission());
        if (updatedData.getSeats() > 0) car.setSeats(updatedData.getSeats());
        if (updatedData.getPricePerDay() > 0) car.setPricePerDay(updatedData.getPricePerDay());
        if (updatedData.getLocation() != null) car.setLocation(updatedData.getLocation());
        if (updatedData.getLocationName() != null) car.setLocationName(updatedData.getLocationName());
        
        if (updatedData.getLatitude() != null && updatedData.getLongitude() != null) {
            validateCoordinates(updatedData.getLatitude(), updatedData.getLongitude());
            car.setLatitude(updatedData.getLatitude());
            car.setLongitude(updatedData.getLongitude());
            car.setCoordinates(new GeoJsonPoint(updatedData.getLongitude(), updatedData.getLatitude()));
        } else if (updatedData.getCoordinates() != null) {
            validateCoordinates(updatedData.getCoordinates().getY(), updatedData.getCoordinates().getX());
            car.setCoordinates(updatedData.getCoordinates());
            car.setLatitude(updatedData.getCoordinates().getY());
            car.setLongitude(updatedData.getCoordinates().getX());
        }

        if (updatedData.getDescription() != null) car.setDescription(updatedData.getDescription());
        if (updatedData.getChassisNumber() != null) car.setChassisNumber(updatedData.getChassisNumber());
        if (updatedData.getInsurancePolicyNumber() != null) car.setInsurancePolicyNumber(updatedData.getInsurancePolicyNumber());
        if (updatedData.getInsuranceExpiry() != null) car.setInsuranceExpiry(updatedData.getInsuranceExpiry());
        if (updatedData.getPucExpiry() != null) car.setPucExpiry(updatedData.getPucExpiry());

        // If car was previously rejected, re-submitting sets it back to PENDING for admin review
        if ("REJECTED".equals(car.getStatus())) {
            car.setStatus("PENDING");
            car.setActive(false);
            car.setRejectionReason(null);
        }

        car.setUpdatedAt(LocalDateTime.now());
        return carRepository.save(car);
    }

    // ==========================================
    // VEHICLE COMPLIANCE DOCUMENTS MANAGEMENT
    // ==========================================

    public Car uploadCarDocument(String carId, String ownerId, String docType, MultipartFile file) {
        Car car = getCarById(carId);

        if (!car.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("You are not authorized to upload documents for this car");
        }

        if (docType == null || docType.trim().isEmpty()) {
            throw new IllegalArgumentException("Document type (RC, INSURANCE, or PUC) is required");
        }

        String type = docType.trim().toUpperCase();
        Map<String, String> uploadResult = cloudinaryService.uploadDocument(file, "documents");
        String url = uploadResult.get("url");
        String publicId = uploadResult.get("publicId");

        switch (type) {
            case "RC":
                if (car.getRcDocPublicId() != null) {
                    try { cloudinaryService.deleteImage(car.getRcDocPublicId()); } catch (Exception ignored) {}
                }
                car.setRcDocUrl(url);
                car.setRcDocPublicId(publicId);
                break;
            case "INSURANCE":
                if (car.getInsuranceDocPublicId() != null) {
                    try { cloudinaryService.deleteImage(car.getInsuranceDocPublicId()); } catch (Exception ignored) {}
                }
                car.setInsuranceDocUrl(url);
                car.setInsuranceDocPublicId(publicId);
                break;
            case "PUC":
                if (car.getPucDocPublicId() != null) {
                    try { cloudinaryService.deleteImage(car.getPucDocPublicId()); } catch (Exception ignored) {}
                }
                car.setPucDocUrl(url);
                car.setPucDocPublicId(publicId);
                break;
            default:
                throw new IllegalArgumentException("Unsupported document type: " + docType + ". Must be RC, INSURANCE, or PUC.");
        }

        car.setUpdatedAt(LocalDateTime.now());
        return carRepository.save(car);
    }

    public Car deleteCarDocument(String carId, String ownerId, String docType) {
        Car car = getCarById(carId);

        if (!car.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("You are not authorized to delete documents for this car");
        }

        String type = docType != null ? docType.trim().toUpperCase() : "";
        switch (type) {
            case "RC":
                if (car.getRcDocPublicId() != null) {
                    cloudinaryService.deleteImage(car.getRcDocPublicId());
                    car.setRcDocUrl(null);
                    car.setRcDocPublicId(null);
                }
                break;
            case "INSURANCE":
                if (car.getInsuranceDocPublicId() != null) {
                    cloudinaryService.deleteImage(car.getInsuranceDocPublicId());
                    car.setInsuranceDocUrl(null);
                    car.setInsuranceDocPublicId(null);
                }
                break;
            case "PUC":
                if (car.getPucDocPublicId() != null) {
                    cloudinaryService.deleteImage(car.getPucDocPublicId());
                    car.setPucDocUrl(null);
                    car.setPucDocPublicId(null);
                }
                break;
            default:
                throw new IllegalArgumentException("Unsupported document type: " + docType);
        }

        car.setUpdatedAt(LocalDateTime.now());
        return carRepository.save(car);
    }
}
