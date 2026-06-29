package com.cabgo.controller;

import com.cabgo.enums.RideStatus;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.DriverRideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/driver/api/rides")
@RequiredArgsConstructor
public class DriverRideController {

    private final DriverRideService rideService;

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<?>> getAvailableRequests(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getAvailableRequests(authentication.getName())));
    }

    @PostMapping("/{rideId}/accept")
    public ResponseEntity<ApiResponse<?>> acceptRide(
            Authentication authentication,
            @PathVariable String rideId) {
        return ResponseEntity.ok(ApiResponse.success("Ride accepted", rideService.acceptRide(authentication.getName(), rideId)));
    }

    @PatchMapping("/{rideId}/status")
    public ResponseEntity<ApiResponse<?>> updateRideStatus(
            Authentication authentication,
            @PathVariable String rideId,
            @RequestParam RideStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Ride status updated", 
                rideService.updateRideStatus(authentication.getName(), rideId, status)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<?>> getActiveRide(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getActiveRide(authentication.getName())));
    }
}
