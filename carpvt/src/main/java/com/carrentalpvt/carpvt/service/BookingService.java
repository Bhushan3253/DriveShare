package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.PriceCalculationResponse;
import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.CarAvailability;
import com.carrentalpvt.carpvt.model.Transaction;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.CarAvailabilityRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarService carService;
    private final TransactionService transactionService;
    private final CarAvailabilityRepository availabilityRepository;
    private final PayoutService payoutService;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            CarService carService,
            TransactionService transactionService,
            CarAvailabilityRepository availabilityRepository,
            PayoutService payoutService,
            NotificationService notificationService) {

        this.bookingRepository = bookingRepository;
        this.carService = carService;
        this.transactionService = transactionService;
        this.availabilityRepository = availabilityRepository;
        this.payoutService = payoutService;
        this.notificationService = notificationService;
    }

    // ==========================================
    // 1. CALCULATE PRICE & PREVIEW AVAILABILITY
    // ==========================================

    public PriceCalculationResponse calculatePrice(
            String carId,
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Car car = carService.getCarById(carId);

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double totalAmount = totalDays * car.getPricePerDay();
        double platformCommission = totalAmount * 0.15;
        double ownerEarnings = totalAmount - platformCommission;

        // Check availability window
        List<CarAvailability> availabilities = availabilityRepository.findByCarId(carId);
        boolean isCovered = availabilities.stream().anyMatch(a ->
                !startDate.isBefore(a.getStartDate()) && !endDate.isAfter(a.getEndDate())
        );

        // Check active booking conflicts (filtering out expired holds)
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings = bookingRepository.findByCarId(carId);
        boolean hasConflict = bookings.stream()
                .filter(b -> isBookingActive(b, now))
                .anyMatch(b -> !startDate.isAfter(b.getEndDate()) && !endDate.isBefore(b.getStartDate()));

        boolean isAvailable = isCovered && !hasConflict && car.isActive() && "APPROVED".equals(car.getStatus());
        String message = isAvailable
                ? "Car is available for selected dates"
                : (!isCovered
                    ? "Car is not available in owner's calendar for selected dates"
                    : "Car is already reserved or booked for these dates");

        return PriceCalculationResponse.builder()
                .carId(carId)
                .startDate(startDate)
                .endDate(endDate)
                .totalDays(totalDays)
                .pricePerDay(car.getPricePerDay())
                .totalAmount(totalAmount)
                .platformCommission(platformCommission)
                .ownerEarnings(ownerEarnings)
                .available(isAvailable)
                .message(message)
                .build();
    }

    // ==========================================
    // 2. CREATE PRODUCTION-SAFE BOOKING WITH 15-MIN HOLD
    // ==========================================

    public Booking createBooking(
            String carId,
            String renterId,
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Booking startDate and endDate are required");
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Invalid booking dates: startDate must be before or equal to endDate");
        }

        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking startDate cannot be in the past");
        }

        Car car = carService.getCarById(carId);

        if (!car.isActive()) {
            throw new IllegalStateException("Car is currently not active for rentals");
        }

        if (!"APPROVED".equals(car.getStatus())) {
            throw new IllegalStateException("Car is not approved for rental by admin");
        }

        if (car.getOwnerId().equals(renterId)) {
            throw new IllegalStateException("You cannot book your own car");
        }

        // 1. Verify owner availability window
        List<CarAvailability> availabilities = availabilityRepository.findByCarId(carId);

        if (availabilities.isEmpty()) {
            throw new IllegalStateException("Car has no availability windows set by the owner");
        }

        boolean isWithinAvailableWindow = availabilities.stream().anyMatch(a ->
                !startDate.isBefore(a.getStartDate()) && !endDate.isAfter(a.getEndDate())
        );

        if (!isWithinAvailableWindow) {
            throw new IllegalStateException("Car is not marked as available for the requested dates: "
                    + startDate + " to " + endDate);
        }

        // 2. Concurrency & Date Overlap Validation
        LocalDateTime now = LocalDateTime.now();
        List<Booking> existingBookings = bookingRepository.findByCarId(carId);

        for (Booking existing : existingBookings) {
            if (!isBookingActive(existing, now)) {
                continue;
            }

            boolean overlap = !startDate.isAfter(existing.getEndDate())
                    && !endDate.isBefore(existing.getStartDate());

            if (overlap) {
                throw new IllegalStateException(
                        "Car is already reserved or booked for the selected dates: "
                                + existing.getStartDate() + " to " + existing.getEndDate()
                                + " (Status: " + existing.getStatus() + ")");
            }
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double totalAmount = totalDays * car.getPricePerDay();

        Booking booking = new Booking();
        booking.setCarId(carId);
        booking.setOwnerId(car.getOwnerId());
        booking.setRenterId(renterId);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotalDays(totalDays);
        booking.setPricePerDay(car.getPricePerDay());
        booking.setTotalAmount(totalAmount);
        booking.setStatus("PAYMENT_PENDING");
        booking.setPaymentStatus("PENDING");
        booking.setCreatedAt(now);
        booking.setExpiresAt(now.plusMinutes(15));

        Booking savedBooking = bookingRepository.save(booking);

        // Notify Owner & Renter
        notificationService.sendNotification(
                car.getOwnerId(),
                "New Booking Request",
                "A renter requested to book your " + car.getBrand() + " " + car.getModel() + " for " + startDate + " to " + endDate + " (₹" + totalAmount + ").",
                "BOOKING_CREATED",
                savedBooking.getId()
        );

        notificationService.sendNotification(
                renterId,
                "Booking Reserved (15-Min Hold)",
                "Your reservation for " + car.getBrand() + " " + car.getModel() + " is active. Please complete UPI payment within 15 minutes.",
                "BOOKING_CREATED",
                savedBooking.getId()
        );

        return savedBooking;
    }

    // ==========================================
    // 3. CHECK-IN (RENTER OR OWNER)
    // ==========================================

    public Booking checkIn(String bookingId, String userId) {
        Booking booking = getBookingByIdInternal(bookingId);

        boolean isRenter = booking.getRenterId().equals(userId);
        boolean isOwner = booking.getOwnerId().equals(userId);

        if (!isRenter && !isOwner) {
            throw new AccessDeniedException("Only the renter or car owner can perform check-in");
        }

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking must be in CONFIRMED status (payment verified) to check in. Current status: " + booking.getStatus());
        }

        if (!"PAID".equals(booking.getPaymentStatus())) {
            throw new IllegalStateException("Payment must be marked PAID before check-in");
        }

        booking.setStatus("CHECKED_IN");
        booking.setCheckedInAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                booking.getOwnerId(),
                "Check-In Completed",
                "Check-in has been completed for booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 6)) + ".",
                "CHECKED_IN",
                booking.getId()
        );

        return saved;
    }

    // ==========================================
    // 4. START RENTAL (TRIP START)
    // ==========================================

    public Booking startRental(String bookingId, String userId) {
        Booking booking = getBookingByIdInternal(bookingId);

        boolean isRenter = booking.getRenterId().equals(userId);
        boolean isOwner = booking.getOwnerId().equals(userId);

        if (!isRenter && !isOwner) {
            throw new AccessDeniedException("Only the renter or car owner can start the rental");
        }

        if (!"CHECKED_IN".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking must be in CHECKED_IN status to start rental. Current status: " + booking.getStatus());
        }

        booking.setStatus("IN_PROGRESS");
        booking.setStartedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                booking.getOwnerId(),
                "Trip In Progress",
                "Trip has started for booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 6)) + ".",
                "TRIP_STARTED",
                booking.getId()
        );

        return saved;
    }

    // ==========================================
    // 5. RETURN CAR (RENTER OR OWNER HANDOVER)
    // ==========================================

    public Booking returnCar(String bookingId, String userId) {
        Booking booking = getBookingByIdInternal(bookingId);

        boolean isRenter = booking.getRenterId().equals(userId);
        boolean isOwner = booking.getOwnerId().equals(userId);

        if (!isRenter && !isOwner) {
            throw new AccessDeniedException("Only the renter or car owner can mark the car as returned");
        }

        if (!"IN_PROGRESS".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking must be in IN_PROGRESS status to return the car. Current status: " + booking.getStatus());
        }

        booking.setStatus("RETURNED");
        booking.setReturnedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
                booking.getOwnerId(),
                "Car Returned - Inspection Needed",
                "The car has been returned by the renter. Please inspect vehicle condition and mark booking completed.",
                "CAR_RETURNED",
                booking.getId()
        );

        return saved;
    }

    // ==========================================
    // 6. COMPLETE BOOKING & FINALIZE EARNINGS (CAR OWNER)
    // ==========================================

    public Booking completeBooking(String bookingId, String userId) {
        Booking booking = getBookingByIdInternal(bookingId);

        if (!booking.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Only the car owner can complete the booking and finalize earnings");
        }

        if (!"RETURNED".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking must be in RETURNED status before owner can complete it. Current status: " + booking.getStatus());
        }

        booking.setStatus("COMPLETED");
        booking.setCompletedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        // Finalize transaction and generate owner payout record
        Transaction transaction = transactionService.completeTransaction(bookingId);
        payoutService.createPayout(savedBooking, transaction);

        // Notify Renter
        notificationService.sendNotification(
                booking.getRenterId(),
                "Trip Completed!",
                "Your rental for booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 6)) + " has been completed. Please rate your experience!",
                "TRIP_COMPLETED",
                booking.getId()
        );

        return savedBooking;
    }

    // ==========================================
    // 7. CANCEL BOOKING WITH RULES
    // ==========================================

    public Booking cancelBooking(String bookingId, String userId, String reason) {
        Booking booking = getBookingByIdInternal(bookingId);

        boolean isRenter = booking.getRenterId().equals(userId);
        boolean isOwner = booking.getOwnerId().equals(userId);

        if (!isRenter && !isOwner) {
            throw new AccessDeniedException("You are not authorized to cancel this booking");
        }

        if ("CHECKED_IN".equals(booking.getStatus())
                || "IN_PROGRESS".equals(booking.getStatus())
                || "RETURNED".equals(booking.getStatus())
                || "COMPLETED".equals(booking.getStatus())) {
            throw new IllegalStateException("Cannot cancel a trip that is already checked in, active, or completed.");
        }

        booking.setStatus("CANCELLED");
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy(isRenter ? "RENTER" : "OWNER");
        booking.setCancellationReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Cancelled by user");

        if ("PENDING".equals(booking.getPaymentStatus())) {
            booking.setPaymentStatus("CANCELLED");
        }

        Booking saved = bookingRepository.save(booking);

        String notifyTarget = isRenter ? booking.getOwnerId() : booking.getRenterId();
        notificationService.sendNotification(
                notifyTarget,
                "Booking Cancelled",
                "Booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 6)) + " was cancelled (" + booking.getCancellationReason() + ").",
                "BOOKING_CANCELLED",
                booking.getId()
        );

        return saved;
    }

    // ==========================================
    // 8. HELPER METHODS & QUERIES
    // ==========================================

    public Booking getBookingById(String bookingId, String userId) {
        Booking booking = getBookingByIdInternal(bookingId);

        if (!booking.getRenterId().equals(userId) && !booking.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to view this booking");
        }

        return booking;
    }

    public List<Booking> getBookingsByRenter(String renterId) {
        return bookingRepository.findByRenterId(renterId);
    }

    public List<Booking> getBookingsByOwner(String ownerId) {
        return bookingRepository.findByOwnerId(ownerId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    private Booking getBookingByIdInternal(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
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
}