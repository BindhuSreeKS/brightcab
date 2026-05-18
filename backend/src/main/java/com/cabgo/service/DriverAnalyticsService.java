package com.cabgo.service;

import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Driver;
import com.cabgo.model.Earnings;
import com.cabgo.model.Ride;
import com.cabgo.repository.DriverRepository;
import com.cabgo.repository.EarningsRepository;
import com.cabgo.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DriverAnalyticsService {

    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final EarningsRepository earningsRepository;

    public Map<String, Object> getEarningsSummary(String phone) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        List<Earnings> earnings = earningsRepository.findByDriverId(driver.getId());
        
        double totalEarnings = earnings.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0).sum();
        double totalIncentives = earnings.stream().mapToDouble(e -> e.getIncentive() != null ? e.getIncentive() : 0).sum();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEarnings", totalEarnings);
        summary.put("totalIncentives", totalIncentives);
        summary.put("totalBalance", totalEarnings + totalIncentives);
        summary.put("rideCount", driver.getTotalRides());
        
        return summary;
    }

    public Page<Ride> getRideHistory(String phone, int page, int size) {
        Driver driver = driverRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return rideRepository.findByDriverId(driver.getId(), pageable);
    }
}
