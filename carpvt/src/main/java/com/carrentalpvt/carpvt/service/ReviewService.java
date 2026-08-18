package com.carrentalpvt.carpvt.service;

import com.carrentalpvt.carpvt.dto.ReviewRequest;
import com.carrentalpvt.carpvt.exception.ResourceNotFoundException;
import com.carrentalpvt.carpvt.model.Booking;
import com.carrentalpvt.carpvt.model.Car;
import com.carrentalpvt.carpvt.model.Review;
import com.carrentalpvt.carpvt.model.User;
import com.carrentalpvt.carpvt.repository.BookingRepository;
import com.carrentalpvt.carpvt.repository.CarRepository;
import com.carrentalpvt.carpvt.repository.ReviewRepository;
import com.carrentalpvt.carpvt.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReviewService(
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            CarRepository carRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ==========================================
    // 1. SUBMIT REVIEW (COMPLETED BOOKING ONLY)
    // ==========================================

    public Review addReview(String renterId, ReviewRequest request) {
        if (request == null || request.getBookingId() == null || request.getBookingId().trim().isEmpty()) {
            throw new IllegalArgumentException("Booking ID is required");
        }

        if (request.getCarRating() < 1 || request.getCarRating() > 5) {
            throw new IllegalArgumentException("Car rating must be between 1 and 5 stars");
        }

        if (request.getOwnerRating() < 1 || request.getOwnerRating() > 5) {
            throw new IllegalArgumentException("Owner rating must be between 1 and 5 stars");
        }

        // 1. Fetch Booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        // 2. Authorization Check: Only renter can review
        if (!booking.getRenterId().equals(renterId)) {
            throw new AccessDeniedException("Only the renter of this booking can submit a review");
        }

        // 3. Status Check: Must be COMPLETED
        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new IllegalStateException("Reviews can only be submitted for COMPLETED rentals. Current status: " + booking.getStatus());
        }

        // 4. Duplicate Check: Only 1 review per booking
        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new IllegalStateException("A review has already been submitted for this booking");
        }

        // 5. Fetch Renter Name
        String renterName = userRepository.findById(renterId)
                .map(User::getName)
                .orElse("Verified Renter");

        // 6. Save Review
        Review review = Review.builder()
                .bookingId(booking.getId())
                .carId(booking.getCarId())
                .ownerId(booking.getOwnerId())
                .renterId(renterId)
                .renterName(renterName)
                .carRating(request.getCarRating())
                .ownerRating(request.getOwnerRating())
                .comment(request.getComment() != null ? request.getComment().trim() : "")
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        // 7. Recalculate Car Rating
        updateCarAverageRating(booking.getCarId());

        // 8. Recalculate Owner Rating
        updateOwnerAverageRating(booking.getOwnerId());

        // 9. Notify Owner
        notificationService.sendNotification(
                booking.getOwnerId(),
                "New Review Received!",
                renterName + " left a " + request.getCarRating() + "★ vehicle rating and " + request.getOwnerRating() + "★ host rating for booking #" + booking.getId().substring(Math.max(0, booking.getId().length() - 6)) + ".",
                "REVIEW_RECEIVED",
                savedReview.getId()
        );

        return savedReview;
    }

    // ==========================================
    // 2. GET REVIEWS BY CAR
    // ==========================================

    public List<Review> getCarReviews(String carId) {
        return reviewRepository.findByCarId(carId);
    }

    // ==========================================
    // 3. GET REVIEWS BY OWNER
    // ==========================================

    public List<Review> getOwnerReviews(String ownerId) {
        return reviewRepository.findByOwnerId(ownerId);
    }

    // ==========================================
    // 4. GET REVIEW BY BOOKING
    // ==========================================

    public Optional<Review> getBookingReview(String bookingId) {
        return reviewRepository.findByBookingId(bookingId);
    }

    // HELPER: RECALCULATE CAR RATING
    private void updateCarAverageRating(String carId) {
        List<Review> carReviews = reviewRepository.findByCarId(carId);
        double avgRating = carReviews.stream()
                .mapToInt(Review::getCarRating)
                .average()
                .orElse(0.0);

        carRepository.findById(carId).ifPresent(car -> {
            car.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
            car.setReviewCount(carReviews.size());
            carRepository.save(car);
        });
    }

    // HELPER: RECALCULATE OWNER RATING
    private void updateOwnerAverageRating(String ownerId) {
        List<Review> ownerReviews = reviewRepository.findByOwnerId(ownerId);
        double avgRating = ownerReviews.stream()
                .mapToInt(Review::getOwnerRating)
                .average()
                .orElse(0.0);

        userRepository.findById(ownerId).ifPresent(owner -> {
            owner.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
            owner.setReviewCount(ownerReviews.size());
            userRepository.save(owner);
        });
    }
}
