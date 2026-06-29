package com.cabgo.dto.request;

import com.cabgo.enums.VehicleCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DriverRegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Aadhaar number is required")
    private String aadhaarNumber;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    @NotBlank(message = "Vehicle model is required")
    private String vehicleModel;

    @NotNull(message = "Vehicle category is required")
    private VehicleCategory vehicleCategory;
}
