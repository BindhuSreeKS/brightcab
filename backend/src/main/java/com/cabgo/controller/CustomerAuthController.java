package com.cabgo.controller;

import com.cabgo.dto.request.CustomerLoginRequest;
import com.cabgo.dto.request.CustomerRegisterRequest;
import com.cabgo.dto.request.OtpVerificationRequest;
import com.cabgo.dto.response.AuthResponse;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.CustomerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody CustomerRegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@Valid @RequestBody CustomerLoginRequest request) {
        authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully.", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful.", response));
    }
}
