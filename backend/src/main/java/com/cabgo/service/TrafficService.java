package com.cabgo.service;

import org.springframework.stereotype.Service;

@Service
public class TrafficService {

    public double calculateMultiplier(double trafficRatio) {
        if (trafficRatio <= 1.1) {
            return 1.00;
        } else if (trafficRatio <= 1.3) {
            return 1.05;
        } else if (trafficRatio <= 1.6) {
            return 1.10;
        } else {
            return 1.20;
        }
    }

    public String getTrafficLevel(double trafficRatio) {
        if (trafficRatio <= 1.1) {
            return "LOW";
        } else if (trafficRatio <= 1.3) {
            return "MEDIUM";
        } else if (trafficRatio <= 1.6) {
            return "HIGH";
        } else {
            return "SEVERE";
        }
    }
}
