package com.cabgo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Sends WhatsApp messages via the AiSensy / bgsinfotech campaign-message API.
 *
 * Endpoint : POST https://messages.bgsinfotech.com/messages/whatsapp
 * Auth     : apiKey field inside the JSON body (not a header)
 * Payload  : { apiKey, campaignName, destination, userName, templateParams, source,
 *              media, buttons, carouselCards, location }
 *
 * NOTE: sendButtons() intentionally degrades to plain text because AiSensy
 * interactive buttons require pre-approved WhatsApp templates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppService {

    @Value("${aisensy.message-api-url}")
    private String apiUrl;

    @Value("${aisensy.project-api-key}")
    private String apiKey;

    @Value("${aisensy.campaign-name}")
    private String campaignName;

    @Value("${aisensy.user-name:Vazra mobility}")
    private String userName;

    @Value("${aisensy.whatsapp-number}")
    private String whatsappNumber;

    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final com.cabgo.repository.WhatsAppSessionsRepository whatsappSessionsRepository;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final MediaType JSON_MEDIA = MediaType.get("application/json; charset=utf-8");

    // ── Public API ─────────────────────────────────────────────────────────────

    /**
     * Send a plain text message.
     */
    public void sendText(String toPhone, String message) {
        String dest = normalizeDestination(toPhone);
        Map<String, Object> payload = buildPayload(dest, message);
        post(payload);
        broadcastOutgoing(toPhone, message);
    }

    /**
     * Send a message with button choices.
     * AiSensy campaign API does not support ad-hoc interactive buttons, so this
     * falls back to a plain-text numbered list.
     */
    public void sendButtons(String toPhone, String bodyText, List<Map<String, String>> buttons) {
        StringBuilder sb = new StringBuilder(bodyText);
        sb.append("\n");
        int i = 1;
        for (Map<String, String> b : buttons) {
            sb.append("\n").append(i++).append("️⃣ ").append(b.get("title"));
        }
        sendText(toPhone, sb.toString());
    }

    /**
     * Ask the user to share their location — plain text prompt since AiSensy
     * location_request_message is a Meta-specific interactive type.
     */
    public void sendLocationRequest(String toPhone, String text) {
        sendText(toPhone, text + "\n\n📌 Please share your location using the WhatsApp attachment button.");
    }

    // ── Internal helpers ───────────────────────────────────────────────────────

    /**
     * Build the AiSensy campaign-message payload.
     * The message body goes into templateParams[0] so that the approved
     * template {{1}} placeholder is replaced at delivery time.
     */
    private Map<String, Object> buildPayload(String destination, String messageBody) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("apiKey",         apiKey);
        payload.put("campaignName",   campaignName);
        payload.put("destination",    destination);
        payload.put("userName",       userName);
        payload.put("templateParams", List.of(messageBody));
        payload.put("source",         "api");
        payload.put("media",          Map.of());
        payload.put("buttons",        List.of());
        payload.put("carouselCards",  List.of());
        payload.put("location",       Map.of());
        return payload;
    }

    /**
     * Normalise phone to 91XXXXXXXXXX (no +, no spaces).
     */
    private String normalizeDestination(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9]", "");
        if (clean.length() == 10) return "91" + clean;
        return clean;
    }

    private void broadcastOutgoing(String toPhone, String textBody) {
        try {
            Map<String, Object> wsMsg = Map.of(
                    "direction", "outgoing",
                    "to",        toPhone,
                    "type",      "text",
                    "textBody",  textBody,
                    "timestamp", System.currentTimeMillis());
            messagingTemplate.convertAndSend("/topic/admin/whatsapp", wsMsg);
        } catch (Exception e) {
            log.error("Failed to broadcast outgoing WhatsApp message", e);
        }

        // Archive to WhatsAppSessions collection
        try {
            com.cabgo.model.WhatsAppSessions logEntry = com.cabgo.model.WhatsAppSessions.builder()
                    .whatsappPhone(toPhone)
                    .direction("OUTGOING")
                    .messageType("text")
                    .content(textBody)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            whatsappSessionsRepository.save(logEntry);
        } catch (Exception logEx) {
            log.error("Failed to archive outgoing WhatsApp message", logEx);
        }
    }

    private void post(Map<String, Object> payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            log.debug("AiSensy outbound → {} : {}", payload.get("destination"), json);
            Request request = new Request.Builder()
                    .url(apiUrl)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(json, JSON_MEDIA))
                    .build();
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    log.error("AiSensy API error: {} — {}",
                            response.code(),
                            response.body() != null ? response.body().string() : "no body");
                } else {
                    log.info("AiSensy message sent → {}", payload.get("destination"));
                }
            }
        } catch (Exception e) {
            log.error("Failed to send WhatsApp message via AiSensy", e);
        }
    }
}
