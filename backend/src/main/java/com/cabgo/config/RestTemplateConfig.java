package com.cabgo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Provides a shared RestTemplate bean.
 * Spring Boot 3.x does not auto-configure RestTemplate, so we register it here.
 * Used by GeminiService and any other service that makes outbound HTTP calls via RestTemplate.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
