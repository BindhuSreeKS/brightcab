package com.cabgo.repository;

import com.cabgo.enums.VehicleCategory;
import com.cabgo.model.Pricing;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PricingRepository extends MongoRepository<Pricing, String> {

    Optional<Pricing> findByCategoryAndCityIdIsNull(VehicleCategory category);
    Optional<Pricing> findByCategoryAndCityId(VehicleCategory category, String cityId);
    List<Pricing> findByCategory(VehicleCategory category);
    List<Pricing> findByCityIdIsNull();
    List<Pricing> findByCityId(String cityId);
}
