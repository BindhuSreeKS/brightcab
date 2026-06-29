package com.cabgo.service;

import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Role;
import com.cabgo.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public Role createRole(Role role) {
        if (roleRepository.existsByName(role.getName())) {
            throw new BadRequestException("Role already exists: " + role.getName());
        }
        return roleRepository.save(role);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(String id) {
        return roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role", id));
    }

    public Role updateRole(String id, Role updated) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role", id));
        role.setName(updated.getName());
        role.setDescription(updated.getDescription());
        role.setModulePermissions(updated.getModulePermissions());
        return roleRepository.save(role);
    }

    public void deleteRole(String id) {
        roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role", id));
        roleRepository.deleteById(id);
    }
}
