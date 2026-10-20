package com.amrutha.subscription.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Aggregated daily milk delivery forecasting for dairy procurement and route planning.
 */
public class DailyDemandDto {

    private LocalDate forecastDate;
    private int activeSubscribersCount;

    // Morning Shift (5:30 AM – 7:30 AM)
    private BigDecimal morningCowLitres;
    private BigDecimal morningBuffaloLitres;
    private BigDecimal morningTotalLitres;

    // Evening Shift (5:00 PM – 7:00 PM)
    private BigDecimal eveningCowLitres;
    private BigDecimal eveningBuffaloLitres;
    private BigDecimal eveningTotalLitres;

    // Combined Totals
    private BigDecimal totalCowLitres;
    private BigDecimal totalBuffaloLitres;
    private BigDecimal grandTotalLitres;

    // Subscription Revenue metrics
    private BigDecimal totalActiveRevenue;
    private BigDecimal totalPaidRevenue;
    private BigDecimal totalPendingRevenue;

    public DailyDemandDto() {
        this.morningCowLitres = BigDecimal.ZERO;
        this.morningBuffaloLitres = BigDecimal.ZERO;
        this.morningTotalLitres = BigDecimal.ZERO;
        this.eveningCowLitres = BigDecimal.ZERO;
        this.eveningBuffaloLitres = BigDecimal.ZERO;
        this.eveningTotalLitres = BigDecimal.ZERO;
        this.totalCowLitres = BigDecimal.ZERO;
        this.totalBuffaloLitres = BigDecimal.ZERO;
        this.grandTotalLitres = BigDecimal.ZERO;
        this.totalActiveRevenue = BigDecimal.ZERO;
        this.totalPaidRevenue = BigDecimal.ZERO;
        this.totalPendingRevenue = BigDecimal.ZERO;
    }

    public LocalDate getForecastDate() {
        return forecastDate;
    }

    public void setForecastDate(LocalDate forecastDate) {
        this.forecastDate = forecastDate;
    }

    public int getActiveSubscribersCount() {
        return activeSubscribersCount;
    }

    public void setActiveSubscribersCount(int activeSubscribersCount) {
        this.activeSubscribersCount = activeSubscribersCount;
    }

    public BigDecimal getMorningCowLitres() {
        return morningCowLitres;
    }

    public void setMorningCowLitres(BigDecimal morningCowLitres) {
        this.morningCowLitres = morningCowLitres;
    }

    public BigDecimal getMorningBuffaloLitres() {
        return morningBuffaloLitres;
    }

    public void setMorningBuffaloLitres(BigDecimal morningBuffaloLitres) {
        this.morningBuffaloLitres = morningBuffaloLitres;
    }

    public BigDecimal getMorningTotalLitres() {
        return morningTotalLitres;
    }

    public void setMorningTotalLitres(BigDecimal morningTotalLitres) {
        this.morningTotalLitres = morningTotalLitres;
    }

    public BigDecimal getEveningCowLitres() {
        return eveningCowLitres;
    }

    public void setEveningCowLitres(BigDecimal eveningCowLitres) {
        this.eveningCowLitres = eveningCowLitres;
    }

    public BigDecimal getEveningBuffaloLitres() {
        return eveningBuffaloLitres;
    }

    public void setEveningBuffaloLitres(BigDecimal eveningBuffaloLitres) {
        this.eveningBuffaloLitres = eveningBuffaloLitres;
    }

    public BigDecimal getEveningTotalLitres() {
        return eveningTotalLitres;
    }

    public void setEveningTotalLitres(BigDecimal eveningTotalLitres) {
        this.eveningTotalLitres = eveningTotalLitres;
    }

    public BigDecimal getTotalCowLitres() {
        return totalCowLitres;
    }

    public void setTotalCowLitres(BigDecimal totalCowLitres) {
        this.totalCowLitres = totalCowLitres;
    }

    public BigDecimal getTotalBuffaloLitres() {
        return totalBuffaloLitres;
    }

    public void setTotalBuffaloLitres(BigDecimal totalBuffaloLitres) {
        this.totalBuffaloLitres = totalBuffaloLitres;
    }

    public BigDecimal getGrandTotalLitres() {
        return grandTotalLitres;
    }

    public void setGrandTotalLitres(BigDecimal grandTotalLitres) {
        this.grandTotalLitres = grandTotalLitres;
    }

    public BigDecimal getTotalActiveRevenue() {
        return totalActiveRevenue;
    }

    public void setTotalActiveRevenue(BigDecimal totalActiveRevenue) {
        this.totalActiveRevenue = totalActiveRevenue;
    }

    public BigDecimal getTotalPaidRevenue() {
        return totalPaidRevenue;
    }

    public void setTotalPaidRevenue(BigDecimal totalPaidRevenue) {
        this.totalPaidRevenue = totalPaidRevenue;
    }

    public BigDecimal getTotalPendingRevenue() {
        return totalPendingRevenue;
    }

    public void setTotalPendingRevenue(BigDecimal totalPendingRevenue) {
        this.totalPendingRevenue = totalPendingRevenue;
    }
}
