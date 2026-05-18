package com.cabgo.controller;

import com.cabgo.model.Transaction;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/customer/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final PaymentService paymentService;

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<Double>> getBalance(Authentication authentication) {
        String customerId = authentication.getName();
        Double balance = paymentService.getBalance(customerId);
        return ResponseEntity.ok(ApiResponse.success("Balance fetched", balance));
    }

    @PostMapping("/add-money")
    public ResponseEntity<ApiResponse<String>> addMoney(
            Authentication authentication,
            @RequestBody Map<String, Double> request) {
        String customerId = authentication.getName();
        paymentService.addMoney(customerId, request.get("amount"));
        return ResponseEntity.ok(ApiResponse.success("Money added to wallet successfully", null));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<Transaction>>> getTransactions(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String customerId = authentication.getName();
        Page<Transaction> transactions = paymentService.getTransactions(customerId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Transactions fetched", transactions));
    }
}
