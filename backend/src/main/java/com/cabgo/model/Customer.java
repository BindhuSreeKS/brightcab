package com.cabgo.model;

import com.cabgo.enums.CustomerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "customers")
public class Customer {
    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String phone;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String profilePhoto;
    private String profileImage;
    private CustomerStatus status; // ACTIVE, BLOCKED
    private Double cancellationRate;
    
    @Builder.Default
    private Double walletBalance = 0.0;
    
    @Builder.Default
    private Integer totalRides = 0;
    
    @Builder.Default
    private Double rating = 5.0;

    private List<SavedPlace> savedPlaces = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavedPlace {
        private String name; // e.g., Home, Work
        private String address;
        private Double latitude;
        private Double longitude;
    }
}
