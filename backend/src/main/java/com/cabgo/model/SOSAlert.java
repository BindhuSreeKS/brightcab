package com.cabgo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sos_alerts")
public class SOSAlert {
    @Id
    private String id;
    
    private String customerId;
    private String driverId;
    private String rideId;
    private Double latitude;
    private Double longitude;
    private String message;
    
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, RESOLVED
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
