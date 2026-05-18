package com.cabgo.model;

import com.cabgo.enums.PaymentMethod;
import com.cabgo.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String rideId;

    private String customerId;

    private String driverId;

    private Double amount;

    private Double platformCommission;

    private Double driverEarnings;

    private PaymentMethod paymentMethod;

    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    private String transactionId;

    private String refundId;

    private Double refundAmount;

    private String refundReason;

    private LocalDateTime refundedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
