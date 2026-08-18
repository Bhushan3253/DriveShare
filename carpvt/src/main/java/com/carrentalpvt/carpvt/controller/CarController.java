package com.carrentalpvt.carpvt.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.service.CarService;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping
    public Car addCar(
            @RequestBody Car car,
            Authentication authentication) {

        String ownerId = requireAuthenticatedUserId(authentication);
        car.setOwnerId(ownerId);
        return carService.addCar(car);
    }

    // Returns approved & active cars for public view
    @GetMapping
    public List<Car> getAllCars() {
        return carService.getAvailableCars();
    }

    // ==========================================
    // CAR SEARCH & FILTERING (PUBLIC)
    // ==========================================

    @GetMapping("/search")
    public List<Car> searchCars(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return carService.searchCars(location, brand, type, fuelType, transmission, minPrice, maxPrice, startDate, endDate);
    }

    @GetMapping("/{id}")
    public Car getCarById(@PathVariable String id) {
        return carService.getCarById(id);
    }

    @GetMapping("/owner/{ownerId}")
    public List<Car> getOwnerCars(@PathVariable String ownerId) {
        return carService.getCarsByOwner(ownerId);
    }

    @GetMapping("/location/{location}")
    public List<Car> getCarsByLocation(@PathVariable String location) {
        return carService.getCarsByLocation(location);
    }

    @DeleteMapping("/{id}")
    public String deleteCar(
            @PathVariable String id,
            Authentication authentication) {

        String userId = requireAuthenticatedUserId(authentication);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        carService.deleteCar(id, userId, isAdmin);
        return "Car deleted successfully";
    }

    @GetMapping("/available")
    public List<Car> getAvailableCars() {
        return carService.getAvailableCars();
    }

    // ==========================================
    // CLOUDINARY IMAGE MANAGEMENT ENDPOINTS
    // ==========================================

    @PostMapping("/{carId}/images")
    public Car uploadCarImage(
            @PathVariable String carId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String ownerId = requireAuthenticatedUserId(authentication);
        return carService.uploadCarImage(carId, ownerId, file);
    }

    @DeleteMapping("/{carId}/images")
    public Car deleteCarImage(
            @PathVariable String carId,
            @RequestParam String publicId,
            Authentication authentication) {

        String ownerId = requireAuthenticatedUserId(authentication);
        return carService.deleteCarImage(carId, publicId, ownerId);
    }

    @PutMapping("/{carId}/images/primary")
    public Car setPrimaryImage(
            @PathVariable String carId,
            @RequestParam String publicId,
            Authentication authentication) {

        String ownerId = requireAuthenticatedUserId(authentication);
        return carService.setPrimaryImage(carId, publicId, ownerId);
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
