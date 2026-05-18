package com.cabgo.controller;

import com.cabgo.model.Customer;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.SavedPlacesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer/saved-places")
@RequiredArgsConstructor
public class SavedPlacesController {

    private final SavedPlacesService savedPlacesService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer.SavedPlace>>> getSavedPlaces(Authentication authentication) {
        String customerId = authentication.getName();
        List<Customer.SavedPlace> places = savedPlacesService.getSavedPlaces(customerId);
        return ResponseEntity.ok(ApiResponse.success("Saved places fetched", places));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> addSavedPlace(
            Authentication authentication,
            @RequestBody Customer.SavedPlace place) {
        String customerId = authentication.getName();
        savedPlacesService.addSavedPlace(customerId, place);
        return ResponseEntity.ok(ApiResponse.success("Place saved successfully", null));
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<ApiResponse<String>> removeSavedPlace(
            Authentication authentication,
            @PathVariable String name) {
        String customerId = authentication.getName();
        savedPlacesService.removeSavedPlace(customerId, name);
        return ResponseEntity.ok(ApiResponse.success("Saved place removed", null));
    }
}
