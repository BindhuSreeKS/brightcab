package com.cabgo.controller;

import com.cabgo.enums.VehicleCategory;
import com.cabgo.model.Pricing;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/super-admin/pricing")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class PricingController {

    private final PricingService pricingService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllPricing() {
        return ResponseEntity.ok(ApiResponse.success(pricingService.getAllPricing()));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<?>> getPricingByCategory(@PathVariable VehicleCategory category) {
        return ResponseEntity.ok(ApiResponse.success(pricingService.getPricingByCategory(category)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createPricing(
            @RequestBody Pricing pricing,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Pricing created",
                pricingService.createPricing(pricing, auth.getName())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updatePricing(
            @PathVariable String id,
            @RequestBody Pricing pricing,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Pricing updated",
                pricingService.updatePricing(id, pricing, auth.getName())));
    }
}
