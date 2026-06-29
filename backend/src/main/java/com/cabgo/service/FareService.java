package com.cabgo.service;

import com.cabgo.dto.FareRequest;
import com.cabgo.dto.FareResponse;
import com.cabgo.enums.VehicleCategory;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.City;
import com.cabgo.model.Pricing;
import com.cabgo.repository.CityRepository;
import com.cabgo.repository.PricingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FareService {

    private final GoogleMapsService googleMapsService;
    private final TrafficService trafficService;
    private final DestinationService destinationService;
    private final PeakHourService peakHourService;
    private final FestivalService festivalService;
    private final PricingRepository pricingRepository;
    private final CityRepository cityRepository;
    private final FareCalculator fareCalculator;

    public FareResponse estimateFare(FareRequest request) {
        log.info("Estimating fare for request: {}", request);

        // 1. Get Route from Google Maps Service
        GoogleMapsService.RouteEstimation route = googleMapsService.getRouteEstimation(
                request.getPickupLat(),
                request.getPickupLng(),
                request.getDropLat(),
                request.getDropLng()
        );

        // 2. Traffic Detection
        double normalDuration = route.normalDurationMinutes();
        double liveDuration = route.liveDurationMinutes();
        double trafficRatio = normalDuration > 0 ? liveDuration / normalDuration : 1.0;
        double trafficMultiplier = trafficService.calculateMultiplier(trafficRatio);
        String trafficLevel = trafficService.getTrafficLevel(trafficRatio);

        // 3. Destination multiplier
        DestinationService.MatchResult destMatch = destinationService.findMatchingDestination(
                request.getCity(),
                request.getDropLat(),
                request.getDropLng()
        );

        // 4. Peak Hour and Weekend Detection
        LocalDateTime now = LocalDateTime.now();
        double peakMultiplier = peakHourService.getPeakMultiplier(now);
        double weekendMultiplier = peakHourService.getWeekendMultiplier(now);
        boolean isPeak = peakHourService.isPeakHour(now);

        // 5. Festival Detection
        FestivalService.FestivalResult festivalResult = festivalService.getActiveFestival(LocalDate.now());
        double festivalMultiplier = festivalResult.multiplier;

        // 6. Look up pricing
        String categoryStr = request.getVehicleType() != null ? request.getVehicleType().toUpperCase() : "SEDAN";
        VehicleCategory category;
        try {
            category = VehicleCategory.valueOf(categoryStr);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid vehicle category: {}, falling back to SEDAN", categoryStr);
            category = VehicleCategory.SEDAN;
        }

        final VehicleCategory finalCategory = category;

        // Try to look up city specific pricing, fallback to global
        Pricing pricing = null;
        if (request.getCity() != null && !request.getCity().isEmpty()) {
            Optional<City> cityOpt = cityRepository.findByNameIgnoreCase(request.getCity());
            if (cityOpt.isPresent()) {
                String cityId = cityOpt.get().getId();
                pricing = pricingRepository.findByCategoryAndCityId(finalCategory, cityId).orElse(null);
            }
        }

        if (pricing == null) {
            log.info("City-specific pricing not found. Falling back to global pricing.");
            pricing = pricingRepository.findByCategoryAndCityIdIsNull(finalCategory)
                    .orElseThrow(() -> new ResourceNotFoundException("Global pricing not configured for " + finalCategory, ""));
        }

        // 7. Calculate Fare
        FareCalculator.CalculateResult result = fareCalculator.calculateFare(
                pricing,
                route.distanceKm(),
                route.normalDurationMinutes(),
                trafficMultiplier,
                destMatch.multiplier,
                peakMultiplier,
                weekendMultiplier,
                festivalMultiplier
        );

        return FareResponse.builder()
                .distanceKm(Math.round(route.distanceKm() * 10.0) / 10.0)
                .durationMinutes(route.liveDurationMinutes())
                .traffic(trafficLevel)
                .trafficMultiplier(trafficMultiplier)
                .destination(destMatch.name)
                .destinationMultiplier(destMatch.multiplier)
                .peakHour(isPeak)
                .estimatedFare(result.finalFare)
                .currency("INR")
                .breakdown(FareResponse.Breakdown.builder()
                        .base(result.breakdown.base)
                        .distance(Math.round(result.breakdown.distance * 10.0) / 10.0)
                        .time(Math.round(result.breakdown.time * 10.0) / 10.0)
                        .traffic(result.breakdown.trafficMultiplier)
                        .demand(result.breakdown.demandMultiplier)
                        .peak(result.breakdown.peakMultiplier)
                        .weekend(result.breakdown.weekendMultiplier)
                        .festival(result.breakdown.festivalMultiplier)
                        .build())
                .build();
    }
}
