package com.cabgo.repository;

import com.cabgo.model.FestivalConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FestivalConfigRepository extends MongoRepository<FestivalConfig, String> {
    List<FestivalConfig> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date1, LocalDate date2);
}
