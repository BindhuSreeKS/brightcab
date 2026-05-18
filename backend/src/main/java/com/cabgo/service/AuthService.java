package com.cabgo.service;

import com.cabgo.dto.request.ChangePasswordRequest;
import com.cabgo.dto.request.LoginRequest;
import com.cabgo.dto.request.RefreshTokenRequest;
import com.cabgo.dto.response.AdminResponse;
import com.cabgo.dto.response.AuthResponse;
import com.cabgo.enums.AdminStatus;
import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.UnauthorizedException;
import com.cabgo.model.Admin;
import com.cabgo.repository.AdminRepository;
import com.cabgo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AdminUserDetailsServiceImpl userDetailsService;
    private final AuditLogService auditLogService;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (admin.getStatus() == AdminStatus.SUSPENDED) {
            throw new UnauthorizedException("Your account has been suspended. Please contact Super Admin.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails, admin.getId(), admin.getRole().name(), "ADMIN");
        String refreshToken = jwtUtil.generateRefreshToken(admin.getEmail());

        // Save refresh token & update last login
        admin.setRefreshToken(refreshToken);
        admin.setLastLogin(LocalDateTime.now());
        adminRepository.save(admin);

        auditLogService.log(admin.getId(), admin.getName(), com.cabgo.enums.AuditAction.LOGIN, "AUTH", null, "Admin logged in");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .admin(mapToResponse(admin))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String email = jwtUtil.extractUsername(request.getRefreshToken());
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!request.getRefreshToken().equals(admin.getRefreshToken())) {
            throw new UnauthorizedException("Refresh token is invalid or expired");
        }

        if (jwtUtil.isTokenExpired(request.getRefreshToken())) {
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String accessToken = jwtUtil.generateToken(userDetails, admin.getId(), admin.getRole().name(), "ADMIN");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(request.getRefreshToken())
                .tokenType("Bearer")
                .admin(mapToResponse(admin))
                .build();
    }

    public void logout(String email) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));
        admin.setRefreshToken(null);
        adminRepository.save(admin);
        auditLogService.log(admin.getId(), admin.getName(), com.cabgo.enums.AuditAction.LOGOUT, "AUTH", null, "Admin logged out");
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Admin not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepository.save(admin);
    }

    public AdminResponse mapToResponse(Admin admin) {
        return AdminResponse.builder()
                .id(admin.getId())
                .name(admin.getName())
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .role(admin.getRole())
                .status(admin.getStatus())
                .permissions(admin.getPermissions())
                .roleId(admin.getRoleId())
                .lastLogin(admin.getLastLogin())
                .profileImage(admin.getProfileImage())
                .createdAt(admin.getCreatedAt())
                .build();
    }
}
