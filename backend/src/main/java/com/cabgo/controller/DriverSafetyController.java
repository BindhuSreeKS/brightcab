package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.DriverSafetyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/driver/api/safety")
@RequiredArgsConstructor
public class DriverSafetyController {

    private final DriverSafetyService safetyService;

    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<?>> triggerSOS(
            Authentication authentication,
            @RequestParam(required = false) String rideId,
            @RequestBody Map<String, Double> location) {
        return ResponseEntity.ok(ApiResponse.success("SOS Alert Triggered! Help is on the way.", 
                safetyService.triggerSOS(authentication.getName(), rideId, location)));
    }
}
