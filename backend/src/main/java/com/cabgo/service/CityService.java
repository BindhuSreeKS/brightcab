package com.cabgo.service;

import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.City;
import com.cabgo.repository.CityRepository;
import com.cabgo.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;

    public City addCity(City city) {
        if (cityRepository.existsByName(city.getName())) {
            throw new BadRequestException("City already exists: " + city.getName());
        }
        return cityRepository.save(city);
    }

    public PagedResponse<City> getAllCities(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<City> cities = cityRepository.findAll(pageable);
        return PagedResponse.<City>builder()
                .content(cities.getContent()).page(cities.getNumber()).size(cities.getSize())
                .totalElements(cities.getTotalElements()).totalPages(cities.getTotalPages())
                .last(cities.isLast()).first(cities.isFirst()).build();
    }

    public List<City> getActiveCities() {
        return cityRepository.findByActive(true);
    }

    public City getCityById(String id) {
        return cityRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("City", id));
    }

    public City updateCity(String id, City updated) {
        City city = cityRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("City", id));
        city.setName(updated.getName());
        city.setState(updated.getState());
        city.setCountry(updated.getCountry());
        city.setServiceAreas(updated.getServiceAreas());
        city.setLatitude(updated.getLatitude());
        city.setLongitude(updated.getLongitude());
        city.setRadius(updated.getRadius());
        return cityRepository.save(city);
    }

    public void toggleCityStatus(String id, boolean active) {
        City city = cityRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("City", id));
        city.setActive(active);
        cityRepository.save(city);
    }

    public void deleteCity(String id) {
        cityRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("City", id));
        cityRepository.deleteById(id);
    }
}
