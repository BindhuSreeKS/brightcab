package com.cabgo.service;

import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Driver;
import com.cabgo.model.SOSAlert;
import com.cabgo.repository.DriverRepository;
import com.cabgo.repository.SOSAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DriverSafetyService {

    private final DriverRepository driverRepository;
    private final SOSAlertRepository sosAlertRepository;

    public SOSAlert triggerSOS(String phone, String rideId, Map<String, Double> location) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        SOSAlert alert = SOSAlert.builder()
                .driverId(driver.getId())
                .rideId(rideId)
                .latitude(location.get("latitude"))
                .longitude(location.get("longitude"))
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        return sosAlertRepository.save(alert);
    }
}
