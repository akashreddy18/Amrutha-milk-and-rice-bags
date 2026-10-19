package com.amrutha.finance.dto;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Summary financial metrics for a specific division or combined business.
 * Uses BigDecimal for all monetary calculations.
 */
public class FinancialSummaryDto {

    private String businessUnit; // "DAIRY", "RICE", "COMBINED"
    private BigDecimal revenue = BigDecimal.ZERO;
    private BigDecimal cogsPurchases = BigDecimal.ZERO;
    private BigDecimal operatingExpenses = BigDecimal.ZERO;
    private BigDecimal totalCosts = BigDecimal.ZERO;
    private BigDecimal grossProfit = BigDecimal.ZERO;
    private BigDecimal netProfit = BigDecimal.ZERO;
    private BigDecimal grossMarginPercent;
    private BigDecimal netMarginPercent;
    private long completedOrdersCount;
    private long purchasesCount;
    private long expensesCount;
    private boolean isCalculationComplete;
    private String statusMessage;
    private Map<String, BigDecimal> expensesByCategory = new LinkedHashMap<>();

    public FinancialSummaryDto() {
    }

    public FinancialSummaryDto(String businessUnit) {
        this.businessUnit = businessUnit;
    }

    public String getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(String businessUnit) {
        this.businessUnit = businessUnit;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
    }

    public BigDecimal getCogsPurchases() {
        return cogsPurchases;
    }

    public void setCogsPurchases(BigDecimal cogsPurchases) {
        this.cogsPurchases = cogsPurchases != null ? cogsPurchases : BigDecimal.ZERO;
    }

    public BigDecimal getOperatingExpenses() {
        return operatingExpenses;
    }

    public void setOperatingExpenses(BigDecimal operatingExpenses) {
        this.operatingExpenses = operatingExpenses != null ? operatingExpenses : BigDecimal.ZERO;
    }

    public BigDecimal getTotalCosts() {
        return totalCosts;
    }

    public void setTotalCosts(BigDecimal totalCosts) {
        this.totalCosts = totalCosts != null ? totalCosts : BigDecimal.ZERO;
    }

    public BigDecimal getGrossProfit() {
        return grossProfit;
    }

    public void setGrossProfit(BigDecimal grossProfit) {
        this.grossProfit = grossProfit != null ? grossProfit : BigDecimal.ZERO;
    }

    public BigDecimal getNetProfit() {
        return netProfit;
    }

    public void setNetProfit(BigDecimal netProfit) {
        this.netProfit = netProfit != null ? netProfit : BigDecimal.ZERO;
    }

    public BigDecimal getGrossMarginPercent() {
        return grossMarginPercent;
    }

    public void setGrossMarginPercent(BigDecimal grossMarginPercent) {
        this.grossMarginPercent = grossMarginPercent;
    }

    public BigDecimal getNetMarginPercent() {
        return netMarginPercent;
    }

    public void setNetMarginPercent(BigDecimal netMarginPercent) {
        this.netMarginPercent = netMarginPercent;
    }

    public long getCompletedOrdersCount() {
        return completedOrdersCount;
    }

    public void setCompletedOrdersCount(long completedOrdersCount) {
        this.completedOrdersCount = completedOrdersCount;
    }

    public long getPurchasesCount() {
        return purchasesCount;
    }

    public void setPurchasesCount(long purchasesCount) {
        this.purchasesCount = purchasesCount;
    }

    public long getExpensesCount() {
        return expensesCount;
    }

    public void setExpensesCount(long expensesCount) {
        this.expensesCount = expensesCount;
    }

    public boolean isCalculationComplete() {
        return isCalculationComplete;
    }

    public void setCalculationComplete(boolean calculationComplete) {
        isCalculationComplete = calculationComplete;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public Map<String, BigDecimal> getExpensesByCategory() {
        return expensesByCategory;
    }

    public void setExpensesByCategory(Map<String, BigDecimal> expensesByCategory) {
        this.expensesByCategory = expensesByCategory != null ? expensesByCategory : new LinkedHashMap<>();
    }
}
