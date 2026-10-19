package com.amrutha.dashboard.dto;

import com.amrutha.order.dto.OrderResponseDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Consolidated Owner Executive Overview combining Dairy and Rice business units.
 */
public class CombinedOverviewDto {

    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalCustomers;

    // Dairy breakdown
    private BigDecimal dairyRevenue;
    private long dairyOrdersCount;
    private long dairyProductsCount;
    private long dairyLowStockCount;

    // Rice breakdown
    private BigDecimal riceRevenue;
    private long riceOrdersCount;
    private long riceProductsCount;
    private long riceLowStockCount;

    // Orders by Status
    private Map<String, Long> ordersByStatus;

    // Recent Orders
    private List<OrderResponseDto> recentOrders;

    public CombinedOverviewDto() {
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public BigDecimal getDairyRevenue() {
        return dairyRevenue;
    }

    public void setDairyRevenue(BigDecimal dairyRevenue) {
        this.dairyRevenue = dairyRevenue;
    }

    public long getDairyOrdersCount() {
        return dairyOrdersCount;
    }

    public void setDairyOrdersCount(long dairyOrdersCount) {
        this.dairyOrdersCount = dairyOrdersCount;
    }

    public long getDairyProductsCount() {
        return dairyProductsCount;
    }

    public void setDairyProductsCount(long dairyProductsCount) {
        this.dairyProductsCount = dairyProductsCount;
    }

    public long getDairyLowStockCount() {
        return dairyLowStockCount;
    }

    public void setDairyLowStockCount(long dairyLowStockCount) {
        this.dairyLowStockCount = dairyLowStockCount;
    }

    public BigDecimal getRiceRevenue() {
        return riceRevenue;
    }

    public void setRiceRevenue(BigDecimal riceRevenue) {
        this.riceRevenue = riceRevenue;
    }

    public long getRiceOrdersCount() {
        return riceOrdersCount;
    }

    public void setRiceOrdersCount(long riceOrdersCount) {
        this.riceOrdersCount = riceOrdersCount;
    }

    public long getRiceProductsCount() {
        return riceProductsCount;
    }

    public void setRiceProductsCount(long riceProductsCount) {
        this.riceProductsCount = riceProductsCount;
    }

    public long getRiceLowStockCount() {
        return riceLowStockCount;
    }

    public void setRiceLowStockCount(long riceLowStockCount) {
        this.riceLowStockCount = riceLowStockCount;
    }

    public Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }

    public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }

    public List<OrderResponseDto> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<OrderResponseDto> recentOrders) {
        this.recentOrders = recentOrders;
    }
}
