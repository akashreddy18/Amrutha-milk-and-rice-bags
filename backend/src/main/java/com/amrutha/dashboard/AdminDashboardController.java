package com.amrutha.dashboard;

import com.amrutha.common.ApiResponse;
import com.amrutha.dashboard.dto.CombinedOverviewDto;
import com.amrutha.dashboard.dto.DairyDashboardDto;
import com.amrutha.dashboard.dto.RiceDashboardDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Administrator & Owner Dashboards.
 * Base Path: /api/admin/dashboard
 * Strictly restricted to authenticated users with administrative roles.
 */
@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/admin/dashboard/overview
     * Combined business overview for the owner (total revenue, breakdown by BU,
     * status counts, low-stock alerts, and recent orders).
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<CombinedOverviewDto>> getCombinedOverview() {
        CombinedOverviewDto overview = dashboardService.getCombinedOverview();
        return ResponseEntity.ok(ApiResponse.ok("Combined owner dashboard overview retrieved", overview));
    }

    /**
     * GET /api/admin/dashboard/dairy
     * Dedicated dairy division metrics (revenue, orders, milk stock, morning/evening slots, low-stock alerts).
     */
    @GetMapping("/dairy")
    public ResponseEntity<ApiResponse<DairyDashboardDto>> getDairyDashboard() {
        DairyDashboardDto dairyDashboard = dashboardService.getDairyDashboard();
        return ResponseEntity.ok(ApiResponse.ok("Dairy division dashboard retrieved", dairyDashboard));
    }

    /**
     * GET /api/admin/dashboard/rice
     * Dedicated rice division metrics (revenue, orders, rice bag stock, bag size distribution, low-stock alerts).
     */
    @GetMapping("/rice")
    public ResponseEntity<ApiResponse<RiceDashboardDto>> getRiceDashboard() {
        RiceDashboardDto riceDashboard = dashboardService.getRiceDashboard();
        return ResponseEntity.ok(ApiResponse.ok("Rice division dashboard retrieved", riceDashboard));
    }
}
