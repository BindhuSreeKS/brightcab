package com.cabgo.controller;

import com.cabgo.dto.request.RideBookingRequest;
import com.cabgo.dto.response.FareEstimationResponse;
import com.cabgo.model.Ride;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.RideBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer/rides")
@RequiredArgsConstructor
public class RideBookingController {

    private final RideBookingService rideService;

    @GetMapping("/estimate")
    public ResponseEntity<ApiResponse<FareEstimationResponse>> getEstimate(
            @RequestParam Double pickupLat, @RequestParam Double pickupLng,
            @RequestParam Double dropLat, @RequestParam Double dropLng) {
        FareEstimationResponse response = rideService.getFareEstimation(pickupLat, pickupLng, dropLat, dropLng);
        return ResponseEntity.ok(ApiResponse.success("Fare estimation fetched", response));
    }

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<Ride>> bookRide(
            Authentication authentication,
            @Valid @RequestBody RideBookingRequest request) {
        String customerId = authentication.getName();
        Ride ride = rideService.bookRide(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Searching for nearby drivers...", ride));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Ride>> getActiveRide(Authentication authentication) {
        String customerId = authentication.getName();
        Ride ride = rideService.getActiveRide(customerId);
        return ResponseEntity.ok(ApiResponse.success("Active ride found", ride));
    }

    @PostMapping("/{rideId}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelRide(@PathVariable String rideId) {
        rideService.cancelRide(rideId);
        return ResponseEntity.ok(ApiResponse.success("Ride cancelled successfully", null));
    }
}
