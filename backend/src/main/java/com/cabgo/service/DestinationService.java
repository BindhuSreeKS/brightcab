package com.cabgo.service;

import com.cabgo.model.PopularDestination;
import com.cabgo.repository.PopularDestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final PopularDestinationRepository popularDestinationRepository;

    public static class MatchResult {
        public final String name;
        public final double multiplier;

        public MatchResult(String name, double multiplier) {
            this.name = name;
            this.multiplier = multiplier;
        }
    }

    public MatchResult findMatchingDestination(String city, double dropLat, double dropLng) {
        List<PopularDestination> destinations = popularDestinationRepository.findByCityIgnoreCase(city);
        for (PopularDestination dest : destinations) {
            double distance = haversineKm(dropLat, dropLng, dest.getLatitude(), dest.getLongitude());
            if (distance <= dest.getRadius()) {
                return new MatchResult(dest.getName(), dest.getDemandMultiplier());
            }
        }
        return new MatchResult("None", 1.0);
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
