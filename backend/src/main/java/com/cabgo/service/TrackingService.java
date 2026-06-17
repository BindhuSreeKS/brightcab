package com.cabgo.service;

import com.cabgo.model.Driver;
import com.cabgo.model.Ride;
import com.cabgo.repository.DriverRepository;
import com.cabgo.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingService {

    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Update driver location and broadcast to relevant topics.
     */
    public void updateLocation(String driverId, String rideId, double latitude, double longitude) {
        log.debug("Updating location for driver: {}, ride: {}, lat: {}, lng: {}", driverId, rideId, latitude, longitude);

        // 1. Update driver's coordinates in DB
        Optional<Driver> driverOpt = driverRepository.findById(driverId);
        if (driverOpt.isPresent()) {
            Driver driver = driverOpt.get();
            driver.setLatitude(latitude);
            driver.setLongitude(longitude);
            driverRepository.save(driver);
        }

        // 2. Prepare payload
        Map<String, Object> payload = Map.of(
            "driverId", driverId,
            "rideId", rideId != null ? rideId : "",
            "latitude", latitude,
            "longitude", longitude,
            "timestamp", System.currentTimeMillis()
        );

        // 3. Broadcast to ride-specific topic if ride is active
        if (rideId != null && !rideId.trim().isEmpty()) {
            messagingTemplate.convertAndSend("/topic/ride/" + rideId + "/location", payload);
        }

        // 4. Broadcast to general admin tracking topic
        messagingTemplate.convertAndSend("/topic/admin/rides", payload);
    }
}
