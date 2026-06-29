package com.cabgo.dto.request;

import com.cabgo.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SendNotificationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Type is required")
    private NotificationType type;

    // "ALL", "DRIVER", "CUSTOMER", "ADMIN" or null for targeted
    private String recipientType;

    // Specific recipient IDs for targeted notifications
    private List<String> recipientIds;
}
