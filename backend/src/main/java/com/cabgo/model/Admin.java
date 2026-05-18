package com.cabgo.model;

import com.cabgo.enums.AdminRole;
import com.cabgo.enums.AdminStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admins")
public class Admin {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String phone;

    private String password;

    private AdminRole role;

    @Builder.Default
    private AdminStatus status = AdminStatus.ACTIVE;

    private Set<String> permissions;

    private String roleId;

    private LocalDateTime lastLogin;

    private String profileImage;

    private String createdBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // For refresh token
    private String refreshToken;
}
