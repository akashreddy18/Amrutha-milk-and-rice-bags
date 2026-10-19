package com.amrutha.finance.dto;

import java.time.LocalDate;

/**
 * Complete Financial Statement Report with Dairy, Rice, and Combined totals.
 * Documents accounting rules and separates revenue, COGS, and OPEX.
 */
public class FinancialReportDto {

    private String periodType; // "DAILY", "MONTHLY", "CUSTOM_RANGE"
    private LocalDate startDate;
    private LocalDate endDate;
    private String accountingRules;
    private FinancialSummaryDto dairyFinance;
    private FinancialSummaryDto riceFinance;
    private FinancialSummaryDto combinedFinance;

    public FinancialReportDto() {
    }

    public FinancialReportDto(String periodType, LocalDate startDate, LocalDate endDate, String accountingRules,
                              FinancialSummaryDto dairyFinance, FinancialSummaryDto riceFinance,
                              FinancialSummaryDto combinedFinance) {
        this.periodType = periodType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.accountingRules = accountingRules;
        this.dairyFinance = dairyFinance;
        this.riceFinance = riceFinance;
        this.combinedFinance = combinedFinance;
    }

    public String getPeriodType() {
        return periodType;
    }

    public void setPeriodType(String periodType) {
        this.periodType = periodType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getAccountingRules() {
        return accountingRules;
    }

    public void setAccountingRules(String accountingRules) {
        this.accountingRules = accountingRules;
    }

    public FinancialSummaryDto getDairyFinance() {
        return dairyFinance;
    }

    public void setDairyFinance(FinancialSummaryDto dairyFinance) {
        this.dairyFinance = dairyFinance;
    }

    public FinancialSummaryDto getRiceFinance() {
        return riceFinance;
    }

    public void setRiceFinance(FinancialSummaryDto riceFinance) {
        this.riceFinance = riceFinance;
    }

    public FinancialSummaryDto getCombinedFinance() {
        return combinedFinance;
    }

    public void setCombinedFinance(FinancialSummaryDto combinedFinance) {
        this.combinedFinance = combinedFinance;
    }

    // Convenience alias getters
    public FinancialSummaryDto getDairy() {
        return dairyFinance;
    }

    public FinancialSummaryDto getRice() {
        return riceFinance;
    }

    public FinancialSummaryDto getCombined() {
        return combinedFinance;
    }
}
