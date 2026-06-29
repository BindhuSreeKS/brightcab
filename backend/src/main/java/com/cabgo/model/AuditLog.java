package com.cabgo.model;

import com.cabgo.enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    private String adminId;

    private String adminName;

    private AuditAction action;

    private String module;

    private String entityId;

    private String entityType;

    private String details;

    private String ipAddress;

    private String userAgent;

    @CreatedDate
    private LocalDateTime createdAt;
}
