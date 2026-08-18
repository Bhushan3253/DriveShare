package com.carrentalpvt.carpvt.controller;

import com.carrentalpvt.carpvt.dto.ReviewRequest;
import com.carrentalpvt.carpvt.model.Review;
import com.carrentalpvt.carpvt.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // 1. SUBMIT REVIEW FOR COMPLETED BOOKING (RENTER AUTHENTICATED)
    @PostMapping
    public Review addReview(
            @RequestBody ReviewRequest request,
            Authentication authentication) {

        String renterId = requireAuthenticatedUserId(authentication);
        return reviewService.addReview(renterId, request);
    }

    // 2. GET REVIEWS FOR A SPECIFIC CAR (PUBLIC)
    @GetMapping("/car/{carId}")
    public List<Review> getCarReviews(@PathVariable String carId) {
        return reviewService.getCarReviews(carId);
    }

    // 3. GET REVIEWS FOR A SPECIFIC CAR OWNER (PUBLIC)
    @GetMapping("/owner/{ownerId}")
    public List<Review> getOwnerReviews(@PathVariable String ownerId) {
        return reviewService.getOwnerReviews(ownerId);
    }

    // 4. GET REVIEW BY BOOKING ID
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Review> getBookingReview(@PathVariable String bookingId) {
        return reviewService.getBookingReview(bookingId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private String requireAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }
        return authentication.getName();
    }
}
