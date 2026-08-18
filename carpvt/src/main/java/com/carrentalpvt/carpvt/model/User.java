package com.carrentalpvt.carpvt.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String phone;

    @Indexed
    private String role = "USER";

    private boolean carOwner;

    @Indexed
    private boolean enabled = true;

    @Indexed
    private boolean emailVerified = false;

    // Driving License & KYC Verification (Renter / Driver)
    private String drivingLicenseNumber;

    private LocalDate drivingLicenseExpiry;

    private String drivingLicenseUrl;

    private String drivingLicensePublicId;

    // NOT_SUBMITTED / PENDING_VERIFICATION / VERIFIED / REJECTED
    @Indexed
    private String kycStatus = "NOT_SUBMITTED";

    private String kycRejectionReason;

    private LocalDateTime kycReviewedAt;

    private String kycReviewedBy;

    private double averageRating = 0.0;

    private int reviewCount = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}