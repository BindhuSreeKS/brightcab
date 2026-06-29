package com.cabgo.controller;

import com.cabgo.dto.request.ChangePasswordRequest;
import com.cabgo.dto.request.LoginRequest;
import com.cabgo.dto.request.RefreshTokenRequest;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.repository.AdminRepository;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AdminRepository adminRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {
        var response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<?>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        var response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<?>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getMe(Authentication authentication) {
        var admin = adminRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        return ResponseEntity.ok(ApiResponse.success(authService.mapToResponse(admin)));
    }
}
