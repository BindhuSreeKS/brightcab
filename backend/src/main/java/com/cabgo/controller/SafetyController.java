package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.SafetyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/customer/safety")
@RequiredArgsConstructor
public class SafetyController {

    private final SafetyService safetyService;

    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<String>> triggerSOS(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        String customerId = authentication.getName();
        String rideId = (String) request.get("rideId");
        Double lat = (Double) request.get("latitude");
        Double lng = (Double) request.get("longitude");
        
        safetyService.triggerSOS(customerId, rideId, lat, lng);
        return ResponseEntity.ok(ApiResponse.success("Emergency alert sent successfully", null));
    }
}
