package com.cabgo.service;

import com.cabgo.enums.DriverStatus;
import com.cabgo.enums.RideStatus;
import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Driver;
import com.cabgo.model.Ride;
import com.cabgo.repository.DriverRepository;
import com.cabgo.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverRideService {

    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;

    public List<Ride> getAvailableRequests(String phone) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        
        return rideRepository.findByStatusAndVehicleCategory(RideStatus.REQUESTED, driver.getVehicleCategory());
    }

    public Ride acceptRide(String phone, String rideId) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        if (driver.getStatus() != DriverStatus.ONLINE) {
            throw new BadRequestException("Driver must be ONLINE to accept rides");
        }

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new BadRequestException("Ride is no longer available");
        }

        List<Ride> activeRides = rideRepository.findByDriverIdAndStatusIn(driver.getId(), 
                Arrays.asList(RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.ONGOING));
        
        if (!activeRides.isEmpty()) {
            throw new BadRequestException("Driver already has an active ride");
        }

        ride.setDriverId(driver.getId());
        ride.setDriverName(driver.getName());
        ride.setStatus(RideStatus.ACCEPTED);
        ride.setAcceptedAt(LocalDateTime.now());

        return rideRepository.save(ride);
    }

    public Ride updateRideStatus(String phone, String rideId, RideStatus status) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!driver.getId().equals(ride.getDriverId())) {
            throw new BadRequestException("Ride does not belong to this driver");
        }

        validateStateTransition(ride.getStatus(), status);

        ride.setStatus(status);
        if (status == RideStatus.ARRIVED) ride.setArrivedAt(LocalDateTime.now());
        else if (status == RideStatus.ONGOING) ride.setStartedAt(LocalDateTime.now());
        else if (status == RideStatus.COMPLETED) {
            ride.setCompletedAt(LocalDateTime.now());
            driver.setTotalRides(driver.getTotalRides() + 1);
            driver.setTotalEarnings(driver.getTotalEarnings() + ride.getFare());
            driverRepository.save(driver);
        }

        return rideRepository.save(ride);
    }

    public Ride getActiveRide(String phone) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        List<Ride> activeRides = rideRepository.findByDriverIdAndStatusIn(driver.getId(), 
                Arrays.asList(RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.ONGOING));
        
        return activeRides.isEmpty() ? null : activeRides.get(0);
    }

    private void validateStateTransition(RideStatus current, RideStatus next) {
        if (next == RideStatus.ARRIVED && current != RideStatus.ACCEPTED) {
            throw new BadRequestException("Invalid state transition to ARRIVED");
        }
        if (next == RideStatus.ONGOING && current != RideStatus.ARRIVED) {
            throw new BadRequestException("Invalid state transition to ONGOING");
        }
        if (next == RideStatus.COMPLETED && current != RideStatus.ONGOING) {
            throw new BadRequestException("Invalid state transition to COMPLETED");
        }
    }
}
