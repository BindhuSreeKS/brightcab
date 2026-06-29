package com.cabgo.service;

import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class PeakHourService {

    public boolean isPeakHour(LocalDateTime dateTime) {
        LocalTime time = dateTime.toLocalTime();
        boolean morningPeak = !time.isBefore(LocalTime.of(7, 0)) && time.isBefore(LocalTime.of(10, 0));
        boolean eveningPeak = !time.isBefore(LocalTime.of(17, 0)) && time.isBefore(LocalTime.of(21, 0));
        return morningPeak || eveningPeak;
    }

    public double getPeakMultiplier(LocalDateTime dateTime) {
        return isPeakHour(dateTime) ? 1.10 : 1.00;
    }

    public double getWeekendMultiplier(LocalDateTime dateTime) {
        DayOfWeek day = dateTime.getDayOfWeek();
        return (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) ? 1.05 : 1.00;
    }
}
