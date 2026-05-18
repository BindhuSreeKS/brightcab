package com.cabgo.service;

import com.cabgo.dto.response.DashboardStatsResponse;
import com.cabgo.enums.*;
import com.cabgo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;

    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.now().with(LocalTime.MAX);

        var todayRides = rideRepository.findByDateRange(todayStart, todayEnd);
        var todayPayments = paymentRepository.findByDateRange(todayStart, todayEnd);

        double todayRevenue = todayPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(p -> p.getAmount()).sum();

        var allPayments = paymentRepository.findAll();
        double totalRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(p -> p.getAmount()).sum();
        double totalCommission = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(p -> p.getPlatformCommission() != null ? p.getPlatformCommission() : 0).sum();

        return DashboardStatsResponse.builder()
                .totalRides(rideRepository.count())
                .activeRides(rideRepository.countByStatus(RideStatus.ONGOING) + rideRepository.countByStatus(RideStatus.ACCEPTED))
                .completedRides(rideRepository.countByStatus(RideStatus.COMPLETED))
                .cancelledRides(rideRepository.countByStatus(RideStatus.CANCELLED))
                .totalCustomers(customerRepository.count())
                .totalDrivers(driverRepository.count())
                .activeDrivers(driverRepository.countByStatus(DriverStatus.ONLINE) + driverRepository.countByStatus(DriverStatus.BUSY))
                .onlineDrivers(driverRepository.countByStatus(DriverStatus.ONLINE))
                .pendingDriverVerifications(driverRepository.countByVerificationStatus(VerificationStatus.PENDING))
                .totalRevenue(totalRevenue)
                .platformCommission(totalCommission)
                .openComplaints(complaintRepository.countByStatus(ComplaintStatus.OPEN))
                .sosAlerts(complaintRepository.countByIsSOS(true))
                .todayRides(todayRides.size())
                .todayRevenue(todayRevenue)
                .build();
    }

    public Map<String, Object> getRevenueAnalytics(String period) {
        LocalDateTime from = switch (period) {
            case "week" -> LocalDateTime.now().minusWeeks(1);
            case "month" -> LocalDateTime.now().minusMonths(1);
            case "year" -> LocalDateTime.now().minusYears(1);
            default -> LocalDateTime.now().minusDays(1);
        };
        var payments = paymentRepository.findByDateRange(from, LocalDateTime.now());
        double revenue = payments.stream().filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(p -> p.getAmount()).sum();
        double commission = payments.stream().filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(p -> p.getPlatformCommission() != null ? p.getPlatformCommission() : 0).sum();
        return Map.of("period", period, "totalRevenue", revenue, "commission", commission, "transactions", payments.size());
    }

    public Map<String, Object> getRideAnalytics(String period) {
        LocalDateTime from = switch (period) {
            case "week" -> LocalDateTime.now().minusWeeks(1);
            case "month" -> LocalDateTime.now().minusMonths(1);
            default -> LocalDateTime.now().minusDays(1);
        };
        var rides = rideRepository.findByDateRange(from, LocalDateTime.now());
        long completed = rides.stream().filter(r -> r.getStatus() == RideStatus.COMPLETED).count();
        long cancelled = rides.stream().filter(r -> r.getStatus() == RideStatus.CANCELLED).count();
        return Map.of("period", period, "totalRides", rides.size(), "completed", completed, "cancelled", cancelled);
    }

    public List<Map<String, Object>> getRevenueChartData() {
        // Generate last 7 days chart data
        java.util.List<Map<String, Object>> chart = new java.util.ArrayList<>();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("EEE");
        
        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = LocalDateTime.now().minusDays(i).with(LocalTime.MIN);
            LocalDateTime dayEnd = LocalDateTime.now().minusDays(i).with(LocalTime.MAX);
            
            var payments = paymentRepository.findByDateRange(dayStart, dayEnd);
            double dailyRev = payments.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                    .mapToDouble(p -> p.getAmount()).sum();
            
            chart.add(Map.of("name", dayStart.format(formatter), "revenue", dailyRev));
        }
        return chart;
    }

    public List<Map<String, Object>> getCityPerformance() {
        // In a real scenario, group rides by cityId. Here we simulate for available cities.
        // We will fetch actual active rides count from the DB grouped by city.
        var rides = rideRepository.findAll();
        
        // Count rides by city, handling null cityId
        java.util.Map<String, Long> cityCounts = rides.stream()
            .collect(java.util.stream.Collectors.groupingBy(r -> r.getCityId() != null ? r.getCityId() : "Global", java.util.stream.Collectors.counting()));
        
        java.util.List<Map<String, Object>> result = new java.util.ArrayList<>();
        cityCounts.forEach((city, count) -> {
            result.add(Map.of(
                "city", city.equals("Global") ? "Unassigned Zones" : "Zone: " + city, 
                "rides", count, 
                "growth", "+5%" // Mock growth
            ));
        });
        
        // Sort by highest rides
        result.sort((a, b) -> Long.compare((Long)b.get("rides"), (Long)a.get("rides")));
        return result.stream().limit(5).collect(java.util.stream.Collectors.toList());
    }
}
