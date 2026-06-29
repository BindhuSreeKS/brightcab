package com.cabgo.controller;

import com.cabgo.enums.ConversationState;
import com.cabgo.model.ChatSession;
import com.cabgo.repository.ChatSessionRepository;
import com.cabgo.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin/whatsapp")
@RequiredArgsConstructor
public class WhatsAppAdminController {

    private final ChatSessionRepository chatSessionRepository;
    private final WhatsAppService whatsAppService;

    /**
     * Get all active chatbot sessions.
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getSessions() {
        List<ChatSession> sessions = chatSessionRepository.findAll();
        // Sort by lastMessageAt descending
        sessions.sort((s1, s2) -> {
            if (s1.getLastMessageAt() == null) return 1;
            if (s2.getLastMessageAt() == null) return -1;
            return s2.getLastMessageAt().compareTo(s1.getLastMessageAt());
        });
        return ResponseEntity.ok(sessions);
    }

    /**
     * Get stats for WhatsApp chatbot dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalSessions = chatSessionRepository.count();
        long idleSessions = chatSessionRepository.countByState(ConversationState.IDLE);
        long activeBookings = chatSessionRepository.countByState(ConversationState.RIDE_ACTIVE);
        long supportTickets = chatSessionRepository.countByState(ConversationState.SUPPORT);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSessions", totalSessions);
        stats.put("idleSessions", idleSessions);
        stats.put("activeBookings", activeBookings);
        stats.put("supportTickets", supportTickets);
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Send a WhatsApp message manually to override or support a user.
     */
    @PostMapping("/send")
    public ResponseEntity<Void> sendMessage(
            @RequestParam String toPhone,
            @RequestParam String message) {
        log.info("Admin sending manual message to {}: {}", toPhone, message);
        whatsAppService.sendText(toPhone, message);
        return ResponseEntity.ok().build();
    }

    /**
     * Reset a session state manually.
     */
    @PostMapping("/sessions/{phone}/reset")
    public ResponseEntity<Void> resetSession(@PathVariable String phone) {
        log.info("Admin manually resetting WhatsApp session: {}", phone);
        chatSessionRepository.findByWhatsappPhone(phone).ifPresent(s -> {
            s.setState(ConversationState.IDLE);
            s.setActiveRideId(null);
            chatSessionRepository.save(s);
        });
        return ResponseEntity.ok().build();
    }
}
