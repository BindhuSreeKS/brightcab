package com.cabgo.repository;

import com.cabgo.model.DriverLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverLocationRepository extends MongoRepository<DriverLocation, String> {
    List<DriverLocation> findByDriverIdOrderByTimestampDesc(String driverId);
    Optional<DriverLocation> findFirstByDriverIdOrderByTimestampDesc(String driverId);
}
