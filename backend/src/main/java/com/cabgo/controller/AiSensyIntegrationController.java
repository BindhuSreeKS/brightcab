package com.cabgo.controller;

import com.cabgo.enums.*;
import com.cabgo.model.*;
import com.cabgo.repository.*;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.GoogleMapsService;
import com.cabgo.service.WhatsAppService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Slf4j
@RestController
@RequestMapping("/integration/aisensy")
@RequiredArgsConstructor
public class AiSensyIntegrationController {

    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final WhatsAppService whatsAppService;
    private final GoogleMapsService googleMapsService;

    @Value("${aisensy.project-api-key}")
    private String aisensyApiKey;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookRideRequest {
        private String phone;
        private String pickupLocation;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private String dropLocation;
        private Double dropLatitude;
        private Double dropLongitude;
        private String vehicleCategory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DriverOnboardRequest {
        private String name;
        private String phone;
        private String email;
        private String city;
        private String vehicleCategory;
        private String vehicleModel;
        private String vehicleNumber;
        private String vehicleColor;
        private String aadhaarNumber;
        private String licenseNumber;
        private String profileImage;
        private String aadhaarImage;
        private String licenseImage;
        private String rcImage;
        private String vehicleImage;
    }

    private void validateApiKey(String requestKey) {
        if (requestKey == null || !requestKey.equals(aisensyApiKey)) {
            log.warn("AiSensy unauthorized request: invalid API key header");
            throw new com.cabgo.exception.BadRequestException("Invalid API key or unauthorized access");
        }
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9]", "");
        if (clean.length() == 10) {
            return "91" + clean;
        }
        return clean;
    }

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<Ride>> bookRide(
            @RequestHeader(value = "X-AiSensy-Project-API-Pwd", required = false) String apiKeyHeader,
            @RequestBody BookRideRequest request) {
        
        validateApiKey(apiKeyHeader);
        log.info("Programmatic AiSensy ride booking received for phone: {}", request.getPhone());

        String normPhone = normalizePhone(request.getPhone());
        Customer customer = customerRepository.findByPhone(normPhone)
                .orElseGet(() -> {
                    Customer newCust = Customer.builder()
                            .name("WhatsApp User")
                            .phone(normPhone)
                            .email("wa_" + request.getPhone() + "@vazraa.com")
                            .password("")
                            .status(CustomerStatus.ACTIVE)
                            .build();
                    return customerRepository.save(newCust);
                });

        // Calculate distances and fares using Google Maps
        GoogleMapsService.DistanceResult route = googleMapsService.getDistance(
                request.getPickupLatitude(), request.getPickupLongitude(),
                request.getDropLatitude(), request.getDropLongitude()
        );

        VehicleCategory category = VehicleCategory.SEDAN;
        try {
            if (request.getVehicleCategory() != null) {
                category = VehicleCategory.valueOf(request.getVehicleCategory().toUpperCase());
            }
        } catch (Exception e) {}

        double base = switch (category) {
            case MINI -> 40.0;
            case HATCHBACK -> 45.0;
            case SEDAN -> 80.0;
            case SUV -> 120.0;
            case LUXURY -> 150.0;
            default -> 50.0;
        };

        double rate = switch (category) {
            case MINI -> 10.0;
            case HATCHBACK -> 11.0;
            case SEDAN -> 15.0;
            case SUV -> 20.0;
            case LUXURY -> 25.0;
            default -> 12.0;
        };

        double fare = base + (route.distanceKm() * rate);
        fare = Math.round(fare * 100.0) / 100.0;

        Ride ride = Ride.builder()
                .customerId(customer.getId())
                .customerName(customer.getName())
                .customerWhatsappPhone(request.getPhone())
                .pickupLocation(request.getPickupLocation())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .dropLocation(request.getDropLocation())
                .dropLatitude(request.getDropLatitude())
                .dropLongitude(request.getDropLongitude())
                .vehicleCategory(category)
                .status(RideStatus.SEARCHING)
                .distance(route.distanceKm())
                .duration((double) route.durationMinutes())
                .estimatedFare(fare)
                .fare(fare)
                .paymentMethod(PaymentMethod.CASH)
                .paymentStatus("PENDING")
                .bookingTime(LocalDateTime.now())
                .otp(String.format("%04d", new Random().nextInt(10000)))
                .build();

        ride = rideRepository.save(ride);

        // Update WhatsApp chatbot active session state
        ChatSession session = chatSessionRepository.findByWhatsappPhone(request.getPhone())
                .orElseGet(() -> ChatSession.builder().whatsappPhone(request.getPhone()).build());
        session.setState(ConversationState.RIDE_ACTIVE);
        session.setActiveRideId(ride.getId());
        session.setCustomerId(customer.getId());
        session.setCustomerName(customer.getName());
        chatSessionRepository.save(session);

        whatsAppService.sendText(request.getPhone(),
                "✅ *Booking Placed via Partner Flow!*\n\n" +
                "Searching for drivers. OTP: *" + ride.getOtp() + "*\n" +
                "Estimated Fare: ₹" + fare);

        return ResponseEntity.ok(ApiResponse.success("Ride created successfully", ride));
    }

