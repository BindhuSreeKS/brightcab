package com.cabgo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "whatsapp_sessions")
public class WhatsAppSessions {
    @Id
    private String id;

    @Indexed
    private String whatsappPhone;

    private String direction; // INCOMING, OUTGOING
    private String messageType; // text, image, location, interactive
    private String content;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
