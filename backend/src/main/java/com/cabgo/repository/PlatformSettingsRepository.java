package com.cabgo.repository;

import com.cabgo.model.PlatformSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlatformSettingsRepository extends MongoRepository<PlatformSettings, String> {

    Optional<PlatformSettings> findByKey(String key);

    List<PlatformSettings> findByCategory(String category);
}
