package com.cabgo.controller;

import com.cabgo.model.Driver;
import com.cabgo.model.DriverLocation;
import com.cabgo.model.Ride;
import com.cabgo.model.RideTracking;
import com.cabgo.repository.DriverLocationRepository;
import com.cabgo.repository.DriverRepository;
import com.cabgo.repository.RideRepository;
import com.cabgo.repository.RideTrackingRepository;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.GoogleMapsService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/driver/location")
@RequiredArgsConstructor
public class DriverLocationController {

    private final DriverRepository driverRepository;
    private final DriverLocationRepository driverLocationRepository;
    private final RideRepository rideRepository;
    private final RideTrackingRepository rideTrackingRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final GoogleMapsService googleMapsService;

    @Data
    public static class LocationUpdateRequest {
        private Double latitude;
        private Double longitude;
        private String rideId;
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            Authentication authentication,
            @RequestBody LocationUpdateRequest request) {
        
        String phone = authentication.getName();
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // 1. Create Location History record
        DriverLocation locHistory = DriverLocation.builder()
                .driverId(driver.getId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(LocalDateTime.now())
                .build();
        driverLocationRepository.save(locHistory);

        // 2. Update Driver entity (and updatedAt which acts as heartbeat)
        driver.setLatitude(request.getLatitude());
        driver.setLongitude(request.getLongitude());
        driver.setUpdatedAt(LocalDateTime.now());
        driverRepository.save(driver);

        // 3. Prepare WebSocket payload
        String rideId = request.getRideId();
        Map<String, Object> wsPayload = Map.of(
            "driverId", driver.getId(),
            "rideId", rideId != null ? rideId : "",
            "latitude", request.getLatitude(),
            "longitude", request.getLongitude(),
            "timestamp", System.currentTimeMillis()
        );

        // 4. Update RideTracking & calculate ETA/distance if ride is active
        if (rideId != null && !rideId.trim().isEmpty()) {
            Optional<Ride> rideOpt = rideRepository.findById(rideId);
            if (rideOpt.isPresent()) {
                Ride ride = rideOpt.get();
                // Determine destination based on ride status
                double destLat = (ride.getStatus() == com.cabgo.enums.RideStatus.ONGOING) ? ride.getDropLatitude() : ride.getPickupLatitude();
                double destLng = (ride.getStatus() == com.cabgo.enums.RideStatus.ONGOING) ? ride.getDropLongitude() : ride.getPickupLongitude();

                GoogleMapsService.DistanceResult route = googleMapsService.getDistance(
                        request.getLatitude(), request.getLongitude(), destLat, destLng
                );

                // Update/Create RideTracking
                RideTracking tracking = rideTrackingRepository.findByRideId(rideId)
                        .orElseGet(() -> RideTracking.builder().rideId(rideId).build());
                tracking.setDriverId(driver.getId());
                tracking.setDriverLatitude(request.getLatitude());
                tracking.setDriverLongitude(request.getLongitude());
                tracking.setEtaMinutes(route.durationMinutes());
                tracking.setDistanceKm(route.distanceKm());
                tracking.setStatus(ride.getStatus());
                tracking.setUpdatedAt(LocalDateTime.now());
                
                // Fetch directions coordinates if not already present
                if (tracking.getRoutePoints() == null || tracking.getRoutePoints().isEmpty()) {
                    GoogleMapsService.RouteResult routeResult = googleMapsService.getRoute(
                            request.getLatitude(), request.getLongitude(), destLat, destLng
                    );
                    tracking.setRoutePoints(routeResult.routePoints());
                }
                
                rideTrackingRepository.save(tracking);

                // Broadcast location + ETA/distance updates to customer subscription topic
                Map<String, Object> customerPayload = Map.of(
                    "driverId", driver.getId(),
                    "rideId", rideId,
                    "latitude", request.getLatitude(),
                    "longitude", request.getLongitude(),
                    "etaMinutes", route.durationMinutes(),
                    "distanceKm", route.distanceKm(),
                    "etaText", route.durationText(),
                    "distanceText", route.distanceText(),
                    "status", ride.getStatus(),
                    "timestamp", System.currentTimeMillis()
                );
                messagingTemplate.convertAndSend("/topic/ride/" + rideId + "/location", customerPayload);
            }
        }

        // Broadcast to general admin tracking topic
        messagingTemplate.convertAndSend("/topic/admin/rides", wsPayload);

        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", null));
    }
}
