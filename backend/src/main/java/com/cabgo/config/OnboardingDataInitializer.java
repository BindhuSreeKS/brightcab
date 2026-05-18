package com.cabgo.config;

import com.cabgo.enums.BackgroundCheckStatus;
import com.cabgo.enums.VehicleCategory;
import com.cabgo.enums.VerificationStatus;
import com.cabgo.model.DriverApplication;
import com.cabgo.repository.DriverApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class OnboardingDataInitializer implements CommandLineRunner {

    private final DriverApplicationRepository applicationRepository;

    @Override
    public void run(String... args) {
        if (applicationRepository.count() == 0) {
            DriverApplication app1 = DriverApplication.builder()
                    .name("Amit Sharma")
                    .phone("+91 98765 43210")
                    .email("amit.sharma@example.com")
                    .city("Bengaluru")
                    .zone("Koramangala")
                    .vehicleBrand("Maruti Suzuki")
                    .vehicleModel("Dzire")
                    .vehicleNumber("KA-01-MG-1234")
                    .vehicleColor("White")
                    .manufacturingYear(2021)
                    .vehicleCategory(VehicleCategory.SEDAN)
                    .verificationStatus(VerificationStatus.PENDING)
                    .verificationProgress(65)
                    .backgroundCheckStatus(BackgroundCheckStatus.PENDING)
                    .riskScore(15)
                    .aadhaarNumber("1234 5678 9012")
                    .licenseNumber("DL1234567890")
                    .driverSelfieImage("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400")
                    .vehicleFrontImage("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400")
                    .build();

            DriverApplication app2 = DriverApplication.builder()
                    .name("Priya Singh")
                    .phone("+91 87654 32109")
                    .email("priya.singh@example.com")
                    .city("Bengaluru")
                    .zone("Indiranagar")
                    .vehicleBrand("Maruti Suzuki")
                    .vehicleModel("WagonR")
                    .vehicleNumber("KA-03-MT-5678")
                    .vehicleColor("Silver")
                    .manufacturingYear(2022)
                    .vehicleCategory(VehicleCategory.MINI)
                    .verificationStatus(VerificationStatus.UNDER_REVIEW)
                    .verificationProgress(85)
                    .backgroundCheckStatus(BackgroundCheckStatus.CLEARED)
                    .riskScore(5)
                    .aadhaarNumber("9876 5432 1098")
                    .licenseNumber("DL9876543210")
                    .driverSelfieImage("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400")
                    .vehicleFrontImage("https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400")
                    .build();

            DriverApplication app3 = DriverApplication.builder()
                    .name("Rahul Verma")
                    .phone("+91 76543 21098")
                    .email("rahul.verma@example.com")
                    .city("Bengaluru")
                    .zone("HSR Layout")
                    .vehicleBrand("Maruti Suzuki")
                    .vehicleModel("Ertiga")
                    .vehicleNumber("KA-05-MN-9012")
                    .vehicleColor("Grey")
                    .manufacturingYear(2023)
                    .vehicleCategory(VehicleCategory.SUV)
                    .verificationStatus(VerificationStatus.PENDING)
                    .verificationProgress(40)
                    .backgroundCheckStatus(BackgroundCheckStatus.FLAGGED)
                    .riskScore(75)
                    .fraudAlerts(Arrays.asList("Multiple accounts detected", "Address mismatch"))
                    .aadhaarNumber("4567 8901 2345")
                    .licenseNumber("DL4567890123")
                    .driverSelfieImage("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400")
                    .vehicleFrontImage("https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400")
                    .build();

            applicationRepository.saveAll(List.of(app1, app2, app3));
        }
    }
}
