package com.cabgo.model;

import com.cabgo.enums.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ride_trackings")
public class RideTracking {
    @Id
    private String id;

    @Indexed(unique = true)
    private String rideId;

    private String driverId;
    private Double driverLatitude;
    private Double driverLongitude;

    private Integer etaMinutes;
    private Double distanceKm;
    private List<double[]> routePoints; // List of [lat, lng] coordinates

    private RideStatus status;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
