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
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    
    private String userId;
    private String userType; // CUSTOMER, DRIVER
    private String title;
    private String message;
    private String type; // RIDE, PAYMENT, PROMO, SAFETY
    
    @Builder.Default
    private boolean isRead = false;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
