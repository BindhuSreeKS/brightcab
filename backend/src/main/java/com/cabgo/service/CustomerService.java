package com.cabgo.service;

import com.cabgo.dto.response.CustomerResponse;
import com.cabgo.enums.AuditAction;
import com.cabgo.enums.CustomerStatus;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Customer;
import com.cabgo.repository.CustomerRepository;
import com.cabgo.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AuditLogService auditLogService;

    public PagedResponse<CustomerResponse> getAllCustomers(String search, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Customer> customers;
        if (search != null && !search.isBlank()) {
            customers = customerRepository.searchCustomers(search.trim(), pageable);
        } else if (status != null) {
            customers = customerRepository.findByStatus(CustomerStatus.valueOf(status), pageable);
        } else {
            customers = customerRepository.findAll(pageable);
        }
        return buildPagedResponse(customers);
    }

    public CustomerResponse getCustomerById(String id) {
        return customerRepository.findById(id).map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    public CustomerResponse blockCustomer(String id, String adminId) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        customer.setStatus(CustomerStatus.BLOCKED);
        Customer saved = customerRepository.save(customer);
        auditLogService.log(adminId, null, AuditAction.SUSPEND, "CUSTOMER", id, "Customer blocked: " + customer.getName());
        return mapToResponse(saved);
    }

    public CustomerResponse unblockCustomer(String id, String adminId) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        customer.setStatus(CustomerStatus.ACTIVE);
        Customer saved = customerRepository.save(customer);
        auditLogService.log(adminId, null, AuditAction.ACTIVATE, "CUSTOMER", id, "Customer unblocked: " + customer.getName());
        return mapToResponse(saved);
    }

    public Map<String, Long> getCustomerStats() {
        return Map.of("total", customerRepository.count(),
                "active", customerRepository.countByStatus(CustomerStatus.ACTIVE),
                "blocked", customerRepository.countByStatus(CustomerStatus.BLOCKED));
    }

    private PagedResponse<CustomerResponse> buildPagedResponse(Page<Customer> page) {
        return PagedResponse.<CustomerResponse>builder()
                .content(page.map(this::mapToResponse).getContent())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).first(page.isFirst()).build();
    }

    public CustomerResponse mapToResponse(Customer c) {
        return CustomerResponse.builder().id(c.getId()).name(c.getName()).phone(c.getPhone())
                .email(c.getEmail()).status(c.getStatus()).totalRides(c.getTotalRides())
                .cancellationRate(c.getCancellationRate()).rating(c.getRating())
                .walletBalance(c.getWalletBalance()).profileImage(c.getProfileImage())
                .createdAt(c.getCreatedAt()).build();
    }
}
