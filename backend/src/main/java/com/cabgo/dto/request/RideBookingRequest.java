package com.cabgo.dto.request;

import com.cabgo.enums.PaymentMethod;
import com.cabgo.enums.VehicleCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RideBookingRequest {
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;
    
    @NotNull(message = "Pickup latitude is required")
    private Double pickupLatitude;
    
    @NotNull(message = "Pickup longitude is required")
    private Double pickupLongitude;
    
    @NotBlank(message = "Drop location is required")
    private String dropLocation;
    
    @NotNull(message = "Drop latitude is required")
    private Double dropLatitude;
    
    @NotNull(message = "Drop longitude is required")
    private Double dropLongitude;
    
    @NotNull(message = "Vehicle category is required")
    private VehicleCategory vehicleCategory;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
