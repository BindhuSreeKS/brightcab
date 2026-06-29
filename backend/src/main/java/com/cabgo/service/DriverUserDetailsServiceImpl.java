package com.cabgo.service;

import com.cabgo.model.Driver;
import com.cabgo.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DriverUserDetailsServiceImpl implements UserDetailsService {

    private final DriverRepository driverRepository;

    @Override
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found with phone: " + phone));

        return User.builder()
                .username(driver.getPhone())
                .password(driver.getPassword() != null ? driver.getPassword() : "")
                .roles("DRIVER")
                .build();
    }
}
