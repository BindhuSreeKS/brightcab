package com.cabgo.repository;

import com.cabgo.enums.PaymentStatus;
import com.cabgo.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByRideId(String rideId);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    Page<Payment> findByCustomerId(String customerId, Pageable pageable);

    Page<Payment> findByDriverId(String driverId, Pageable pageable);

    @Query("{ createdAt: { $gte: ?0, $lte: ?1 } }")
    List<Payment> findByDateRange(LocalDateTime from, LocalDateTime to);

    long countByStatus(PaymentStatus status);
}
