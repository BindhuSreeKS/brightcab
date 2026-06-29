package com.cabgo.controller;

import com.cabgo.model.Role;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/super-admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createRole(@RequestBody Role role) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role created", roleService.createRole(role)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.success(roleService.getAllRoles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getRoleById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(roleService.getRoleById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateRole(@PathVariable String id, @RequestBody Role role) {
        return ResponseEntity.ok(ApiResponse.success("Role updated", roleService.updateRole(id, role)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteRole(@PathVariable String id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success("Role deleted", null));
    }
}
