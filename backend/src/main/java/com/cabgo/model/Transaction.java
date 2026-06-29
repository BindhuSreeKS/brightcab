package com.cabgo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;
    
    private String customerId;
    private String type; // CREDIT, DEBIT
    private Double amount;
    private String description;
    private String referenceId; // Ride ID or external payment reference
    private String status; // PENDING, COMPLETED, FAILED, REFUNDED
    private String method; // WALLET, CARD, UPI
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
