package com.cabgo.repository;

import com.cabgo.model.SOSAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SOSAlertRepository extends MongoRepository<SOSAlert, String> {
    List<SOSAlert> findByCustomerIdOrderByTimestampDesc(String customerId);
}
