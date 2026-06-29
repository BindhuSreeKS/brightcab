package com.cabgo.service;

import com.cabgo.dto.FareRequest;
import com.cabgo.dto.FareResponse;
import com.cabgo.enums.VehicleCategory;
import com.cabgo.model.City;
import com.cabgo.model.Pricing;
import com.cabgo.repository.CityRepository;
import com.cabgo.repository.PricingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FareServiceTest {

    @Mock
    private GoogleMapsService googleMapsService;
    @Mock
    private TrafficService trafficService;
    @Mock
    private DestinationService destinationService;
    @Mock
    private PeakHourService peakHourService;
    @Mock
    private FestivalService festivalService;
    @Mock
    private PricingRepository pricingRepository;
    @Mock
    private CityRepository cityRepository;
    @Mock
    private FareCalculator fareCalculator;

    @InjectMocks
    private FareService fareService;

    private Pricing mockPricing;
    private City mockCity;

    @BeforeEach
    public void setup() {
        mockPricing = Pricing.builder()
                .id("price-123")
                .category(VehicleCategory.SEDAN)
                .baseFare(70.0)
                .perKmRate(18.0)
                .perMinuteRate(2.0)
                .build();

        mockCity = City.builder()
                .id("city-123")
                .name("Bengaluru")
                .build();
    }

    @Test
    public void testEstimateFareWithCityPricing() {
        FareRequest request = FareRequest.builder()
                .pickupLat(12.97)
                .pickupLng(77.59)
                .dropLat(13.03)
                .dropLng(77.63)
                .city("Bengaluru")
                .vehicleType("Sedan")
                .build();

        GoogleMapsService.RouteEstimation route = new GoogleMapsService.RouteEstimation(
                15.2, 30, 36, "15.2 km", "30 mins", "36 mins"
        );

        when(googleMapsService.getRouteEstimation(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(route);
        when(trafficService.calculateMultiplier(anyDouble())).thenReturn(1.10);
        when(trafficService.getTrafficLevel(anyDouble())).thenReturn("HIGH");
        when(destinationService.findMatchingDestination(anyString(), anyDouble(), anyDouble()))
                .thenReturn(new DestinationService.MatchResult("Kempegowda Airport", 1.15));
        when(peakHourService.getPeakMultiplier(any(LocalDateTime.class))).thenReturn(1.10);
        when(peakHourService.getWeekendMultiplier(any(LocalDateTime.class))).thenReturn(1.00);
        when(peakHourService.isPeakHour(any(LocalDateTime.class))).thenReturn(true);
        when(festivalService.getActiveFestival(any(LocalDate.class)))
                .thenReturn(new FestivalService.FestivalResult("Ganesh Chaturthi", 1.15));

        when(cityRepository.findByNameIgnoreCase("Bengaluru")).thenReturn(Optional.of(mockCity));
        when(pricingRepository.findByCategoryAndCityId(VehicleCategory.SEDAN, "city-123"))
                .thenReturn(Optional.of(mockPricing));

        FareCalculator.CalculationBreakdown breakdown = new FareCalculator.CalculationBreakdown(
                70.0, 273.6, 60.0, 1.10, 1.15, 1.10, 1.00, 1.15
        );
        when(fareCalculator.calculateFare(any(Pricing.class), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(new FareCalculator.CalculateResult(512L, breakdown));

        FareResponse response = fareService.estimateFare(request);

        assertNotNull(response);
        assertEquals(15.2, response.getDistanceKm());
        assertEquals(36, response.getDurationMinutes());
        assertEquals("HIGH", response.getTraffic());
        assertEquals(1.10, response.getTrafficMultiplier());
        assertEquals("Kempegowda Airport", response.getDestination());
        assertEquals(1.15, response.getDestinationMultiplier());
        assertTrue(response.isPeakHour());
        assertEquals(512L, response.getEstimatedFare());
        assertEquals("INR", response.getCurrency());

        assertNotNull(response.getBreakdown());
        assertEquals(70.0, response.getBreakdown().getBase());
        assertEquals(273.6, response.getBreakdown().getDistance());
        assertEquals(60.0, response.getBreakdown().getTime());
        assertEquals(1.10, response.getBreakdown().getTraffic());
        assertEquals(1.15, response.getBreakdown().getDemand());
    }
}
