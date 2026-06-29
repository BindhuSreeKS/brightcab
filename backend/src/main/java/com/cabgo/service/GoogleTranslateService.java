package com.cabgo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Translates WhatsApp bot messages using Google Cloud Translation API v2.
 * Supported target languages: "en" (English), "hi" (Hindi), "kn" (Kannada).
 * Falls back to the original English text if the API key is absent or the call fails.
 */
@Slf4j
@Service
public class GoogleTranslateService {

    @Value("${google.translate.api-key:}")
    private String apiKey;

    private static final String TRANSLATE_URL =
        "https://translation.googleapis.com/language/translate/v2";

    private static final MediaType JSON_TYPE =
        MediaType.get("application/json; charset=utf-8");

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Translate {@code text} into {@code targetLang}.
     *
     * @param text       Source text (English)
     * @param targetLang ISO-639-1 language code, e.g. "hi", "kn"
     * @return Translated text, or the original {@code text} on any failure
     */
    public String translate(String text, String targetLang) {
        if (text == null || text.isBlank()) return text;
        if (apiKey == null || apiKey.isBlank()) {
            log.debug("Google Translate API key not configured – skipping translation");
            return text;
        }
        if ("en".equalsIgnoreCase(targetLang)) return text;

        try {
            String url = TRANSLATE_URL + "?key=" + apiKey;
            String body = objectMapper.writeValueAsString(
                Map.of("q", text, "target", targetLang, "format", "text")
            );

            Request request = new Request.Builder()
                .url(url)
                .post(RequestBody.create(body, JSON_TYPE))
                .addHeader("Content-Type", "application/json")
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful() || response.body() == null) {
                    log.warn("Google Translate error – HTTP {}", response.code());
                    return text;
                }
                JsonNode root = objectMapper.readTree(response.body().string());
                String translated = root
                    .path("data")
                    .path("translations")
                    .path(0)
                    .path("translatedText")
                    .asText(null);

                return (translated != null && !translated.isBlank()) ? translated : text;
            }
        } catch (Exception e) {
            log.error("Translation failed [lang={}]: {}", targetLang, e.getMessage());
            return text;
        }
    }
}
