package com.carrentalpvt.carpvt.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    @Indexed(unique = true)
    private String bookingId;

    @Indexed
    private String carId;

    @Indexed
    private String ownerId;

    @Indexed
    private String renterId;

    private String renterName;

    // Rating between 1 and 5
    private int carRating;

    // Rating between 1 and 5
    private int ownerRating;

    private String comment;

    @Indexed
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
