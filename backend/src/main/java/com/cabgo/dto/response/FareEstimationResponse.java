package com.cabgo.dto.response;

import com.cabgo.enums.VehicleCategory;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FareEstimationResponse {
    private Double distance;
    private Integer duration;
    private List<VehicleFare> fares;

    @Data
    @Builder
    public static class VehicleFare {
        private VehicleCategory category;
        private Double fare;
        private String eta;
    }
}
