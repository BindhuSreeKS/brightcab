package com.cabgo.controller;

import com.cabgo.dto.request.CreateAdminRequest;
import com.cabgo.enums.AdminStatus;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/super-admin/admins")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createAdmin(
            @Valid @RequestBody CreateAdminRequest request,
            Authentication auth) {
        var admin = adminService.createAdmin(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Admin created", admin));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllAdmins(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var admins = adminService.getAllAdmins(search, page, size);
        return ResponseEntity.ok(ApiResponse.success(admins));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getAdminById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAdminById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateAdmin(
            @PathVariable String id,
            @Valid @RequestBody CreateAdminRequest request,
            Authentication auth) {
        var updated = adminService.updateAdmin(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Admin updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteAdmin(@PathVariable String id, Authentication auth) {
        adminService.deleteAdmin(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Admin deleted", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> changeStatus(
            @PathVariable String id,
            @RequestParam AdminStatus status,
            Authentication auth) {
        var admin = adminService.changeAdminStatus(id, status, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Status updated", admin));
    }
}
