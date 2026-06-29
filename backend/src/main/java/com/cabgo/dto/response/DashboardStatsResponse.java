package com.cabgo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // Rides
    private long totalRides;
    private long activeRides;
    private long completedRides;
    private long cancelledRides;

    // Users
    private long totalCustomers;
    private long totalDrivers;
    private long activeDrivers;
    private long onlineDrivers;
    private long pendingDriverVerifications;

    // Revenue
    private double totalRevenue;
    private double platformCommission;

    // Complaints
    private long openComplaints;
    private long sosAlerts;

    // Today's stats
    private long todayRides;
    private double todayRevenue;
    private long todayNewCustomers;
    private long todayNewDrivers;
}
