package com.amrutha.dashboard.dto;

import com.amrutha.product.dto.ProductResponseDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Dedicated Dashboard metrics for the Dairy Division.
 */
public class DairyDashboardDto {

    private BigDecimal dairyRevenue;
    private long totalDairyOrders;
    private long activeDairyProducts;
    private long totalDairyStockUnits;
    private long morningDeliveries;
    private long eveningDeliveries;
    private Map<String, Long> statusCounts;
    private List<ProductResponseDto> lowStockProducts;
    private List<ProductResponseDto> products;

    public DairyDashboardDto() {
    }

    public BigDecimal getDairyRevenue() {
        return dairyRevenue;
    }

    public void setDairyRevenue(BigDecimal dairyRevenue) {
        this.dairyRevenue = dairyRevenue;
    }

    public long getTotalDairyOrders() {
        return totalDairyOrders;
    }

    public void setTotalDairyOrders(long totalDairyOrders) {
        this.totalDairyOrders = totalDairyOrders;
    }

    public long getActiveDairyProducts() {
        return activeDairyProducts;
    }

    public void setActiveDairyProducts(long activeDairyProducts) {
        this.activeDairyProducts = activeDairyProducts;
    }

    public long getTotalDairyStockUnits() {
        return totalDairyStockUnits;
    }

    public void setTotalDairyStockUnits(long totalDairyStockUnits) {
        this.totalDairyStockUnits = totalDairyStockUnits;
    }

    public long getMorningDeliveries() {
        return morningDeliveries;
    }

    public void setMorningDeliveries(long morningDeliveries) {
        this.morningDeliveries = morningDeliveries;
    }

    public long getEveningDeliveries() {
        return eveningDeliveries;
    }

    public void setEveningDeliveries(long eveningDeliveries) {
        this.eveningDeliveries = eveningDeliveries;
    }

    public Map<String, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public List<ProductResponseDto> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<ProductResponseDto> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public List<ProductResponseDto> getProducts() {
        return products;
    }

    public void setProducts(List<ProductResponseDto> products) {
        this.products = products;
    }
}
