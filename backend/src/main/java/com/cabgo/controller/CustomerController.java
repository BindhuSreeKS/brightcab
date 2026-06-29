package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                customerService.getAllCustomers(search, status, page, size)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getCustomerById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerById(id)));
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<ApiResponse<?>> blockCustomer(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Customer blocked", customerService.blockCustomer(id, auth.getName())));
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<ApiResponse<?>> unblockCustomer(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Customer unblocked", customerService.unblockCustomer(id, auth.getName())));
    }
}
