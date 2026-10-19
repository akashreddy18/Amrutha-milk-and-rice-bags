package com.amrutha.dashboard;

/**
 * Summary metrics for the Amrutha business dashboard across Dairy & Rice units.
 */
public class DashboardSummaryDto {

    private long totalActiveProducts;
    private long dairyProductsCount;
    private long riceProductsCount;
    private long totalActiveCustomers;
    private long totalOrders;
    private long totalPurchases;
    private long totalExpenses;

    public DashboardSummaryDto() {
    }

    public DashboardSummaryDto(long totalActiveProducts, long dairyProductsCount, long riceProductsCount,
                               long totalActiveCustomers, long totalOrders, long totalPurchases, long totalExpenses) {
        this.totalActiveProducts = totalActiveProducts;
        this.dairyProductsCount = dairyProductsCount;
        this.riceProductsCount = riceProductsCount;
        this.totalActiveCustomers = totalActiveCustomers;
        this.totalOrders = totalOrders;
        this.totalPurchases = totalPurchases;
        this.totalExpenses = totalExpenses;
    }

    // Getters and Setters

    public long getTotalActiveProducts() {
        return totalActiveProducts;
    }

    public void setTotalActiveProducts(long totalActiveProducts) {
        this.totalActiveProducts = totalActiveProducts;
    }

    public long getDairyProductsCount() {
        return dairyProductsCount;
    }

    public void setDairyProductsCount(long dairyProductsCount) {
        this.dairyProductsCount = dairyProductsCount;
    }

    public long getRiceProductsCount() {
        return riceProductsCount;
    }

    public void setRiceProductsCount(long riceProductsCount) {
        this.riceProductsCount = riceProductsCount;
    }

    public long getTotalActiveCustomers() {
        return totalActiveCustomers;
    }

    public void setTotalActiveCustomers(long totalActiveCustomers) {
        this.totalActiveCustomers = totalActiveCustomers;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(long totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public long getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(long totalExpenses) {
        this.totalExpenses = totalExpenses;
    }
}
