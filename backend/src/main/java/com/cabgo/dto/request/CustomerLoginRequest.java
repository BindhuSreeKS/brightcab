package com.cabgo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerLoginRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;
}
