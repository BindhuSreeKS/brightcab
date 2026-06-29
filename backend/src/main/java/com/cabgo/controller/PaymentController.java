package com.cabgo.controller;

import com.cabgo.response.ApiResponse;
import com.cabgo.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getAllPayments(status, page, size)));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<?>> getRevenueStats() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getRevenueStats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getPaymentById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getById(id)));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<?>> refund(@PathVariable String id, @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success("Refund processed", paymentService.processRefund(id, reason)));
    }
}
