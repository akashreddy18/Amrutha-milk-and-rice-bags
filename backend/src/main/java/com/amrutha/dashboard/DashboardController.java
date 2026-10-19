package com.amrutha.dashboard;

import com.amrutha.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller providing business metrics overview.
 * Base Path: /api/dashboard
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard/summary
     * Returns consolidated counters for products, customers, orders, purchases, and expenses.
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        DashboardSummaryDto summary = dashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard summary retrieved successfully", summary));
    }
}
