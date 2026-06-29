package com.cabgo.controller;

import com.cabgo.dto.FareRequest;
import com.cabgo.dto.FareResponse;
import com.cabgo.response.ApiResponse;
import com.cabgo.service.FareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fares")
@RequiredArgsConstructor
public class FareController {

    private final FareService fareService;

    @PostMapping("/estimate")
    public ResponseEntity<ApiResponse<FareResponse>> estimateFare(@RequestBody FareRequest request) {
        FareResponse response = fareService.estimateFare(request);
        return ResponseEntity.ok(ApiResponse.success("Fare estimated successfully", response));
    }
}
