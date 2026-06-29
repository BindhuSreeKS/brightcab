package com.cabgo.service;

import com.cabgo.dto.request.DriverLoginRequest;
import com.cabgo.dto.request.DriverRegisterRequest;
import com.cabgo.dto.request.OtpVerificationRequest;
import com.cabgo.dto.response.AuthResponse;
import com.cabgo.dto.response.DriverResponse;
import com.cabgo.enums.DriverStatus;
import com.cabgo.enums.VerificationStatus;
import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.exception.UnauthorizedException;
import com.cabgo.model.Driver;
import com.cabgo.repository.DriverRepository;
import com.cabgo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverAuthService {

    private final DriverRepository driverRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final DriverUserDetailsServiceImpl userDetailsService;
    
    // In-memory OTP storage (Phone -> OTP)
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public AuthResponse register(DriverRegisterRequest request) {
        if (driverRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already registered");
        }
        if (driverRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Driver driver = Driver.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .aadhaarNumber(request.getAadhaarNumber())
                .licenseNumber(request.getLicenseNumber())
                .vehicleNumber(request.getVehicleNumber())
                .vehicleModel(request.getVehicleModel())
                .vehicleCategory(request.getVehicleCategory())
                .verificationStatus(VerificationStatus.PENDING)
                .status(DriverStatus.OFFLINE)
                .createdAt(LocalDateTime.now())
                .build();

        Driver savedDriver = driverRepository.save(driver);
        log.info("New driver registered: {}", savedDriver.getPhone());

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedDriver.getPhone());
        String accessToken = jwtUtil.generateToken(userDetails, savedDriver.getId(), "DRIVER", "DRIVER");
        String refreshToken = jwtUtil.generateRefreshToken(savedDriver.getPhone());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .driver(mapToResponse(savedDriver))
                .build();
    }

    public void login(DriverLoginRequest request) {
        Driver driver = driverRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // Generate and send OTP (Mocked)
        String otp = "123456"; // Fixed OTP for testing
        otpStorage.put(request.getPhone(), otp);
        
        log.info("OTP sent to {}: {}", request.getPhone(), otp);
    }

    public AuthResponse verifyOtp(OtpVerificationRequest request) {
        String storedOtp = otpStorage.get(request.getPhone());
        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new UnauthorizedException("Invalid or expired OTP");
        }

        Driver driver = driverRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        otpStorage.remove(request.getPhone());

        UserDetails userDetails = userDetailsService.loadUserByUsername(driver.getPhone());
        String accessToken = jwtUtil.generateToken(userDetails, driver.getId(), "DRIVER", "DRIVER");
        String refreshToken = jwtUtil.generateRefreshToken(driver.getPhone());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .driver(mapToResponse(driver))
                .build();
    }

    public DriverResponse mapToResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .vehicleNumber(driver.getVehicleNumber())
                .vehicleModel(driver.getVehicleModel())
                .vehicleCategory(driver.getVehicleCategory())
                .verificationStatus(driver.getVerificationStatus())
                .status(driver.getStatus())
                .rating(driver.getRating())
                .totalRides(driver.getTotalRides())
                .totalEarnings(driver.getTotalEarnings())
                .profileImage(driver.getProfileImage())
                .licenseImage(driver.getLicenseImage())
                .rcImage(driver.getRcImage())
                .aadhaarImage(driver.getAadhaarImage())
                .createdAt(driver.getCreatedAt())
                .build();
    }
}
