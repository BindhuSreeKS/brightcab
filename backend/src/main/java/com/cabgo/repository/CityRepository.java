package com.cabgo.repository;

import com.cabgo.model.City;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CityRepository extends MongoRepository<City, String> {

    List<City> findByActive(boolean active);

    Page<City> findByActive(boolean active, Pageable pageable);

    boolean existsByName(String name);
}
