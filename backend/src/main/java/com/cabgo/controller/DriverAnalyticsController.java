package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.DriverAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/driver/api/analytics")
@RequiredArgsConstructor
public class DriverAnalyticsController {

    private final DriverAnalyticsService analyticsService;

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<?>> getEarningsSummary(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getEarningsSummary(authentication.getName())));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<?>> getRideHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRideHistory(authentication.getName(), page, size)));
    }
}
