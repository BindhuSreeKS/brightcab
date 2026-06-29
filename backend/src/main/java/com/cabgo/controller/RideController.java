package com.cabgo.controller;

import com.cabgo.enums.RideStatus;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.RideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllRides(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getAllRides(search, status, page, size)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getRideStats() {
        return ResponseEntity.ok(ApiResponse.success(rideService.getRideStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getRideById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getRideById(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable String id,
            @RequestParam RideStatus status,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Ride status updated",
                rideService.updateRideStatus(id, status, auth.getName())));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<?>> cancelRide(
            @PathVariable String id,
            @RequestParam String reason,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Ride cancelled",
                rideService.cancelRide(id, reason, auth.getName())));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<?>> getRidesByCustomer(
            @PathVariable String customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getRidesByCustomer(customerId, page, size)));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ApiResponse<?>> getRidesByDriver(
            @PathVariable String driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getRidesByDriver(driverId, page, size)));
    }
}
