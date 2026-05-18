package com.cabgo.controller;

import com.cabgo.dto.request.DriverLoginRequest;
import com.cabgo.dto.request.DriverRegisterRequest;
import com.cabgo.dto.request.OtpVerificationRequest;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.DriverAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/driver/auth")
@RequiredArgsConstructor
public class DriverAuthController {

    private final DriverAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody DriverRegisterRequest request) {
        var response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody DriverLoginRequest request) {
        authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your phone number", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<?>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        var response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
