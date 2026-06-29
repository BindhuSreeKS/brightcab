package com.cabgo.service;

import com.cabgo.model.Pricing;
import org.springframework.stereotype.Component;

@Component
public class FareCalculator {

    public static class CalculationBreakdown {
        public double base;
        public double distance;
        public double time;
        public double trafficMultiplier;
        public double demandMultiplier;
        public double peakMultiplier;
        public double weekendMultiplier;
        public double festivalMultiplier;

        public CalculationBreakdown(double base, double distance, double time, double trafficMultiplier, 
                                    double demandMultiplier, double peakMultiplier, double weekendMultiplier, double festivalMultiplier) {
            this.base = base;
            this.distance = distance;
            this.time = time;
            this.trafficMultiplier = trafficMultiplier;
            this.demandMultiplier = demandMultiplier;
            this.peakMultiplier = peakMultiplier;
            this.weekendMultiplier = weekendMultiplier;
            this.festivalMultiplier = festivalMultiplier;
        }
    }

    public static class CalculateResult {
        public final long finalFare;
        public final CalculationBreakdown breakdown;

        public CalculateResult(long finalFare, CalculationBreakdown breakdown) {
            this.finalFare = finalFare;
            this.breakdown = breakdown;
        }
    }

    public CalculateResult calculateFare(
            Pricing pricing,
            double distanceKm,
            double normalDurationMinutes,
            double trafficMultiplier,
            double destinationMultiplier,
            double peakMultiplier,
            double weekendMultiplier,
            double festivalMultiplier) {

        double baseFare = pricing.getBaseFare();
        double distanceCharge = distanceKm * pricing.getPerKmRate();
        double timeCharge = normalDurationMinutes * pricing.getPerMinuteRate();

        double baseSum = baseFare + distanceCharge + timeCharge;
        double dynamicFare = baseSum;

        dynamicFare *= trafficMultiplier;
        dynamicFare *= destinationMultiplier;
        dynamicFare *= peakMultiplier;
        dynamicFare *= weekendMultiplier;
        dynamicFare *= festivalMultiplier;

        long finalFare = Math.round(dynamicFare);

        CalculationBreakdown breakdown = new CalculationBreakdown(
            baseFare,
            distanceCharge,
            timeCharge,
            trafficMultiplier,
            destinationMultiplier,
            peakMultiplier,
            weekendMultiplier,
            festivalMultiplier
        );

        return new CalculateResult(finalFare, breakdown);
    }
}
