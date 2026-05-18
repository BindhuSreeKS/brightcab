package com.cabgo.service;

import com.cabgo.dto.response.DriverResponse;
import com.cabgo.enums.DriverStatus;
import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Driver;
import com.cabgo.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DriverProfileService {

    private final DriverRepository driverRepository;
    private final DriverService driverService;

    public DriverResponse getProfile(String phone) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        return driverService.mapToResponse(driver);
    }

    public DriverResponse updateStatus(String phone, DriverStatus status) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        
        if (driver.getStatus() == DriverStatus.SUSPENDED) {
            throw new BadRequestException("Cannot change status while suspended");
        }
        
        driver.setStatus(status);
        return driverService.mapToResponse(driverRepository.save(driver));
    }
    
    public DriverResponse updateLocation(String phone, Double lat, Double lng) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        
        driver.setLatitude(lat);
        driver.setLongitude(lng);
        return driverService.mapToResponse(driverRepository.save(driver));
    }

    public DriverResponse uploadDocument(String phone, String documentType, String base64Image) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        
        switch (documentType.toLowerCase()) {
            case "license":
                driver.setLicenseImage(base64Image);
                break;
            case "rc":
                driver.setRcImage(base64Image);
                break;
            case "aadhaar":
                driver.setAadhaarImage(base64Image);
                break;
            default:
                throw new BadRequestException("Invalid document type");
        }
        return driverService.mapToResponse(driverRepository.save(driver));
    }
}
