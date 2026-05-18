package com.cabgo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "platform_settings")
public class PlatformSettings {

    @Id
    private String id;

    private String key;

    private Object value;

    private String category; // GENERAL | RIDE | PAYMENT | NOTIFICATION | SECURITY

    private String description;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String updatedBy;
}
