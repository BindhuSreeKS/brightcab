package com.cabgo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "festival_configs")
public class FestivalConfig {
    @Id
    private String id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private double multiplier;
}
