package com.cabgo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "popular_destinations")
public class PopularDestination {
    @Id
    private String id;
    private String city;
    private String name;
    private double latitude;
    private double longitude;
    private double radius; // in km
    private double demandMultiplier;
}
