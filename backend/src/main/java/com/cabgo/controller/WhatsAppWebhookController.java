package com.cabgo.controller;

import com.cabgo.service.WhatsAppWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Enumeration;

/**
 * Webhook endpoint for AiSensy (bgsinfotech reseller).
 *
 * GET  /api/webhook/whatsapp  — webhook verification ping from AiSensy dashboard
 * POST /api/webhook/whatsapp  — incoming message events
 *
 * IMPORTANT — after first deploy, watch Railway logs for the raw POST body printed
 * at INFO level. This tells you the exact field names AiSensy sends so you can
 * update WhatsAppWebhookService parsing if needed.
 */
@Slf4j
@RestController
@RequestMapping("/webhook/whatsapp")
@RequiredArgsConstructor
public class WhatsAppWebhookController {

    private final WhatsAppWebhookService webhookService;

    /**
     * AiSensy pings this with a GET before activating the webhook.
     * Log all query params so we can see what AiSensy sends during verification.
     */
    @GetMapping
    public ResponseEntity<String> verifyWebhook(HttpServletRequest request) {
        StringBuilder params = new StringBuilder("AiSensy webhook verification GET — query params: ");
        Enumeration<String> names = request.getParameterNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            params.append(name).append("=").append(request.getParameter(name)).append(" | ");
        }
        log.info(params.toString());
        return ResponseEntity.ok("OK");
    }

    /**
     * Receives incoming WhatsApp message events from AiSensy.
     *
     * Phase 1 (active): Logs the raw body at INFO so Railway logs reveal the
     *   exact JSON field names AiSensy uses, then delegates to webhookService.
     *
     * Always returns 200 immediately so AiSensy does not retry delivery.
     */
    @PostMapping
    public ResponseEntity<Void> receiveMessage(
            @RequestBody String requestBody,
            HttpServletRequest request) {

        // ── Phase 1: Log raw payload (keep this; remove once field names confirmed) ──
        log.info("=== AiSensy RAW POST ===");
        log.info("Content-Type : {}", request.getContentType());
        log.info("Payload      : {}", requestBody);
        log.info("=======================");

        // ── Phase 2: Real processing via state machine + Gemini fallback ──
        webhookService.processWebhookPayload(requestBody);

        return ResponseEntity.ok().build();
    }
}
