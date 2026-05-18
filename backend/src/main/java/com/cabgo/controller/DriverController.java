package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllDrivers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String verificationStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                driverService.getAllDrivers(search, status, verificationStatus, page, size)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(driverService.getDriverStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getDriverById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(driverService.getDriverById(id)));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<ApiResponse<?>> getDriverAnalytics(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(driverService.getDriverAnalytics(id)));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<?>> verifyDriver(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Driver verified", driverService.verifyDriver(id, auth.getName())));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<?>> rejectDriver(
            @PathVariable String id,
            @RequestParam String reason,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Driver rejected", driverService.rejectDriver(id, reason, auth.getName())));
    }

    @PatchMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<?>> suspendDriver(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Driver suspended", driverService.suspendDriver(id, auth.getName())));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<?>> activateDriver(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Driver activated", driverService.activateDriver(id, auth.getName())));
    }
}
