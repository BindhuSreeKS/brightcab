package com.cabgo.service;

import com.cabgo.dto.request.CustomerLoginRequest;
import com.cabgo.dto.request.CustomerRegisterRequest;
import com.cabgo.dto.request.OtpVerificationRequest;
import com.cabgo.dto.response.AuthResponse;
import com.cabgo.dto.response.CustomerResponse;
import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.exception.UnauthorizedException;
import com.cabgo.model.Customer;
import com.cabgo.repository.CustomerRepository;
import com.cabgo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomerUserDetailsServiceImpl userDetailsService;
    
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public AuthResponse register(CustomerRegisterRequest request) {
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already registered");
        }
        
        String email = request.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = request.getPhone() + "@cabecho.com";
        } else {
            if (customerRepository.existsByEmail(email)) {
                throw new BadRequestException("Email already registered");
            }
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Customer registered: {}", savedCustomer.getPhone());

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedCustomer.getPhone());
        String accessToken = jwtUtil.generateToken(userDetails, savedCustomer.getId(), "CUSTOMER", "CUSTOMER");
        String refreshToken = jwtUtil.generateRefreshToken(savedCustomer.getPhone());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .customer(mapToResponse(savedCustomer))
                .build();
    }

    public void login(CustomerLoginRequest request) {
        Customer customer = customerRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Simulate OTP sending
        String otp = "123456"; 
        otpStorage.put(request.getPhone(), otp);
        log.info("OTP sent to {}: {}", request.getPhone(), otp);
    }

    public AuthResponse verifyOtp(OtpVerificationRequest request) {
        String storedOtp = otpStorage.get(request.getPhone());
        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new UnauthorizedException("Invalid or expired OTP");
        }

        Customer customer = customerRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        otpStorage.remove(request.getPhone());

        UserDetails userDetails = userDetailsService.loadUserByUsername(customer.getPhone());
        String accessToken = jwtUtil.generateToken(userDetails, customer.getId(), "CUSTOMER", "CUSTOMER");
        String refreshToken = jwtUtil.generateRefreshToken(customer.getPhone());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .customer(mapToResponse(customer))
                .build();
    }

    public CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .profilePhoto(customer.getProfilePhoto())
                .walletBalance(customer.getWalletBalance())
                .totalRides(customer.getTotalRides())
                .rating(customer.getRating())
                .build();
    }
}
