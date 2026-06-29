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
    private final com.cabgo.repository.CityRepository cityRepository;
    private final com.cabgo.repository.PopularDestinationRepository popularDestinationRepository;
    private final com.cabgo.repository.FestivalConfigRepository festivalConfigRepository;

    @Override
    public void run(String... args) {
        seedSuperAdmin();
        seedPricing();
        seedDriver();
        seedCitiesAndPricing();
        seedPopularDestinations();
        seedFestivals();
    }

    private void seedCitiesAndPricing() {
        // Bengaluru
        if (!cityRepository.existsByName("Bengaluru")) {
            com.cabgo.model.City blr = com.cabgo.model.City.builder()
                .name("Bengaluru").state("Karnataka").country("India")
                .active(true).latitude(12.9716).longitude(77.5946)
                .radius(50.0).timezone("Asia/Kolkata").build();
            blr = cityRepository.save(blr);
            
            seedCityPricing(blr.getId(), VehicleCategory.MINI, 50.0, 14.0, 1.5);
            seedCityPricing(blr.getId(), VehicleCategory.SEDAN, 70.0, 18.0, 2.0);
            seedCityPricing(blr.getId(), VehicleCategory.SUV, 90.0, 22.0, 2.5);
            seedCityPricing(blr.getId(), VehicleCategory.AUTO, 35.0, 11.0, 1.0);
        }

        // Mysuru
        if (!cityRepository.existsByName("Mysuru")) {
            com.cabgo.model.City mys = com.cabgo.model.City.builder()
                .name("Mysuru").state("Karnataka").country("India")
                .active(true).latitude(12.2958).longitude(76.6394)
                .radius(30.0).timezone("Asia/Kolkata").build();
            mys = cityRepository.save(mys);

            seedCityPricing(mys.getId(), VehicleCategory.MINI, 40.0, 12.0, 1.2);
            seedCityPricing(mys.getId(), VehicleCategory.SEDAN, 60.0, 15.0, 1.5);
            seedCityPricing(mys.getId(), VehicleCategory.SUV, 80.0, 19.0, 2.0);
            seedCityPricing(mys.getId(), VehicleCategory.AUTO, 30.0, 10.0, 0.9);
        }

        // Tumakuru
        if (!cityRepository.existsByName("Tumakuru")) {
            com.cabgo.model.City tum = com.cabgo.model.City.builder()
                .name("Tumakuru").state("Karnataka").country("India")
                .active(true).latitude(13.3392).longitude(77.1140)
                .radius(20.0).timezone("Asia/Kolkata").build();
            tum = cityRepository.save(tum);

            seedCityPricing(tum.getId(), VehicleCategory.MINI, 35.0, 11.0, 1.0);
            seedCityPricing(tum.getId(), VehicleCategory.SEDAN, 55.0, 14.0, 1.3);
            seedCityPricing(tum.getId(), VehicleCategory.SUV, 75.0, 18.0, 1.8);
            seedCityPricing(tum.getId(), VehicleCategory.AUTO, 28.0, 9.0, 0.8);
        }

        // Mangaluru
        if (!cityRepository.existsByName("Mangaluru")) {
            com.cabgo.model.City mng = com.cabgo.model.City.builder()
                .name("Mangaluru").state("Karnataka").country("India")
                .active(true).latitude(12.9141).longitude(74.8560)
                .radius(25.0).timezone("Asia/Kolkata").build();
            mng = cityRepository.save(mng);

            seedCityPricing(mng.getId(), VehicleCategory.MINI, 45.0, 13.0, 1.3);
            seedCityPricing(mng.getId(), VehicleCategory.SEDAN, 65.0, 16.0, 1.7);
            seedCityPricing(mng.getId(), VehicleCategory.SUV, 85.0, 20.0, 2.2);
            seedCityPricing(mng.getId(), VehicleCategory.AUTO, 32.0, 10.5, 0.95);
        }
    }

    private void seedCityPricing(String cityId, VehicleCategory category, double base, double perKm, double perMinute) {
        if (pricingRepository.findByCategoryAndCityId(category, cityId).isEmpty()) {
            Pricing pr = Pricing.builder()
                .cityId(cityId)
                .category(category)
                .baseFare(base)
                .perKmRate(perKm)
                .perMinuteRate(perMinute)
                .minimumFare(base + 10.0)
                .commissionPercentage(20.0)
                .surgePriceMultiplier(1.5)
                .nightSurgeMultiplier(1.25)
                .nightStartHour(22)
                .nightEndHour(6)
                .updatedBy("system")
                .updatedAt(java.time.LocalDateTime.now())
                .build();
            pricingRepository.save(pr);
        }
    }

    private void seedPopularDestinations() {
        if (popularDestinationRepository.count() == 0) {
            List<com.cabgo.model.PopularDestination> list = Arrays.asList(
                // Bengaluru
                com.cabgo.model.PopularDestination.builder().city("Bengaluru").name("Kempegowda International Airport").latitude(13.1986).longitude(77.7066).radius(3.0).demandMultiplier(1.15).build(),
                com.cabgo.model.PopularDestination.builder().city("Bengaluru").name("Electronic City Phase 1").latitude(12.8564).longitude(77.6749).radius(2.0).demandMultiplier(1.10).build(),
                com.cabgo.model.PopularDestination.builder().city("Bengaluru").name("Whitefield ITPL").latitude(12.9830).longitude(77.7479).radius(2.0).demandMultiplier(1.10).build(),
                com.cabgo.model.PopularDestination.builder().city("Bengaluru").name("Majestic Railway Station").latitude(12.9779).longitude(77.5730).radius(1.5).demandMultiplier(1.08).build(),
                com.cabgo.model.PopularDestination.builder().city("Bengaluru").name("MG Road Metro Station").latitude(12.9744).longitude(77.6074).radius(1.0).demandMultiplier(1.12).build(),
                com.cabgo.model.PopularDestination.builder().city("Bengaluru").name("Koramangala Sony World Junction").latitude(12.9345).longitude(77.6269).radius(1.5).demandMultiplier(1.10).build(),
                
                // Mysuru
                com.cabgo.model.PopularDestination.builder().city("Mysuru").name("Mysuru Palace").latitude(12.3051).longitude(76.6551).radius(1.0).demandMultiplier(1.12).build(),
                com.cabgo.model.PopularDestination.builder().city("Mysuru").name("Mysuru Railway Station").latitude(12.3163).longitude(76.6433).radius(1.0).demandMultiplier(1.08).build(),
                com.cabgo.model.PopularDestination.builder().city("Mysuru").name("Mysuru Zoo").latitude(12.3023).longitude(76.6644).radius(1.0).demandMultiplier(1.10).build(),

                // Tumakuru
                com.cabgo.model.PopularDestination.builder().city("Tumakuru").name("SIT Campus").latitude(13.3275).longitude(77.1252).radius(1.0).demandMultiplier(1.08).build(),
                com.cabgo.model.PopularDestination.builder().city("Tumakuru").name("Tumakuru Railway Station").latitude(13.3421).longitude(77.1009).radius(1.0).demandMultiplier(1.05).build(),
                com.cabgo.model.PopularDestination.builder().city("Tumakuru").name("KSRTC Bus Stand").latitude(13.3378).longitude(77.1062).radius(1.0).demandMultiplier(1.06).build(),

                // Mangaluru
                com.cabgo.model.PopularDestination.builder().city("Mangaluru").name("Mangaluru Airport").latitude(12.9612).longitude(74.8900).radius(2.5).demandMultiplier(1.15).build(),
                com.cabgo.model.PopularDestination.builder().city("Mangaluru").name("Panambur Beach").latitude(12.9372).longitude(74.7963).radius(1.5).demandMultiplier(1.10).build(),
                com.cabgo.model.PopularDestination.builder().city("Mangaluru").name("Hampankatta").latitude(12.8710).longitude(74.8430).radius(1.0).demandMultiplier(1.07).build()
            );
            popularDestinationRepository.saveAll(list);
            log.info("✅ Popular destinations seeded.");
        }
    }

    private void seedFestivals() {
        if (festivalConfigRepository.count() == 0) {
            java.time.LocalDate today = java.time.LocalDate.now();
            List<com.cabgo.model.FestivalConfig> list = Arrays.asList(
                com.cabgo.model.FestivalConfig.builder().name("Ganesh Chaturthi").startDate(today.minusDays(5)).endDate(today.plusDays(5)).multiplier(1.15).build(),
                com.cabgo.model.FestivalConfig.builder().name("Karnataka Rajyotsava").startDate(java.time.LocalDate.of(today.getYear(), 11, 1)).endDate(java.time.LocalDate.of(today.getYear(), 11, 1)).multiplier(1.15).build()
            );
            festivalConfigRepository.saveAll(list);
            log.info("✅ Festival configurations seeded.");
        }
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
