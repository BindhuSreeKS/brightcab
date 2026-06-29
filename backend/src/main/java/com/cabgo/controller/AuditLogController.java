package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/super-admin/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getAllLogs(page, size)));
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<ApiResponse<?>> getLogsByAdmin(
            @PathVariable String adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getLogsByAdmin(adminId, page, size)));
    }

    @GetMapping("/module/{module}")
    public ResponseEntity<ApiResponse<?>> getLogsByModule(
            @PathVariable String module,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getLogsByModule(module, page, size)));
    }
}
