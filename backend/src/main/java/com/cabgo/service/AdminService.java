package com.cabgo.service;

import com.cabgo.dto.request.CreateAdminRequest;
import com.cabgo.dto.response.AdminResponse;
import com.cabgo.enums.AdminStatus;
import com.cabgo.enums.AuditAction;
import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Admin;
import com.cabgo.repository.AdminRepository;
import com.cabgo.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public AdminResponse createAdmin(CreateAdminRequest request, String createdBy) {
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Admin admin = Admin.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .permissions(request.getPermissions())
                .roleId(request.getRoleId())
                .createdBy(createdBy)
                .build();

        Admin saved = adminRepository.save(admin);
        auditLogService.log(createdBy, null, AuditAction.CREATE, "ADMIN", saved.getId(), "Created admin: " + saved.getEmail());
        return mapToResponse(saved);
    }

    public PagedResponse<AdminResponse> getAllAdmins(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Admin> admins;

        if (search != null && !search.isBlank()) {
            admins = adminRepository.searchAdmins(search.trim(), pageable);
        } else {
            admins = adminRepository.findAll(pageable);
        }

        return PagedResponse.<AdminResponse>builder()
                .content(admins.map(this::mapToResponse).getContent())
                .page(admins.getNumber())
                .size(admins.getSize())
                .totalElements(admins.getTotalElements())
                .totalPages(admins.getTotalPages())
                .last(admins.isLast())
                .first(admins.isFirst())
                .build();
    }

    public AdminResponse getAdminById(String id) {
        return adminRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", id));
    }

    public AdminResponse updateAdmin(String id, CreateAdminRequest request, String updatedBy) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", id));

        if (!admin.getEmail().equals(request.getEmail()) && adminRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setRole(request.getRole());
        admin.setPermissions(request.getPermissions());
        admin.setRoleId(request.getRoleId());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Admin updated = adminRepository.save(admin);
        auditLogService.log(updatedBy, null, AuditAction.UPDATE, "ADMIN", id, "Updated admin: " + admin.getEmail());
        return mapToResponse(updated);
    }

    public void deleteAdmin(String id, String deletedBy) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", id));
        adminRepository.deleteById(id);
        auditLogService.log(deletedBy, null, AuditAction.DELETE, "ADMIN", id, "Deleted admin: " + admin.getEmail());
    }

    public AdminResponse changeAdminStatus(String id, AdminStatus status, String changedBy) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", id));
        admin.setStatus(status);
        Admin updated = adminRepository.save(admin);
        auditLogService.log(changedBy, null, AuditAction.UPDATE, "ADMIN", id,
                "Changed admin status to " + status + ": " + admin.getEmail());
        return mapToResponse(updated);
    }

    public AdminResponse mapToResponse(Admin admin) {
        return AdminResponse.builder()
                .id(admin.getId())
                .name(admin.getName())
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .role(admin.getRole())
                .status(admin.getStatus())
                .permissions(admin.getPermissions())
                .roleId(admin.getRoleId())
                .lastLogin(admin.getLastLogin())
                .profileImage(admin.getProfileImage())
                .createdAt(admin.getCreatedAt())
                .build();
    }
}
