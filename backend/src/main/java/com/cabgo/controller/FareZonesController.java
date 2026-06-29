package com.cabgo.controller;

import com.cabgo.model.FestivalConfig;
import com.cabgo.model.PopularDestination;
import com.cabgo.repository.FestivalConfigRepository;
import com.cabgo.repository.PopularDestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Super-admin REST endpoints for managing fare zones:
 *   - Popular Destination surge zones
 *   - Festival / surge date configs
 */
@RestController
@RequestMapping("/api/fare-zones")
@RequiredArgsConstructor
public class FareZonesController {

    private final PopularDestinationRepository destinationRepository;
    private final FestivalConfigRepository festivalConfigRepository;

    // ─── Popular Destinations ──────────────────────────────────────────────────

    @GetMapping("/destinations")
    public ResponseEntity<List<PopularDestination>> getAllDestinations(
            @RequestParam(required = false) String city) {
        if (city != null && !city.isBlank()) {
            return ResponseEntity.ok(destinationRepository.findByCityIgnoreCase(city));
        }
        return ResponseEntity.ok(destinationRepository.findAll());
    }

    @PostMapping("/destinations")
    public ResponseEntity<PopularDestination> createDestination(
            @RequestBody PopularDestination destination) {
        destination.setId(null); // Ensure new document
        return ResponseEntity.ok(destinationRepository.save(destination));
    }

    @PutMapping("/destinations/{id}")
    public ResponseEntity<PopularDestination> updateDestination(
            @PathVariable String id,
            @RequestBody PopularDestination destination) {
        destination.setId(id);
        return ResponseEntity.ok(destinationRepository.save(destination));
    }

    @DeleteMapping("/destinations/{id}")
    public ResponseEntity<Void> deleteDestination(@PathVariable String id) {
        destinationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Festival Configs ──────────────────────────────────────────────────────

    @GetMapping("/festivals")
    public ResponseEntity<List<FestivalConfig>> getAllFestivals() {
        return ResponseEntity.ok(festivalConfigRepository.findAll());
    }

    @PostMapping("/festivals")
    public ResponseEntity<FestivalConfig> createFestival(
            @RequestBody FestivalConfig festival) {
        festival.setId(null); // Ensure new document
        return ResponseEntity.ok(festivalConfigRepository.save(festival));
    }

    @PutMapping("/festivals/{id}")
    public ResponseEntity<FestivalConfig> updateFestival(
            @PathVariable String id,
            @RequestBody FestivalConfig festival) {
        festival.setId(id);
        return ResponseEntity.ok(festivalConfigRepository.save(festival));
    }

    @DeleteMapping("/festivals/{id}")
    public ResponseEntity<Void> deleteFestival(@PathVariable String id) {
        festivalConfigRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
