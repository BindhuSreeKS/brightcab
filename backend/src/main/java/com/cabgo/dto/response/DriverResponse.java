package com.cabgo.dto.response;

import com.cabgo.enums.DriverStatus;
import com.cabgo.enums.VehicleCategory;
import com.cabgo.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String aadhaarNumber;
    private String licenseNumber;
    private String vehicleNumber;
    private String vehicleModel;
    private VehicleCategory vehicleCategory;
    private String vehicleColor;
    private VerificationStatus verificationStatus;
    private DriverStatus status;
    private Double rating;
    private Integer totalRides;
    private Double totalEarnings;
    private String cityId;
    private String profileImage;
    private String licenseImage;
    private String rcImage;
    private String aadhaarImage;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
