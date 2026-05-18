package com.cabgo.repository;

import com.cabgo.enums.ComplaintStatus;
import com.cabgo.enums.ComplaintType;
import com.cabgo.model.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends MongoRepository<Complaint, String> {

    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);

    Page<Complaint> findByType(ComplaintType type, Pageable pageable);

    Page<Complaint> findByRaisedBy(String raisedBy, Pageable pageable);

    List<Complaint> findByIsSOS(boolean isSOS);

    long countByStatus(ComplaintStatus status);

    long countByIsSOS(boolean isSOS);
}
