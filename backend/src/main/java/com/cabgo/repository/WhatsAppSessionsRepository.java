package com.cabgo.repository;

import com.cabgo.model.WhatsAppSessions;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhatsAppSessionsRepository extends MongoRepository<WhatsAppSessions, String> {
    List<WhatsAppSessions> findByWhatsappPhoneOrderByTimestampAsc(String whatsappPhone);
}
