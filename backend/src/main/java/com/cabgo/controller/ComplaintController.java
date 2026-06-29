package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                complaintService.getAllComplaints(status, type, page, size)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getComplaintStats() {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getComplaintStats()));
    }

    @GetMapping("/sos")
    public ResponseEntity<ApiResponse<?>> getSosAlerts() {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getSosAlerts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getComplaintById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getById(id)));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<?>> resolve(
            @PathVariable String id,
            @RequestParam String resolution,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Complaint resolved",
                complaintService.resolveComplaint(id, resolution, auth.getName())));
    }
}
