package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/admin/dashboard")
    public ResponseEntity<ApiResponse<?>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardStats()));
    }

    @GetMapping("/super-admin/dashboard")
    public ResponseEntity<ApiResponse<?>> getSuperAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardStats()));
    }

    @GetMapping("/super-admin/analytics/revenue")
    public ResponseEntity<ApiResponse<?>> getRevenueAnalytics(
            @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenueAnalytics(period)));
    }

    @GetMapping("/super-admin/analytics/rides")
    public ResponseEntity<ApiResponse<?>> getRideAnalytics(
            @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRideAnalytics(period)));
    }

    @GetMapping("/super-admin/analytics/chart")
    public ResponseEntity<ApiResponse<?>> getChartData() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenueChartData()));
    }

    @GetMapping("/super-admin/analytics/cities")
    public ResponseEntity<ApiResponse<?>> getCityPerformance() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCityPerformance()));
    }
}
