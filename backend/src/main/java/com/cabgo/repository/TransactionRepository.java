package com.cabgo.repository;

import com.cabgo.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    Page<Transaction> findByCustomerIdOrderByTimestampDesc(String customerId, Pageable pageable);
    Page<Transaction> findByStatusOrderByTimestampDesc(String status, Pageable pageable);
}
