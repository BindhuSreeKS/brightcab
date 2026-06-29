package com.cabgo.service;

import com.cabgo.model.Customer;
import com.cabgo.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service("customerUserDetailsService")
@RequiredArgsConstructor
public class CustomerUserDetailsServiceImpl implements UserDetailsService {

    private final CustomerRepository customerRepository;

    @Override
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found with phone: " + phone));

        return User.builder()
                .username(customer.getPhone())
                .password(customer.getPassword() != null ? customer.getPassword() : "")
                .roles("CUSTOMER")
                .build();
    }
}
