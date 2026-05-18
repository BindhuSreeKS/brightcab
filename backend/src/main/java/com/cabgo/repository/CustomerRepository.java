package com.cabgo.repository;

import com.cabgo.enums.CustomerStatus;
import com.cabgo.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Optional;

public interface CustomerRepository extends MongoRepository<Customer, String> {
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'phone': { '$regex': ?0, '$options': 'i' } }, { 'email': { '$regex': ?0, '$options': 'i' } } ] }")
    Page<Customer> searchCustomers(String search, Pageable pageable);

    Page<Customer> findByStatus(CustomerStatus status, Pageable pageable);

    long countByStatus(CustomerStatus status);
}
