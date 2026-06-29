package com.cabgo.repository;

import com.cabgo.enums.VerificationStatus;
import com.cabgo.model.DriverApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverApplicationRepository extends MongoRepository<DriverApplication, String> {
    Optional<DriverApplication> findByPhone(String phone);
    Optional<DriverApplication> findByEmail(String email);
    List<DriverApplication> findByVerificationStatus(VerificationStatus status);
}
