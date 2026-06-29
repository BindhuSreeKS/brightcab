package com.cabgo.service;

import com.cabgo.model.FestivalConfig;
import com.cabgo.repository.FestivalConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FestivalService {

    private final FestivalConfigRepository festivalConfigRepository;

    public static class FestivalResult {
        public final String name;
        public final double multiplier;

        public FestivalResult(String name, double multiplier) {
            this.name = name;
            this.multiplier = multiplier;
        }
    }

    public FestivalResult getActiveFestival(LocalDate date) {
        List<FestivalConfig> festivals = festivalConfigRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(date, date);
        if (!festivals.isEmpty()) {
            // Find the maximum multiplier
            FestivalConfig maxFestival = festivals.get(0);
            for (FestivalConfig f : festivals) {
                if (f.getMultiplier() > maxFestival.getMultiplier()) {
                    maxFestival = f;
                }
            }
            return new FestivalResult(maxFestival.getName(), maxFestival.getMultiplier());
        }
        return new FestivalResult("None", 1.0);
    }
}
