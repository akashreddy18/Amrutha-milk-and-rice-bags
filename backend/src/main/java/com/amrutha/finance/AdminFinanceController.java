package com.amrutha.finance;

import com.amrutha.common.ApiResponse;
import com.amrutha.finance.dto.FinancialReportDto;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for Administrator Financial Statements and Reports.
 * Base Path: /api/admin/finance
 * Generates Daily, Monthly, and Date-Range P&L reports with Dairy, Rice, and Combined segregation.
 * Strictly restricted to authenticated users with administrative roles.
 */
@RestController
@RequestMapping("/api/admin/finance")
public class AdminFinanceController {

    private final FinancialReportService financialReportService;

    public AdminFinanceController(FinancialReportService financialReportService) {
        this.financialReportService = financialReportService;
    }

    /**
     * GET /api/admin/finance/daily
     * Generates a daily financial report for a specific date (defaults to today).
     */
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<FinancialReportDto>> getDailyReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate reportDate = (date != null) ? date : LocalDate.now();
        FinancialReportDto report = financialReportService.getDailyReport(reportDate);
        return ResponseEntity.ok(ApiResponse.ok("Daily financial report for " + reportDate, report));
    }

    /**
     * GET /api/admin/finance/monthly
     * Generates a monthly financial report for a given year and month (defaults to current month).
     */
    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<FinancialReportDto>> getMonthlyReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        LocalDate today = LocalDate.now();
        int repYear = (year != null) ? year : today.getYear();
        int repMonth = (month != null) ? month : today.getMonthValue();

        FinancialReportDto report = financialReportService.getMonthlyReport(repYear, repMonth);
        return ResponseEntity.ok(ApiResponse.ok("Monthly financial report for " + repYear + "-" + String.format("%02d", repMonth), report));
    }

    /**
     * GET /api/admin/finance/report
     * Generates a financial report for a custom date range.
     */
    @GetMapping("/report")
    public ResponseEntity<ApiResponse<FinancialReportDto>> getDateRangeReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        FinancialReportDto report = financialReportService.getDateRangeReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok("Financial report for period " + report.getStartDate() + " to " + report.getEndDate(), report));
    }
}
