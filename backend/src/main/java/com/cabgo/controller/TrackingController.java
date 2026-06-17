package com.cabgo.controller;

import com.cabgo.service.TrackingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @Data
    public static class TrackingRequest {
        private String driverId;
        private String rideId;
        private double latitude;
        private double longitude;
    }

    /**
     * HTTP endpoint for GPS coordinates post.
     */
    @PostMapping("/update")
    public ResponseEntity<Void> updateLocationHttp(@RequestBody TrackingRequest request) {
        log.debug("HTTP tracking update received: {}", request);
        trackingService.updateLocation(
            request.getDriverId(), 
            request.getRideId(), 
            request.getLatitude(), 
            request.getLongitude()
        );
        return ResponseEntity.ok().build();
    }

    /**
     * WebSocket STOMP message handler for real-time tracking updates.
     * Destination: /app/driver.location
     */
    @MessageMapping("/driver.location")
    public void updateLocationWebSocket(TrackingRequest request) {
        log.debug("WebSocket tracking update received: {}", request);
        trackingService.updateLocation(
            request.getDriverId(), 
            request.getRideId(), 
            request.getLatitude(), 
            request.getLongitude()
        );
    }
}
