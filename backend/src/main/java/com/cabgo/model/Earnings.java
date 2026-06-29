package com.cabgo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "earnings")
public class Earnings {
    @Id
    private String id;
    private String driverId;
    private String rideId;
    private Double amount;
    private Double incentive;
    private Double bonus;
    private String type; // RIDE | INCENTIVE | BONUS
    
    @CreatedDate
    private LocalDateTime createdAt;
}
