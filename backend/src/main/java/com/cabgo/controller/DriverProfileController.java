package com.cabgo.controller;

import com.cabgo.enums.DriverStatus;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.DriverProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/driver/api/profile")
@RequiredArgsConstructor
public class DriverProfileController {

    private final DriverProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfile(authentication.getName())));
    }

    @PatchMapping("/status")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            Authentication authentication,
            @RequestParam DriverStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", profileService.updateStatus(authentication.getName(), status)));
    }

    @PatchMapping("/location")
    public ResponseEntity<ApiResponse<?>> updateLocation(
            Authentication authentication,
            @RequestBody Map<String, Double> location) {
        return ResponseEntity.ok(ApiResponse.success("Location updated", 
                profileService.updateLocation(authentication.getName(), location.get("latitude"), location.get("longitude"))));
    }

    @PostMapping("/documents")
    public ResponseEntity<ApiResponse<?>> uploadDocument(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String documentType = request.get("type");
        String base64Image = request.get("image");
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", 
                profileService.uploadDocument(authentication.getName(), documentType, base64Image)));
    }
}
