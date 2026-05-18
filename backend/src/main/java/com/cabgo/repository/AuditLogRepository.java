package com.cabgo.repository;

import com.cabgo.enums.AuditAction;
import com.cabgo.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    Page<AuditLog> findByAdminId(String adminId, Pageable pageable);

    Page<AuditLog> findByModule(String module, Pageable pageable);

    Page<AuditLog> findByAction(AuditAction action, Pageable pageable);

    List<AuditLog> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
