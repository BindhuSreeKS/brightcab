package com.cabgo.dto.response;

import com.cabgo.enums.CustomerStatus;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String profilePhoto;
    private String profileImage;
    private CustomerStatus status;
    private Double cancellationRate;
    private Double walletBalance;
    private Integer totalRides;
    private Double rating;
    private LocalDateTime createdAt;
}
