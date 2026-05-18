package com.cabgo.repository;

import com.cabgo.model.Earnings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EarningsRepository extends MongoRepository<Earnings, String> {
    List<Earnings> findByDriverId(String driverId);
}
