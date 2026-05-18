package com.cabgo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerificationRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    @NotBlank(message = "OTP is required")
    private String otp;
}
