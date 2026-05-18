package com.cabgo.model;

import com.cabgo.enums.ComplaintStatus;
import com.cabgo.enums.ComplaintType;
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
@Document(collection = "complaints")
public class Complaint {

    @Id
    private String id;

    private String rideId;

    private String raisedBy; // customerId or driverId

    private String raisedByType; // CUSTOMER | DRIVER

    private String againstId;

    private String againstType; // CUSTOMER | DRIVER

    private ComplaintType type;

    private String title;

    private String description;

    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.OPEN;

    private String resolvedBy; // adminId

    private String resolution;

    private boolean isSOS;

    private Double latitude;

    private Double longitude;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
