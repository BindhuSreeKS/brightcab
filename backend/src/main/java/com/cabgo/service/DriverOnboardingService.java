package com.cabgo.service;

import com.cabgo.enums.BackgroundCheckStatus;
import com.cabgo.enums.DriverStatus;
import com.cabgo.enums.VerificationStatus;
import com.cabgo.model.Driver;
import com.cabgo.model.DriverApplication;
import com.cabgo.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverOnboardingService {

    private final DriverRepository driverRepository;

    private DriverApplication mapDriverToApplication(Driver driver) {
        return DriverApplication.builder()
                .id(driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .city(driver.getCityId())
                .vehicleModel(driver.getVehicleModel())
                .vehicleNumber(driver.getVehicleNumber())
                .vehicleColor(driver.getVehicleColor())
                .vehicleCategory(driver.getVehicleCategory())
                .aadhaarNumber(driver.getAadhaarNumber())
                .licenseNumber(driver.getLicenseNumber())
                .driverSelfieImage(driver.getProfileImage())
                .aadhaarFrontImage(driver.getAadhaarImage())
                .licenseImage(driver.getLicenseImage())
                .rcBookImage(driver.getRcImage())
                .vehicleFrontImage(driver.getVehicleImage())
                .verificationStatus(driver.getVerificationStatus())
                .backgroundCheckStatus(BackgroundCheckStatus.PENDING)
                .verificationProgress(driver.getVerificationStatus() == VerificationStatus.APPROVED ? 100 : 50)
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .rejectionReason(driver.getRejectionReason())
                .build();
    }

    public List<DriverApplication> getAllApplications() {
        return driverRepository.findAll().stream()
                .map(this::mapDriverToApplication)
                .collect(Collectors.toList());
    }

    public DriverApplication getApplicationById(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return mapDriverToApplication(driver);
    }

    public DriverApplication updateApplicationStatus(String id, VerificationStatus status, String reason) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        driver.setVerificationStatus(status);
        if (reason != null) {
            driver.setRejectionReason(reason);
        }
        return mapDriverToApplication(driverRepository.save(driver));
    }

    public DriverApplication updateProgress(String id, Integer progress) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        // progress is mocked in the mapping anyway, but we could add a field to Driver if needed
        return mapDriverToApplication(driverRepository.save(driver));
    }

    @Transactional
    public Driver activateDriver(String id, Map<String, Object> activationConfig) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        driver.setVerificationStatus(VerificationStatus.APPROVED);
        driver.setStatus(DriverStatus.OFFLINE);
        
        return driverRepository.save(driver);
    }

    public Map<String, Long> getOnboardingStats() {
        List<Driver> drivers = driverRepository.findAll();
        long total = drivers.size();
        long pending = drivers.stream().filter(d -> d.getVerificationStatus() == VerificationStatus.PENDING).count();
        long approved = drivers.stream().filter(d -> d.getVerificationStatus() == VerificationStatus.APPROVED).count();
        long rejected = drivers.stream().filter(d -> d.getVerificationStatus() == VerificationStatus.REJECTED).count();
        
        return Map.of(
            "totalRequests", total,
            "pendingVerification", pending,
            "approvedDrivers", approved,
            "rejectedApplications", rejected
        );
    }
}
