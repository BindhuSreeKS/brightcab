package com.cabgo.controller;

import com.cabgo.enums.RideStatus;
import com.cabgo.model.Driver;
import com.cabgo.model.Ride;
import com.cabgo.model.RideTracking;
import com.cabgo.repository.DriverRepository;
import com.cabgo.repository.RideRepository;
import com.cabgo.repository.RideTrackingRepository;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.GoogleMapsService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/rides")
@RequiredArgsConstructor
public class RideTrackingController {

    private final RideRepository rideRepository;
    private final RideTrackingRepository rideTrackingRepository;
    private final DriverRepository driverRepository;
    private final GoogleMapsService googleMapsService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerTrackingResponse {
        private String rideId;
        private String driverId;
        private String driverName;
        private String driverPhone;
        private String vehicleNumber;
        private Double driverLatitude;
        private Double driverLongitude;
        private Integer etaMinutes;
        private Double distanceKm;
        private String etaText;
        private String distanceText;
        private List<double[]> routePoints;
        private RideStatus status;
    }

    @GetMapping("/{rideId}/track")
    public ResponseEntity<ApiResponse<CustomerTrackingResponse>> getCustomerTracking(@PathVariable String rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        Optional<RideTracking> trackingOpt = rideTrackingRepository.findByRideId(rideId);
        
        CustomerTrackingResponse.CustomerTrackingResponseBuilder builder = CustomerTrackingResponse.builder()
                .rideId(rideId)
                .status(ride.getStatus());

        if (ride.getDriverId() != null) {
            builder.driverId(ride.getDriverId())
                   .driverName(ride.getDriverName())
                   .driverPhone(ride.getDriverPhone())
                   .vehicleNumber(ride.getDriverVehicleNumber());

            Optional<Driver> driverOpt = driverRepository.findById(ride.getDriverId());
            if (driverOpt.isPresent()) {
                Driver d = driverOpt.get();
                builder.driverLatitude(d.getLatitude())
                       .driverLongitude(d.getLongitude());
            }
        }

        if (trackingOpt.isPresent()) {
            RideTracking tracking = trackingOpt.get();
            builder.driverLatitude(tracking.getDriverLatitude())
                   .driverLongitude(tracking.getDriverLongitude())
                   .etaMinutes(tracking.getEtaMinutes())
                   .distanceKm(tracking.getDistanceKm())
                   .etaText(tracking.getEtaMinutes() != null ? tracking.getEtaMinutes() + " mins" : "N/A")
                   .distanceText(tracking.getDistanceKm() != null ? String.format("%.1f km", tracking.getDistanceKm()) : "N/A")
                   .routePoints(tracking.getRoutePoints());
        } else if (ride.getDriverId() != null) {
            // Compute real-time fallback using Google Maps
            Optional<Driver> driverOpt = driverRepository.findById(ride.getDriverId());
            if (driverOpt.isPresent()) {
                Driver d = driverOpt.get();
                if (d.getLatitude() != null && d.getLongitude() != null) {
                    double destLat = (ride.getStatus() == RideStatus.ONGOING) ? ride.getDropLatitude() : ride.getPickupLatitude();
                    double destLng = (ride.getStatus() == RideStatus.ONGOING) ? ride.getDropLongitude() : ride.getPickupLongitude();

                    GoogleMapsService.RouteResult route = googleMapsService.getRoute(
                            d.getLatitude(), d.getLongitude(), destLat, destLng
                    );

                    builder.driverLatitude(d.getLatitude())
                           .driverLongitude(d.getLongitude())
                           .etaMinutes(route.durationMinutes())
                           .distanceKm(route.distanceKm())
                           .etaText(route.durationText())
                           .distanceText(route.distanceText())
                           .routePoints(route.routePoints());
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Ride tracking status fetched", builder.build()));
    }
}
