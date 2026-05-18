package com.cabgo.service;

import com.cabgo.dto.response.CustomerResponse;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Customer;
import com.cabgo.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerProfileService {

    private final CustomerRepository customerRepository;
    private final CustomerAuthService authService;

    public CustomerResponse getProfile(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return authService.mapToResponse(customer);
    }

    public CustomerResponse updateProfile(String customerId, CustomerResponse updateData) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (updateData.getName() != null) customer.setName(updateData.getName());
        if (updateData.getEmail() != null) customer.setEmail(updateData.getEmail());
        if (updateData.getProfilePhoto() != null) customer.setProfilePhoto(updateData.getProfilePhoto());

        customerRepository.save(customer);
        return authService.mapToResponse(customer);
    }
}
