package com.cabgo.service;

import com.cabgo.model.Customer;
import com.cabgo.model.Transaction;
import com.cabgo.repository.CustomerRepository;
import com.cabgo.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public Double getBalance(String customerId) {
        return customerRepository.findById(customerId)
                .map(Customer::getWalletBalance)
                .orElse(0.0);
    }

    @Transactional
    public void addMoney(String customerId, Double amount) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setWalletBalance(customer.getWalletBalance() + amount);
        customerRepository.save(customer);

        Transaction transaction = Transaction.builder()
                .customerId(customerId)
                .type("CREDIT")
                .amount(amount)
                .description("Money added to wallet")
                .build();
        transactionRepository.save(transaction);
    }

    public Page<Transaction> getTransactions(String customerId, Pageable pageable) {
        return transactionRepository.findByCustomerIdOrderByTimestampDesc(customerId, pageable);
    }

    public Page<Transaction> getAllPayments(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null && !status.isEmpty()) {
            return transactionRepository.findByStatusOrderByTimestampDesc(status, pageable);
        }
        return transactionRepository.findAll(pageable);
    }

    public Map<String, Object> getRevenueStats() {
        List<Transaction> transactions = transactionRepository.findAll();
        double totalRevenue = transactions.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus()))
                .mapToDouble(Transaction::getAmount)
                .sum();
        
        long totalTransactions = transactions.size();
        
        return Map.of(
                "totalRevenue", totalRevenue,
                "totalTransactions", totalTransactions
        );
    }

    public Transaction getById(String id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    public Transaction processRefund(String id, String reason) {
        Transaction transaction = getById(id);
        transaction.setStatus("REFUNDED");
        return transactionRepository.save(transaction);
    }
}
