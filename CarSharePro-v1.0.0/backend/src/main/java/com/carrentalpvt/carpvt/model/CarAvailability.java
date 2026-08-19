package com.carrentalpvt.carpvt.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "car_availability")
@CompoundIndexes({
    @CompoundIndex(name = "car_avail_dates_idx", def = "{'carId': 1, 'startDate': 1, 'endDate': 1}")
})
public class CarAvailability {

    @Id
    private String id;

    @Indexed
    private String carId;

    @Indexed
    private String ownerId;

    @Indexed
    private LocalDate startDate;

    @Indexed
    private LocalDate endDate;

    private boolean available = true;

    private LocalDateTime createdAt = LocalDateTime.now();
}
