package com.cabgo.service;

import com.cabgo.dto.response.DriverResponse;
import com.cabgo.enums.AuditAction;
import com.cabgo.enums.DriverStatus;
import com.cabgo.enums.VerificationStatus;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Driver;
import com.cabgo.repository.DriverRepository;
import com.cabgo.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final AuditLogService auditLogService;

    public PagedResponse<DriverResponse> getAllDrivers(String search, String status,
                                                        String verificationStatus, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Driver> drivers;

        if (search != null && !search.isBlank()) {
            drivers = driverRepository.searchDrivers(search.trim(), pageable);
        } else if (verificationStatus != null) {
            drivers = driverRepository.findByVerificationStatus(VerificationStatus.valueOf(verificationStatus), pageable);
        } else if (status != null) {
            drivers = driverRepository.findByStatus(DriverStatus.valueOf(status), pageable);
        } else {
            drivers = driverRepository.findAll(pageable);
        }

        return buildPagedResponse(drivers);
    }

    public DriverResponse getDriverById(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));
        return mapToResponse(driver);
    }

    public DriverResponse verifyDriver(String id, String adminId) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));
        driver.setVerificationStatus(VerificationStatus.APPROVED);
        Driver saved = driverRepository.save(driver);
        auditLogService.log(adminId, null, AuditAction.APPROVE, "DRIVER", id, "Driver approved: " + driver.getName());
        return mapToResponse(saved);
    }

    public DriverResponse rejectDriver(String id, String reason, String adminId) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));
        driver.setVerificationStatus(VerificationStatus.REJECTED);
        driver.setRejectionReason(reason);
        Driver saved = driverRepository.save(driver);
        auditLogService.log(adminId, null, AuditAction.REJECT, "DRIVER", id, "Driver rejected: " + driver.getName());
        return mapToResponse(saved);
    }

    public DriverResponse suspendDriver(String id, String adminId) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));
        driver.setStatus(DriverStatus.SUSPENDED);
        Driver saved = driverRepository.save(driver);
        auditLogService.log(adminId, null, AuditAction.SUSPEND, "DRIVER", id, "Driver suspended: " + driver.getName());
        return mapToResponse(saved);
    }

    public DriverResponse activateDriver(String id, String adminId) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));
        driver.setStatus(DriverStatus.OFFLINE);
        Driver saved = driverRepository.save(driver);
        auditLogService.log(adminId, null, AuditAction.ACTIVATE, "DRIVER", id, "Driver activated: " + driver.getName());
        return mapToResponse(saved);
    }

    public Map<String, Object> getDriverAnalytics(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", id));

        return Map.of(
                "totalRides", driver.getTotalRides(),
                "totalEarnings", driver.getTotalEarnings(),
                "rating", driver.getRating(),
                "status", driver.getStatus(),
                "verificationStatus", driver.getVerificationStatus()
        );
    }

    public Map<String, Long> getDriverStats() {
        return Map.of(
                "total", driverRepository.count(),
                "pending", driverRepository.countByVerificationStatus(VerificationStatus.PENDING),
                "approved", driverRepository.countByVerificationStatus(VerificationStatus.APPROVED),
                "rejected", driverRepository.countByVerificationStatus(VerificationStatus.REJECTED),
                "online", driverRepository.countByStatus(DriverStatus.ONLINE),
                "offline", driverRepository.countByStatus(DriverStatus.OFFLINE),
                "suspended", driverRepository.countByStatus(DriverStatus.SUSPENDED)
        );
    }

    private PagedResponse<DriverResponse> buildPagedResponse(Page<Driver> page) {
        return PagedResponse.<DriverResponse>builder()
                .content(page.map(this::mapToResponse).getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    public DriverResponse mapToResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .aadhaarNumber(driver.getAadhaarNumber())
                .licenseNumber(driver.getLicenseNumber())
                .vehicleNumber(driver.getVehicleNumber())
                .vehicleModel(driver.getVehicleModel())
                .vehicleCategory(driver.getVehicleCategory())
                .vehicleColor(driver.getVehicleColor())
                .verificationStatus(driver.getVerificationStatus())
                .status(driver.getStatus())
                .rating(driver.getRating())
                .totalRides(driver.getTotalRides())
                .totalEarnings(driver.getTotalEarnings())
                .cityId(driver.getCityId())
                .profileImage(driver.getProfileImage())
                .licenseImage(driver.getLicenseImage())
                .rcImage(driver.getRcImage())
                .aadhaarImage(driver.getAadhaarImage())
                .rejectionReason(driver.getRejectionReason())
                .createdAt(driver.getCreatedAt())
                .build();
    }
}
