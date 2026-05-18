package com.cabgo.dto.response;

import com.cabgo.enums.AdminRole;
import com.cabgo.enums.AdminStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponse {

    private String id;
    private String name;
    private String email;
    private String phone;
    private AdminRole role;
    private AdminStatus status;
    private Set<String> permissions;
    private String roleId;
    private LocalDateTime lastLogin;
    private String profileImage;
    private LocalDateTime createdAt;
}
