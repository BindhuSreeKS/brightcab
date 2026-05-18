package com.cabgo.model;

import com.cabgo.enums.VehicleCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "pricing")
public class Pricing {

    @Id
    private String id;

    private VehicleCategory category;

    private Double baseFare;

    private Double perKmRate;

    private Double perMinuteRate;

    private Double minimumFare;

    private Double surgePriceMultiplier;

    @Builder.Default
    private boolean surgePricingEnabled = false;

    private Double nightSurgeMultiplier;

    @Builder.Default
    private boolean nightPricingEnabled = false;

    // Night pricing 10 PM to 6 AM
    private Integer nightStartHour;

    private Integer nightEndHour;

    private Double commissionPercentage;

    private String cityId; // null = global

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String updatedBy;
}
