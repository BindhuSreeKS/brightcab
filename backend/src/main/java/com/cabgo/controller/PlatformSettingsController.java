package com.cabgo.controller;

import com.cabgo.model.PlatformSettings;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.PlatformSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/super-admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class PlatformSettingsController {

    private final PlatformSettingsService settingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getAllSettings()));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<?>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getSettingsByCategory(category)));
    }

    @GetMapping("/{key}")
    public ResponseEntity<ApiResponse<?>> getByKey(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getSettingByKey(key)));
    }

    @PutMapping("/{key}")
    public ResponseEntity<ApiResponse<?>> upsertSetting(
            @PathVariable String key,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        Object value = body.get("value");
        String category = (String) body.getOrDefault("category", "GENERAL");
        String description = (String) body.getOrDefault("description", "");
        PlatformSettings saved = settingsService.upsertSetting(key, value, category, description, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Setting updated", saved));
    }
}
