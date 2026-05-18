package com.cabgo.service;

import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.PlatformSettings;
import com.cabgo.repository.PlatformSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatformSettingsService {

    private final PlatformSettingsRepository settingsRepository;

    public List<PlatformSettings> getAllSettings() {
        return settingsRepository.findAll();
    }

    public List<PlatformSettings> getSettingsByCategory(String category) {
        return settingsRepository.findByCategory(category);
    }

    public PlatformSettings getSettingByKey(String key) {
        return settingsRepository.findByKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found: " + key));
    }

    public PlatformSettings upsertSetting(String key, Object value, String category, String description, String adminId) {
        PlatformSettings setting = settingsRepository.findByKey(key).orElse(
                PlatformSettings.builder().key(key).category(category).description(description).build()
        );
        setting.setValue(value);
        setting.setUpdatedBy(adminId);
        return settingsRepository.save(setting);
    }
}
