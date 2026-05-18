package com.cabgo.controller;

import com.cabgo.enums.VerificationStatus;
import com.cabgo.model.Driver;
import com.cabgo.model.DriverApplication;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.DriverOnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/onboarding")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverOnboardingController {

    private final DriverOnboardingService onboardingService;

    @GetMapping("/applications")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<DriverApplication>>> getAllApplications() {
        return ResponseEntity.ok(ApiResponse.success(onboardingService.getAllApplications()));
    }

    @GetMapping("/applications/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DriverApplication>> getApplication(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(onboardingService.getApplicationById(id)));
    }

    @PatchMapping("/applications/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DriverApplication>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        VerificationStatus status = VerificationStatus.valueOf(request.get("status"));
        String reason = request.get("reason");
        return ResponseEntity.ok(ApiResponse.success(onboardingService.updateApplicationStatus(id, status, reason)));
    }

    @PatchMapping("/applications/{id}/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DriverApplication>> updateProgress(
            @PathVariable String id,
            @RequestBody Map<String, Integer> request) {
        return ResponseEntity.ok(ApiResponse.success(onboardingService.updateProgress(id, request.get("progress"))));
    }

    @PostMapping("/applications/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Driver>> activateDriver(
            @PathVariable String id,
            @RequestBody Map<String, Object> activationConfig) {
        return ResponseEntity.ok(ApiResponse.success(onboardingService.activateDriver(id, activationConfig)));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(onboardingService.getOnboardingStats()));
    }
}
