package com.cabgo.config;

import com.cabgo.enums.AdminRole;
import com.cabgo.enums.VehicleCategory;
import com.cabgo.model.Admin;
import com.cabgo.model.Pricing;
import com.cabgo.repository.AdminRepository;
import com.cabgo.repository.DriverRepository;
import com.cabgo.repository.PricingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PricingRepository pricingRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSuperAdmin();
        seedPricing();
        seedDriver();
    }

    private void seedDriver() {
        if (driverRepository.findByPhone("9876543210").isEmpty()) {
            com.cabgo.model.Driver driver = com.cabgo.model.Driver.builder()
                    .name("Test Driver")
                    .phone("9876543210")
                    .email("driver@vazraamobility.com")
                    .password(passwordEncoder.encode("Driver@123"))
                    .vehicleNumber("MH01AB1234")
                    .vehicleModel("Swift Dzire")
                    .vehicleCategory(VehicleCategory.SEDAN)
                    .verificationStatus(com.cabgo.enums.VerificationStatus.APPROVED)
                    .status(com.cabgo.enums.DriverStatus.OFFLINE)
                    .rating(4.5)
                    .totalRides(120)
                    .totalEarnings(45000.0)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
            driverRepository.save(driver);
            log.info("✅ Test Driver seeded: 9876543210 / OTP: 123456");
        }
    }

    private void seedSuperAdmin() {
        if (adminRepository.findByEmail("superadmin@vazraamobility.com").isEmpty()) {
            Admin superAdmin = Admin.builder()
                    .name("Super Admin")
                    .email("superadmin@vazraamobility.com")
                    .phone("+91-9999999999")
                    .password(passwordEncoder.encode("SuperAdmin@123"))
                    .role(AdminRole.SUPER_ADMIN)
                    .build();
            adminRepository.save(superAdmin);
            log.info("✅ Super Admin seeded: superadmin@vazraamobility.com / SuperAdmin@123");
        }

        if (adminRepository.findByEmail("admin@vazraamobility.com").isEmpty()) {
            Admin admin = Admin.builder()
                    .name("Admin User")
                    .email("admin@vazraamobility.com")
                    .phone("+91-8888888888")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(AdminRole.ADMIN)
                    .build();
            adminRepository.save(admin);
            log.info("✅ Admin seeded: admin@vazraamobility.com / Admin@123");
        }
    }

    private void seedPricing() {
        if (pricingRepository.count() == 0) {
            List<Pricing> pricingList = Arrays.asList(
                Pricing.builder()
                    .category(VehicleCategory.MINI)
                    .baseFare(30.0).perKmRate(8.0).perMinuteRate(1.5)
                    .minimumFare(50.0).commissionPercentage(20.0)
                    .surgePriceMultiplier(1.5).nightSurgeMultiplier(1.25)
                    .nightStartHour(22).nightEndHour(6).build(),
                Pricing.builder()
                    .category(VehicleCategory.SEDAN)
                    .baseFare(50.0).perKmRate(12.0).perMinuteRate(2.0)
                    .minimumFare(80.0).commissionPercentage(20.0)
                    .surgePriceMultiplier(1.5).nightSurgeMultiplier(1.25)
                    .nightStartHour(22).nightEndHour(6).build(),
                Pricing.builder()
                    .category(VehicleCategory.SUV)
                    .baseFare(80.0).perKmRate(18.0).perMinuteRate(3.0)
                    .minimumFare(120.0).commissionPercentage(20.0)
                    .surgePriceMultiplier(1.5).nightSurgeMultiplier(1.25)
                    .nightStartHour(22).nightEndHour(6).build(),
                Pricing.builder()
                    .category(VehicleCategory.BIKE)
                    .baseFare(15.0).perKmRate(5.0).perMinuteRate(0.8)
                    .minimumFare(30.0).commissionPercentage(15.0)
                    .surgePriceMultiplier(1.3).nightSurgeMultiplier(1.1)
                    .nightStartHour(22).nightEndHour(6).build(),
                Pricing.builder()
                    .category(VehicleCategory.AUTO)
                    .baseFare(20.0).perKmRate(6.0).perMinuteRate(1.0)
                    .minimumFare(40.0).commissionPercentage(15.0)
                    .surgePriceMultiplier(1.3).nightSurgeMultiplier(1.1)
                    .nightStartHour(22).nightEndHour(6).build()
            );
            pricingRepository.saveAll(pricingList);
            log.info("✅ Default pricing seeded for all vehicle categories");
        }
    }
}
