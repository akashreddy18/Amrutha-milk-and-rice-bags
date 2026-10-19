package com.amrutha.dashboard;

import com.amrutha.customer.CustomerRepository;
import com.amrutha.dashboard.dto.CombinedOverviewDto;
import com.amrutha.dashboard.dto.DairyDashboardDto;
import com.amrutha.dashboard.dto.RiceDashboardDto;
import com.amrutha.expense.ExpenseRepository;
import com.amrutha.order.Order;
import com.amrutha.order.OrderRepository;
import com.amrutha.order.OrderStatus;
import com.amrutha.order.dto.OrderResponseDto;
import com.amrutha.orderitem.OrderItem;
import com.amrutha.product.BusinessUnit;
import com.amrutha.product.Product;
import com.amrutha.product.ProductRepository;
import com.amrutha.product.dto.ProductResponseDto;
import com.amrutha.purchase.PurchaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service providing aggregated overview and division-specific dashboards
 * for the Owner, Dairy Division, and Rice Division.
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;

    public DashboardService(ProductRepository productRepository,
                            CustomerRepository customerRepository,
                            OrderRepository orderRepository,
                            PurchaseRepository purchaseRepository,
                            ExpenseRepository expenseRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.purchaseRepository = purchaseRepository;
        this.expenseRepository = expenseRepository;
    }

    public DashboardSummaryDto getSummary() {
        long dairyProducts = productRepository.findByBusinessUnitAndActiveTrue(BusinessUnit.DAIRY).size();
        long riceProducts = productRepository.findByBusinessUnitAndActiveTrue(BusinessUnit.RICE).size();
        long totalProducts = productRepository.findByActiveTrue().size();
        long activeCustomers = customerRepository.findByActiveTrue().size();
        long totalOrders = orderRepository.count();
        long totalPurchases = purchaseRepository.count();
        long totalExpenses = expenseRepository.count();

        return new DashboardSummaryDto(
                totalProducts,
                dairyProducts,
                riceProducts,
                activeCustomers,
                totalOrders,
                totalPurchases,
                totalExpenses
        );
    }

    /**
     * Aggregates executive owner overview metrics combining Dairy and Rice.
     */
    public CombinedOverviewDto getCombinedOverview() {
        List<Order> allOrders = orderRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        long totalCustomers = customerRepository.count();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal dairyRevenue = BigDecimal.ZERO;
        BigDecimal riceRevenue = BigDecimal.ZERO;
        long dairyOrdersCount = 0;
        long riceOrdersCount = 0;

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            statusCounts.put(st.name(), 0L);
        }

        for (Order o : allOrders) {
            String stName = o.getStatus().name();
            statusCounts.put(stName, statusCounts.getOrDefault(stName, 0L) + 1);

            if (o.getStatus() != OrderStatus.CANCELLED) {
                totalRevenue = totalRevenue.add(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO);

                // Check business unit attribution
                if (o.getBusinessUnit() == BusinessUnit.DAIRY) {
                    dairyOrdersCount++;
                } else if (o.getBusinessUnit() == BusinessUnit.RICE) {
                    riceOrdersCount++;
                } else {
                    // MIXED order: attribute counts to both divisions
                    dairyOrdersCount++;
                    riceOrdersCount++;
                }

                // Compute exact revenue by line items
                for (OrderItem item : o.getItems()) {
                    BigDecimal itemSubtotal = item.getSubtotal() != null
                            ? item.getSubtotal()
                            : item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    if (item.getBusinessUnit() == BusinessUnit.DAIRY) {
                        dairyRevenue = dairyRevenue.add(itemSubtotal);
                    } else if (item.getBusinessUnit() == BusinessUnit.RICE) {
                        riceRevenue = riceRevenue.add(itemSubtotal);
                    }
                }
            }
        }

        long dairyProductsCount = allProducts.stream()
                .filter(p -> p.getBusinessUnit() == BusinessUnit.DAIRY && p.isActive())
                .count();

        long riceProductsCount = allProducts.stream()
                .filter(p -> p.getBusinessUnit() == BusinessUnit.RICE && p.isActive())
                .count();

        long dairyLowStockCount = allProducts.stream()
                .filter(p -> p.getBusinessUnit() == BusinessUnit.DAIRY && p.getStockQuantity() != null && p.getStockQuantity() < 25)
                .count();

        long riceLowStockCount = allProducts.stream()
                .filter(p -> p.getBusinessUnit() == BusinessUnit.RICE && p.getStockQuantity() != null && p.getStockQuantity() < 15)
                .count();

        // Latest orders sorted descending
        List<OrderResponseDto> recentOrders = allOrders.stream()
                .sorted(Comparator.comparing(Order::getId).reversed())
                .limit(10)
                .map(OrderResponseDto::fromEntity)
                .collect(Collectors.toList());

        CombinedOverviewDto overview = new CombinedOverviewDto();
        overview.setTotalRevenue(totalRevenue);
        overview.setTotalOrders(allOrders.size());
        overview.setTotalProducts(allProducts.size());
        overview.setTotalCustomers(totalCustomers);
        overview.setDairyRevenue(dairyRevenue);
        overview.setDairyOrdersCount(dairyOrdersCount);
        overview.setDairyProductsCount(dairyProductsCount);
        overview.setDairyLowStockCount(dairyLowStockCount);
        overview.setRiceRevenue(riceRevenue);
        overview.setRiceOrdersCount(riceOrdersCount);
        overview.setRiceProductsCount(riceProductsCount);
        overview.setRiceLowStockCount(riceLowStockCount);
        overview.setOrdersByStatus(statusCounts);
        overview.setRecentOrders(recentOrders);

        return overview;
    }

    /**
     * Aggregates metrics specific to Dairy division operations.
     */
    public DairyDashboardDto getDairyDashboard() {
        List<Product> dairyProducts = productRepository.findByBusinessUnit(BusinessUnit.DAIRY);
        List<Order> allOrders = orderRepository.findAll();

        BigDecimal dairyRevenue = BigDecimal.ZERO;
        long dairyOrdersCount = 0;
        long morningDeliveries = 0;
        long eveningDeliveries = 0;
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            statusCounts.put(st.name(), 0L);
        }

        for (Order o : allOrders) {
            boolean hasDairy = o.getBusinessUnit() == BusinessUnit.DAIRY
                    || o.getBusinessUnit() == BusinessUnit.MIXED
                    || o.getItems().stream().anyMatch(i -> i.getBusinessUnit() == BusinessUnit.DAIRY);

            if (hasDairy) {
                dairyOrdersCount++;
                String stName = o.getStatus().name();
                statusCounts.put(stName, statusCounts.getOrDefault(stName, 0L) + 1);

                String slot = o.getDeliverySlot() != null ? o.getDeliverySlot().toLowerCase() : "";
                if (slot.contains("morning")) {
                    morningDeliveries++;
                } else if (slot.contains("evening")) {
                    eveningDeliveries++;
                }

                if (o.getStatus() != OrderStatus.CANCELLED) {
                    for (OrderItem item : o.getItems()) {
                        if (item.getBusinessUnit() == BusinessUnit.DAIRY) {
                            BigDecimal itemSubtotal = item.getSubtotal() != null
                                    ? item.getSubtotal()
                                    : item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                            dairyRevenue = dairyRevenue.add(itemSubtotal);
                        }
                    }
                }
            }
        }

        long activeProducts = dairyProducts.stream().filter(Product::isActive).count();
        long totalStock = dairyProducts.stream()
                .mapToLong(p -> p.getStockQuantity() != null ? p.getStockQuantity() : 0)
                .sum();

        List<ProductResponseDto> lowStockProducts = dairyProducts.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 25)
                .map(ProductResponseDto::fromEntity)
                .collect(Collectors.toList());

        List<ProductResponseDto> productDtos = dairyProducts.stream()
                .map(ProductResponseDto::fromEntity)
                .collect(Collectors.toList());

        DairyDashboardDto dto = new DairyDashboardDto();
        dto.setDairyRevenue(dairyRevenue);
        dto.setTotalDairyOrders(dairyOrdersCount);
        dto.setActiveDairyProducts(activeProducts);
        dto.setTotalDairyStockUnits(totalStock);
        dto.setMorningDeliveries(morningDeliveries);
        dto.setEveningDeliveries(eveningDeliveries);
        dto.setStatusCounts(statusCounts);
        dto.setLowStockProducts(lowStockProducts);
        dto.setProducts(productDtos);

        return dto;
    }

    /**
     * Aggregates metrics specific to Rice division operations.
     */
    public RiceDashboardDto getRiceDashboard() {
        List<Product> riceProducts = productRepository.findByBusinessUnit(BusinessUnit.RICE);
        List<Order> allOrders = orderRepository.findAll();

        BigDecimal riceRevenue = BigDecimal.ZERO;
        long riceOrdersCount = 0;
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            statusCounts.put(st.name(), 0L);
        }

        for (Order o : allOrders) {
            boolean hasRice = o.getBusinessUnit() == BusinessUnit.RICE
                    || o.getBusinessUnit() == BusinessUnit.MIXED
                    || o.getItems().stream().anyMatch(i -> i.getBusinessUnit() == BusinessUnit.RICE);

            if (hasRice) {
                riceOrdersCount++;
                String stName = o.getStatus().name();
                statusCounts.put(stName, statusCounts.getOrDefault(stName, 0L) + 1);

                if (o.getStatus() != OrderStatus.CANCELLED) {
                    for (OrderItem item : o.getItems()) {
                        if (item.getBusinessUnit() == BusinessUnit.RICE) {
                            BigDecimal itemSubtotal = item.getSubtotal() != null
                                    ? item.getSubtotal()
                                    : item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                            riceRevenue = riceRevenue.add(itemSubtotal);
                        }
                    }
                }
            }
        }

        long activeProducts = riceProducts.stream().filter(Product::isActive).count();
        long totalStock = riceProducts.stream()
                .mapToLong(p -> p.getStockQuantity() != null ? p.getStockQuantity() : 0)
                .sum();

        Map<String, Long> bagBreakdown = new LinkedHashMap<>();
        for (Product p : riceProducts) {
            String unit = p.getUnit() != null ? p.getUnit() : "25kg Bag";
            bagBreakdown.put(unit, bagBreakdown.getOrDefault(unit, 0L) + (p.getStockQuantity() != null ? p.getStockQuantity() : 0));
        }

        List<ProductResponseDto> lowStockProducts = riceProducts.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 15)
                .map(ProductResponseDto::fromEntity)
                .collect(Collectors.toList());

        List<ProductResponseDto> productDtos = riceProducts.stream()
                .map(ProductResponseDto::fromEntity)
                .collect(Collectors.toList());

        RiceDashboardDto dto = new RiceDashboardDto();
        dto.setRiceRevenue(riceRevenue);
        dto.setTotalRiceOrders(riceOrdersCount);
        dto.setActiveRiceProducts(activeProducts);
        dto.setTotalRiceStockBags(totalStock);
        dto.setStatusCounts(statusCounts);
        dto.setBagBreakdown(bagBreakdown);
        dto.setLowStockProducts(lowStockProducts);
        dto.setProducts(productDtos);

        return dto;
    }
}
