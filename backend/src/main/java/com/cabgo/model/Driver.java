package com.cabgo.model;

import com.cabgo.enums.DriverStatus;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "drivers")
public class Driver {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String phone;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String aadhaarNumber;

    private String licenseNumber;

    private String vehicleNumber;

    private String vehicleModel;

    private VehicleCategory vehicleCategory;

    private String vehicleColor;

    private String vehicleYear;

    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Builder.Default
    private DriverStatus status = DriverStatus.OFFLINE;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer totalRides = 0;

    @Builder.Default
    private Double totalEarnings = 0.0;

    private String cityId;

    private String profileImage;

    private String aadhaarImage;

    private String licenseImage;

    private String vehicleImage;

    private String rcImage;

    private String rejectionReason;

    private Double latitude;

    private Double longitude;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
