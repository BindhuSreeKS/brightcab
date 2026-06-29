package com.cabgo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareRequest {
    private double pickupLat;
    private double pickupLng;
    private double dropLat;
    private double dropLng;
    private String city;
    private String vehicleType;
}
