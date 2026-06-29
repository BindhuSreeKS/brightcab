package com.cabgo.repository;

import com.cabgo.model.RideTracking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RideTrackingRepository extends MongoRepository<RideTracking, String> {
    Optional<RideTracking> findByRideId(String rideId);
}
