package com.cabgo.service;

import com.cabgo.dto.response.RideResponse;
import com.cabgo.enums.AuditAction;
import com.cabgo.enums.RideStatus;
import com.cabgo.exception.BadRequestException;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Ride;
import com.cabgo.repository.RideRepository;
import com.cabgo.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final AuditLogService auditLogService;

    public PagedResponse<RideResponse> getAllRides(String search, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Ride> rides;
        if (search != null && !search.isBlank()) {
            rides = rideRepository.searchRides(search.trim(), pageable);
        } else if (status != null) {
            rides = rideRepository.findByStatus(RideStatus.valueOf(status), pageable);
        } else {
            rides = rideRepository.findAll(pageable);
        }
        return buildPagedResponse(rides);
    }

    public RideResponse getRideById(String id) {
        return rideRepository.findById(id).map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ride", id));
    }

    public RideResponse updateRideStatus(String id, RideStatus newStatus, String adminId) {
        Ride ride = rideRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ride", id));
        ride.setStatus(newStatus);
        Ride saved = rideRepository.save(ride);
        auditLogService.log(adminId, null, AuditAction.UPDATE, "RIDE", id, "Ride status updated to: " + newStatus);
        return mapToResponse(saved);
    }

    public RideResponse cancelRide(String id, String reason, String adminId) {
        Ride ride = rideRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ride", id));
        if (ride.getStatus() == RideStatus.COMPLETED || ride.getStatus() == RideStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel a " + ride.getStatus().name().toLowerCase() + " ride");
        }
        ride.setStatus(RideStatus.CANCELLED);
        ride.setCancellationReason(reason);
        ride.setCancelledBy("ADMIN");
        ride.setCancelledAt(LocalDateTime.now());
        Ride saved = rideRepository.save(ride);
        auditLogService.log(adminId, null, AuditAction.UPDATE, "RIDE", id, "Ride cancelled by admin: " + reason);
        return mapToResponse(saved);
    }

    public Map<String, Long> getRideStats() {
        return Map.of(
                "total", rideRepository.count(),
                "requested", rideRepository.countByStatus(RideStatus.REQUESTED),
                "accepted", rideRepository.countByStatus(RideStatus.ACCEPTED),
                "ongoing", rideRepository.countByStatus(RideStatus.ONGOING),
                "completed", rideRepository.countByStatus(RideStatus.COMPLETED),
                "cancelled", rideRepository.countByStatus(RideStatus.CANCELLED)
        );
    }

    public PagedResponse<RideResponse> getRidesByCustomer(String customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Ride> rides = rideRepository.findByCustomerId(customerId, pageable);
        return buildPagedResponse(rides);
    }

    public PagedResponse<RideResponse> getRidesByDriver(String driverId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Ride> rides = rideRepository.findByDriverId(driverId, pageable);
        return buildPagedResponse(rides);
    }

    private PagedResponse<RideResponse> buildPagedResponse(Page<Ride> page) {
        return PagedResponse.<RideResponse>builder()
                .content(page.map(this::mapToResponse).getContent())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).first(page.isFirst()).build();
    }

    public RideResponse mapToResponse(Ride r) {
        return RideResponse.builder().id(r.getId()).customerId(r.getCustomerId())
                .customerName(r.getCustomerName()).driverId(r.getDriverId())
                .driverName(r.getDriverName()).pickupLocation(r.getPickupLocation())
                .dropLocation(r.getDropLocation()).status(r.getStatus())
                .vehicleCategory(r.getVehicleCategory()).fare(r.getFare())
                .distance(r.getDistance()).duration(r.getDuration() != null ? r.getDuration().intValue() : null)
                .paymentMethod(r.getPaymentMethod()).cityId(r.getCityId())
                .cancellationReason(r.getCancellationReason()).cancelledBy(r.getCancelledBy())
                .requestedAt(r.getRequestedAt()).completedAt(r.getCompletedAt())
                .createdAt(r.getCreatedAt()).build();
    }
}
