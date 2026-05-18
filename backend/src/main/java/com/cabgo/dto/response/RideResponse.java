package com.cabgo.dto.response;

import com.cabgo.enums.PaymentMethod;
import com.cabgo.enums.RideStatus;
import com.cabgo.enums.VehicleCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideResponse {

    private String id;
    private String customerId;
    private String customerName;
    private String driverId;
    private String driverName;
    private String pickupLocation;
    private String dropLocation;
    private RideStatus status;
    private VehicleCategory vehicleCategory;
    private Double fare;
    private Double distance;
    private Integer duration;
    private PaymentMethod paymentMethod;
    private String cityId;
    private String cancellationReason;
    private String cancelledBy;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
