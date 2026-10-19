package com.amrutha.dashboard.dto;

import com.amrutha.product.dto.ProductResponseDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Dedicated Dashboard metrics for the Rice Division.
 */
public class RiceDashboardDto {

    private BigDecimal riceRevenue;
    private long totalRiceOrders;
    private long activeRiceProducts;
    private long totalRiceStockBags;
    private Map<String, Long> statusCounts;
    private Map<String, Long> bagBreakdown;
    private List<ProductResponseDto> lowStockProducts;
    private List<ProductResponseDto> products;

    public RiceDashboardDto() {
    }

    public BigDecimal getRiceRevenue() {
        return riceRevenue;
    }

    public void setRiceRevenue(BigDecimal riceRevenue) {
        this.riceRevenue = riceRevenue;
    }

    public long getTotalRiceOrders() {
        return totalRiceOrders;
    }

    public void setTotalRiceOrders(long totalRiceOrders) {
        this.totalRiceOrders = totalRiceOrders;
    }

    public long getActiveRiceProducts() {
        return activeRiceProducts;
    }

    public void setActiveRiceProducts(long activeRiceProducts) {
        this.activeRiceProducts = activeRiceProducts;
    }

    public long getTotalRiceStockBags() {
        return totalRiceStockBags;
    }

    public void setTotalRiceStockBags(long totalRiceStockBags) {
        this.totalRiceStockBags = totalRiceStockBags;
    }

    public Map<String, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public Map<String, Long> getBagBreakdown() {
        return bagBreakdown;
    }

    public void setBagBreakdown(Map<String, Long> bagBreakdown) {
        this.bagBreakdown = bagBreakdown;
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
