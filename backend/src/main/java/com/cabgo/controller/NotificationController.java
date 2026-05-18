package com.cabgo.controller;

import com.cabgo.model.Notification;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(Authentication authentication) {
        String userId = authentication.getName();
        List<Notification> notifications = notificationService.getNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", notifications));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
