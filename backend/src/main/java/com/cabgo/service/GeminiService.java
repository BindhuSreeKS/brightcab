package com.cabgo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Calls the Google Gemini API (gemini-pro) to generate a conversational reply.
 *
 * Used as a fallback NLP layer inside ChatSessionService when the rule-based
 * state machine cannot match the user's input.
 *
 * Endpoint:
 *   POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={key}
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private static final String GEMINI_ENDPOINT =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=";

    private static final String SYSTEM_PROMPT =
            "You are BrightCab, a friendly cab booking assistant for Vazra Mobility. " +
            "When a user messages you, extract pickup location, drop location, and time if mentioned. " +
            "If details are missing, ask for them one by one. " +
            "Once you have pickup + drop + time, confirm the booking clearly. " +
            "Keep all replies under 150 words. Be friendly and concise.";

    private static final String FALLBACK_REPLY =
            "Sorry, I'm having trouble right now. Please call +91 90359 99800.";

    @Value("${google.gemini.api-key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Send a message to Gemini and return the assistant's text reply.
     *
     * @param userMessage the raw text the user sent via WhatsApp
     * @return Gemini's reply, or the fallback string on any error
     */
    public String getReply(String userMessage) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.equals("YOUR_GEMINI_API_KEY")) {
            log.warn("GeminiService: API key is not configured — returning fallback reply");
            return FALLBACK_REPLY;
        }

        try {
            String url = GEMINI_ENDPOINT + geminiApiKey;

            // Build the request body
            Map<String, Object> body = Map.of(
                "contents", List.of(
                    Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", SYSTEM_PROMPT + "\n\nUser: " + userMessage))
                    )
                ),
                "generationConfig", Map.of(
                    "temperature",     0.7,
                    "maxOutputTokens", 300
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Gemini API returned non-2xx: {}", response.getStatusCode());
                return FALLBACK_REPLY;
            }

            // Parse: candidates[0].content.parts[0].text
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode text = root
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text");

            if (text == null || text.isMissingNode()) {
                log.warn("Gemini response had no text node: {}", response.getBody());
                return FALLBACK_REPLY;
            }

            String reply = text.asText().trim();
            log.info("Gemini reply ({} chars): {}", reply.length(), reply.substring(0, Math.min(80, reply.length())));
            return reply;

        } catch (Exception e) {
            log.error("GeminiService error: {}", e.getMessage(), e);
            return FALLBACK_REPLY;
        }
    }
}
