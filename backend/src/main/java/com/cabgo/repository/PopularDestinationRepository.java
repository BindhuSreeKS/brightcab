package com.cabgo.repository;

import com.cabgo.model.PopularDestination;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PopularDestinationRepository extends MongoRepository<PopularDestination, String> {
    List<PopularDestination> findByCityIgnoreCase(String city);
}
