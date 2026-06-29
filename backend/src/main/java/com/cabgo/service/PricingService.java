package com.cabgo.service;

import com.cabgo.enums.VehicleCategory;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Pricing;
import com.cabgo.repository.PricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final PricingRepository pricingRepository;

    public List<Pricing> getAllPricing() {
        return pricingRepository.findByCityIdIsNull();
    }

    public List<Pricing> getPricingByCategory(VehicleCategory category) {
        return pricingRepository.findByCategory(category);
    }

    public Pricing createPricing(Pricing pricing, String adminEmail) {
        pricing.setUpdatedBy(adminEmail);
        pricing.setUpdatedAt(LocalDateTime.now());
        return pricingRepository.save(pricing);
    }

    public Pricing updatePricing(String id, Pricing updated, String adminId) {
        Pricing existing = pricingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing", id));
        existing.setBaseFare(updated.getBaseFare());
        existing.setPerKmRate(updated.getPerKmRate());
        existing.setPerMinuteRate(updated.getPerMinuteRate());
        existing.setMinimumFare(updated.getMinimumFare());
        existing.setSurgePriceMultiplier(updated.getSurgePriceMultiplier());
        existing.setSurgePricingEnabled(updated.isSurgePricingEnabled());
        existing.setNightSurgeMultiplier(updated.getNightSurgeMultiplier());
        existing.setNightPricingEnabled(updated.isNightPricingEnabled());
        existing.setCommissionPercentage(updated.getCommissionPercentage());
        existing.setUpdatedBy(adminId);
        return pricingRepository.save(existing);
    }
}
