package com.cabgo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareResponse {
    private double distanceKm;
    private int durationMinutes;
    private String traffic;
    private double trafficMultiplier;
    private String destination;
    private double destinationMultiplier;
    private boolean peakHour;
    private long estimatedFare;
    private String currency;
    private Breakdown breakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Breakdown {
        private double base;
        private double distance;
        private double time;
        private double traffic;
        private double demand;
        private double peak;
        private double weekend;
        private double festival;
    }
}
