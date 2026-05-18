package com.cabgo.service;

import com.cabgo.enums.AuditAction;
import com.cabgo.model.AuditLog;
import com.cabgo.repository.AuditLogRepository;
import com.cabgo.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(String adminId, String adminName, AuditAction action,
                    String module, String entityId, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .adminId(adminId)
                    .adminName(adminName)
                    .action(action)
                    .module(module)
                    .entityId(entityId)
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }

    public PagedResponse<AuditLog> getAllLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logsPage = auditLogRepository.findAll(pageable);
        return buildPagedResponse(logsPage);
    }

    public PagedResponse<AuditLog> getLogsByAdmin(String adminId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logsPage = auditLogRepository.findByAdminId(adminId, pageable);
        return buildPagedResponse(logsPage);
    }

    public PagedResponse<AuditLog> getLogsByModule(String module, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logsPage = auditLogRepository.findByModule(module, pageable);
        return buildPagedResponse(logsPage);
    }

    private PagedResponse<AuditLog> buildPagedResponse(Page<AuditLog> page) {
        return PagedResponse.<AuditLog>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
