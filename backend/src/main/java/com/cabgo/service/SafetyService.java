package com.cabgo.service;

import com.cabgo.model.SOSAlert;
import com.cabgo.repository.SOSAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SafetyService {

    private final SOSAlertRepository sosRepository;
    private final NotificationService notificationService;

    public void triggerSOS(String customerId, String rideId, Double lat, Double lng) {
        SOSAlert alert = SOSAlert.builder()
                .customerId(customerId)
                .rideId(rideId)
                .latitude(lat)
                .longitude(lng)
                .message("Emergency SOS triggered by customer")
                .build();
        
        sosRepository.save(alert);
        
        log.error("SOS ALERT TRIGGERED: Customer {} at {}, {}", customerId, lat, lng);
        
        // In real app, send to emergency services and admin
        notificationService.sendNotification(customerId, "SOS Triggered", "Emergency services have been notified.", "SAFETY");
    }
}
