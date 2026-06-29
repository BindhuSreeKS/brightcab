package com.cabgo.controller;

import com.cabgo.dto.response.CustomerResponse;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.CustomerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer/profile")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> getProfile(Authentication authentication) {
        String customerId = authentication.getName(); // Assuming JWT subject is customerId
        CustomerResponse response = profileService.getProfile(customerId);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(
            Authentication authentication,
            @RequestBody CustomerResponse updateData) {
        String customerId = authentication.getName();
        CustomerResponse response = profileService.updateProfile(customerId, updateData);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}
