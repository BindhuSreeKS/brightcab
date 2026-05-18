package com.cabgo.repository;

import com.cabgo.enums.DriverStatus;
import com.cabgo.enums.VerificationStatus;
import com.cabgo.model.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends MongoRepository<Driver, String> {

    Optional<Driver> findByEmail(String email);

    Optional<Driver> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Page<Driver> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    Page<Driver> findByStatus(DriverStatus status, Pageable pageable);

    Page<Driver> findByCityId(String cityId, Pageable pageable);

    long countByVerificationStatus(VerificationStatus status);

    long countByStatus(DriverStatus status);

    @Query("{ $or: [ { name: { $regex: ?0, $options: 'i' } }, { phone: { $regex: ?0, $options: 'i' } }, { email: { $regex: ?0, $options: 'i' } } ] }")
    Page<Driver> searchDrivers(String keyword, Pageable pageable);
}
