package com.cabgo.model;

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
@Document(collection = "driver_locations")
public class DriverLocation {
    @Id
    private String id;

    @Indexed
    private String driverId;

    private Double latitude;
    private Double longitude;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
