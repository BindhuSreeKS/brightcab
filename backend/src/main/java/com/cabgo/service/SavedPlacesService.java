package com.cabgo.service;

import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Customer;
import com.cabgo.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedPlacesService {

    private final CustomerRepository customerRepository;

    public List<Customer.SavedPlace> getSavedPlaces(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return customer.getSavedPlaces();
    }

    public void addSavedPlace(String customerId, Customer.SavedPlace place) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        customer.getSavedPlaces().add(place);
        customerRepository.save(customer);
    }

    public void removeSavedPlace(String customerId, String placeName) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        customer.getSavedPlaces().removeIf(p -> p.getName().equalsIgnoreCase(placeName));
        customerRepository.save(customer);
    }
}
