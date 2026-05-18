package com.cabgo.controller;

import com.cabgo.model.City;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/super-admin/cities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class CityController {

    private final CityService cityService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> addCity(@RequestBody City city) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("City added", cityService.addCity(city)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllCities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(cityService.getAllCities(page, size)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<?>> getActiveCities() {
        return ResponseEntity.ok(ApiResponse.success(cityService.getActiveCities()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getCityById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(cityService.getCityById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateCity(@PathVariable String id, @RequestBody City city) {
        return ResponseEntity.ok(ApiResponse.success("City updated", cityService.updateCity(id, city)));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<?>> toggleStatus(@PathVariable String id, @RequestParam boolean active) {
        cityService.toggleCityStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("City status updated", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteCity(@PathVariable String id) {
        cityService.deleteCity(id);
        return ResponseEntity.ok(ApiResponse.success("City deleted", null));
    }
}