    @GetMapping("/track")
    public ResponseEntity<ApiResponse<RideTrackingController.CustomerTrackingResponse>> trackRide(
            @RequestHeader(value = "X-AiSensy-Project-API-Pwd", required = false) String apiKeyHeader,
            @RequestParam String phone) {
        
        validateApiKey(apiKeyHeader);
        log.info("Programmatic AiSensy ride tracking query for phone: {}", phone);

        List<RideStatus> activeStatuses = Arrays.asList(
                RideStatus.SEARCHING, RideStatus.DRIVER_ASSIGNED, 
                RideStatus.DRIVER_ARRIVING, RideStatus.ACCEPTED, RideStatus.ONGOING);

        Ride ride = rideRepository.findFirstByCustomerWhatsappPhoneAndStatusInOrderByBookingTimeDesc(phone, activeStatuses)
                .orElseThrow(() -> new com.cabgo.exception.ResourceNotFoundException("No active rides found for phone: " + phone));

        // Create mock response mapping
        RideTrackingController.CustomerTrackingResponse.CustomerTrackingResponseBuilder builder =
                RideTrackingController.CustomerTrackingResponse.builder()
                        .rideId(ride.getId())
                        .status(ride.getStatus());

        if (ride.getDriverId() != null) {
            builder.driverId(ride.getDriverId())
                   .driverName(ride.getDriverName())
                   .driverPhone(ride.getDriverPhone())
                   .vehicleNumber(ride.getDriverVehicleNumber());

            Optional<Driver> driverOpt = driverRepository.findById(ride.getDriverId());
            if (driverOpt.isPresent()) {
                Driver d = driverOpt.get();
                builder.driverLatitude(d.getLatitude())
                       .driverLongitude(d.getLongitude());
                
                double destLat = (ride.getStatus() == RideStatus.ONGOING) ? ride.getDropLatitude() : ride.getPickupLatitude();
                double destLng = (ride.getStatus() == RideStatus.ONGOING) ? ride.getDropLongitude() : ride.getPickupLongitude();
                
                GoogleMapsService.DistanceResult route = googleMapsService.getDistance(
                        d.getLatitude(), d.getLongitude(), destLat, destLng
                );
                
                builder.etaMinutes(route.durationMinutes())
                       .distanceKm(route.distanceKm())
                       .etaText(route.durationText())
                       .distanceText(route.distanceText());
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Ride tracked", builder.build()));
    }

    @PostMapping("/driver/onboard")
    public ResponseEntity<ApiResponse<Driver>> onboardDriver(
            @RequestHeader(value = "X-AiSensy-Project-API-Pwd", required = false) String apiKeyHeader,
            @RequestBody DriverOnboardRequest request) {
        
        validateApiKey(apiKeyHeader);
        log.info("Programmatic Driver onboarding received for phone: {}", request.getPhone());

        String normPhone = normalizePhone(request.getPhone());
        
        VehicleCategory cat = VehicleCategory.SEDAN;
        try {
            if (request.getVehicleCategory() != null) {
                cat = VehicleCategory.valueOf(request.getVehicleCategory().toUpperCase());
            }
        } catch (Exception e) {}

        Driver driver = Driver.builder()
                .name(request.getName())
                .phone(normPhone)
                .whatsappPhone(request.getPhone())
                .email(request.getEmail())
                .cityId(request.getCity())
                .vehicleCategory(cat)
                .vehicleModel(request.getVehicleModel())
                .vehicleNumber(request.getVehicleNumber() != null ? request.getVehicleNumber().toUpperCase() : null)
                .vehicleColor(request.getVehicleColor())
                .aadhaarNumber(request.getAadhaarNumber())
                .licenseNumber(request.getLicenseNumber() != null ? request.getLicenseNumber().toUpperCase() : null)
                .profileImage(request.getProfileImage())
                .aadhaarImage(request.getAadhaarImage())
                .licenseImage(request.getLicenseImage())
                .rcImage(request.getRcImage())
                .vehicleImage(request.getVehicleImage())
                .verificationStatus(VerificationStatus.PENDING)
                .status(DriverStatus.OFFLINE)
                .availableForRide(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        driver = driverRepository.save(driver);

        return ResponseEntity.ok(ApiResponse.success("Driver application submitted successfully", driver));
    }
}
