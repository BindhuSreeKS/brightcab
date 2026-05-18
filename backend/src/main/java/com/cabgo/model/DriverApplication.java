package com.cabgo.model;

import com.cabgo.enums.BackgroundCheckStatus;
import com.cabgo.enums.VehicleCategory;
import com.cabgo.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "driver_applications")
public class DriverApplication {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String phone;

    @Indexed(unique = true)
    private String email;

    private String city;
    private String zone;

    // Vehicle Info
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleNumber;
    private String vehicleColor;
    private Integer manufacturingYear;
    private VehicleCategory vehicleCategory;

    // Documents
    private String aadhaarNumber;
    private String licenseNumber;
    private String panNumber;
    private String rcNumber;
    private String insuranceNumber;
    private String pollutionNumber;

    // Document Images
    private String aadhaarFrontImage;
    private String aadhaarBackImage;
    private String licenseImage;
    private String panCardImage;
    private String rcBookImage;
    private String insuranceImage;
    private String pollutionImage;
    private String vehicleFrontImage;
    private String vehicleBackImage;
    private String vehicleSideImage;
    private String driverSelfieImage;

    // Status & Progress
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    @Builder.Default
    private Integer verificationProgress = 0;

    @Builder.Default
    private BackgroundCheckStatus backgroundCheckStatus = BackgroundCheckStatus.PENDING;

    private Integer riskScore;
    private List<String> fraudAlerts;
    
    private String rejectionReason;
    
    // Financial Setup (Post-Approval)
    private Double commissionPercentage;
    private String bonusTier;
    private Boolean autoPayEnabled;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
