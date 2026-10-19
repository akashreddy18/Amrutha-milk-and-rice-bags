package com.amrutha.finance;

import com.amrutha.expense.Expense;
import com.amrutha.expense.ExpenseRepository;
import com.amrutha.finance.dto.FinancialReportDto;
import com.amrutha.finance.dto.FinancialSummaryDto;
import com.amrutha.order.Order;
import com.amrutha.order.OrderRepository;
import com.amrutha.order.OrderStatus;
import com.amrutha.orderitem.OrderItem;
import com.amrutha.product.BusinessUnit;
import com.amrutha.purchase.Purchase;
import com.amrutha.purchase.PurchaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Service generating segregated and combined financial reports for Amrutha.
 * 
 * ACCOUNTING RULES:
 * 1. REVENUE: Recognized strictly from completed/active sales (excluding CANCELLED orders).
 *    Mixed order line items are partitioned to Dairy or Rice based on item product business unit.
 * 2. COST OF GOODS SOLD (COGS): Direct raw material purchases incurred in the period
 *    (Raw milk procurement for Dairy, Raw paddy/milled rice for Rice). Recorded in Purchases
 *    to avoid double-counting with operational expenses.
 * 3. OPERATING EXPENSES (OPEX): Operational expenses incurred in the period
 *    (Labour, transport, electricity, animal care, cattle feed, milling, packaging, etc.).
 * 4. GROSS PROFIT = Revenue - COGS.
 * 5. NET OPERATING PROFIT = Gross Profit - Operating Expenses = Revenue - (COGS + OPEX).
 * 6. PROFIT INTEGRITY: If Revenue is zero, calculations are flagged as incomplete and profit margins
 *    are withheld to avoid misleading business metrics.
 */
@Service
@Transactional(readOnly = true)
public class FinancialReportService {

    public static final String ACCOUNTING_RULES_DOC =
            "ACCOUNTING RULES: (1) Revenue is recognized from non-cancelled customer orders; line items are attributed strictly to Dairy or Rice. " +
            "(2) COGS consists of direct raw material purchases (raw milk procurement for Dairy, raw paddy for Rice). " +
            "(3) OPEX consists of operational expenses (Labour, Transport, Electricity, Cattle feed, Animal care, Milling, Packaging, Storage). " +
            "(4) Gross Profit = Revenue - COGS. (5) Net Operating Profit = Gross Profit - OPEX. " +
            "(6) Incomplete calculations are not presented as actual profit when revenue is zero.";

    private final OrderRepository orderRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;

    public FinancialReportService(OrderRepository orderRepository,
                                  PurchaseRepository purchaseRepository,
                                  ExpenseRepository expenseRepository) {
        this.orderRepository = orderRepository;
        this.purchaseRepository = purchaseRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Generates a daily financial report for a specific date.
     */
    public FinancialReportDto getDailyReport(LocalDate date) {
        LocalDate reportDate = (date != null) ? date : LocalDate.now();
        return generateReport("DAILY", reportDate, reportDate);
    }

    /**
     * Generates a monthly financial report for a specific year and month.
     */
    public FinancialReportDto getMonthlyReport(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        return generateReport("MONTHLY", start, end);
    }

    /**
     * Generates a custom date-range financial report.
     */
    public FinancialReportDto getDateRangeReport(LocalDate startDate, LocalDate endDate) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        if (start.isAfter(end)) {
            LocalDate temp = start;
            start = end;
            end = temp;
        }
        return generateReport("CUSTOM_RANGE", start, end);
    }

    /**
     * Internal report generator calculating Dairy, Rice, and Combined statements.
     */
    private FinancialReportDto generateReport(String periodType, LocalDate startDate, LocalDate endDate) {
        // 1. Fetch Orders in range (non-cancelled)
        List<Order> orders = orderRepository.findOrdersForFinancialReport(
                startDate, endDate, startDate.atStartOfDay(), endDate.atTime(java.time.LocalTime.MAX));

        BigDecimal dairyRevenue = BigDecimal.ZERO;
        BigDecimal riceRevenue = BigDecimal.ZERO;
        long dairyOrdersCount = 0;
        long riceOrdersCount = 0;
        long completedOrdersTotal = 0;

        for (Order o : orders) {
            if (o.getStatus() != OrderStatus.CANCELLED) {
                completedOrdersTotal++;
                boolean hasDairyItem = false;
                boolean hasRiceItem = false;

                for (OrderItem item : o.getItems()) {
                    BigDecimal subtotal = item.getSubtotal() != null
                            ? item.getSubtotal()
                            : item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

                    if (item.getBusinessUnit() == BusinessUnit.DAIRY) {
                        dairyRevenue = dairyRevenue.add(subtotal);
                        hasDairyItem = true;
                    } else if (item.getBusinessUnit() == BusinessUnit.RICE) {
                        riceRevenue = riceRevenue.add(subtotal);
                        hasRiceItem = true;
                    }
                }

                if (hasDairyItem) dairyOrdersCount++;
                if (hasRiceItem) riceOrdersCount++;
            }
        }

        // 2. Fetch Purchases (COGS) segregated by Business Unit
        List<Purchase> dairyPurchases = purchaseRepository.findByBusinessUnitAndPurchaseDateBetween(BusinessUnit.DAIRY, startDate, endDate);
        List<Purchase> ricePurchases = purchaseRepository.findByBusinessUnitAndPurchaseDateBetween(BusinessUnit.RICE, startDate, endDate);

        BigDecimal dairyCogs = dairyPurchases.stream()
                .map(Purchase::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal riceCogs = ricePurchases.stream()
                .map(Purchase::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Fetch Operating Expenses segregated by Business Unit
        List<Expense> dairyExpenses = expenseRepository.findByBusinessUnitAndExpenseDateBetween(BusinessUnit.DAIRY, startDate, endDate);
        List<Expense> riceExpenses = expenseRepository.findByBusinessUnitAndExpenseDateBetween(BusinessUnit.RICE, startDate, endDate);

        BigDecimal dairyOpex = BigDecimal.ZERO;
        Map<String, BigDecimal> dairyExpensesByCategory = new LinkedHashMap<>();
        for (Expense e : dairyExpenses) {
            BigDecimal amt = e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO;
            dairyOpex = dairyOpex.add(amt);
            String cat = e.getCategory() != null ? e.getCategory() : "Other";
            dairyExpensesByCategory.put(cat, dairyExpensesByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
        }

        BigDecimal riceOpex = BigDecimal.ZERO;
        Map<String, BigDecimal> riceExpensesByCategory = new LinkedHashMap<>();
        for (Expense e : riceExpenses) {
            BigDecimal amt = e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO;
            riceOpex = riceOpex.add(amt);
            String cat = e.getCategory() != null ? e.getCategory() : "Other";
            riceExpensesByCategory.put(cat, riceExpensesByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
        }

        // 4. Build Divisional Summaries
        FinancialSummaryDto dairySummary = buildSummary(
                "DAIRY",
                dairyRevenue,
                dairyCogs,
                dairyOpex,
                dairyOrdersCount,
                dairyPurchases.size(),
                dairyExpenses.size(),
                dairyExpensesByCategory
        );

        FinancialSummaryDto riceSummary = buildSummary(
                "RICE",
                riceRevenue,
                riceCogs,
                riceOpex,
                riceOrdersCount,
                ricePurchases.size(),
                riceExpenses.size(),
                riceExpensesByCategory
        );

        // 5. Build Combined Summary
        Map<String, BigDecimal> combinedExpensesByCategory = new LinkedHashMap<>();
        dairyExpensesByCategory.forEach((k, v) -> combinedExpensesByCategory.put("Dairy: " + k, v));
        riceExpensesByCategory.forEach((k, v) -> combinedExpensesByCategory.put("Rice: " + k, v));

        FinancialSummaryDto combinedSummary = buildSummary(
                "COMBINED",
                dairyRevenue.add(riceRevenue),
                dairyCogs.add(riceCogs),
                dairyOpex.add(riceOpex),
                completedOrdersTotal,
                dairyPurchases.size() + ricePurchases.size(),
                dairyExpenses.size() + riceExpenses.size(),
                combinedExpensesByCategory
        );

        return new FinancialReportDto(
                periodType,
                startDate,
                endDate,
                ACCOUNTING_RULES_DOC,
                dairySummary,
                riceSummary,
                combinedSummary
        );
    }

    /**
     * Computes financial statement figures adhering to accounting rules.
     */
    private FinancialSummaryDto buildSummary(String buName,
                                             BigDecimal revenue,
                                             BigDecimal cogs,
                                             BigDecimal opex,
                                             long orderCount,
                                             long purchaseCount,
                                             long expenseCount,
                                             Map<String, BigDecimal> expensesByCategory) {
        FinancialSummaryDto dto = new FinancialSummaryDto(buName);
        dto.setRevenue(revenue);
        dto.setCogsPurchases(cogs);
        dto.setOperatingExpenses(opex);

        BigDecimal totalCosts = cogs.add(opex);
        dto.setTotalCosts(totalCosts);

        BigDecimal grossProfit = revenue.subtract(cogs);
        dto.setGrossProfit(grossProfit);

        BigDecimal netProfit = revenue.subtract(totalCosts);
        dto.setNetProfit(netProfit);

        dto.setCompletedOrdersCount(orderCount);
        dto.setPurchasesCount(purchaseCount);
        dto.setExpensesCount(expenseCount);
        dto.setExpensesByCategory(expensesByCategory);

        // Accounting Rule: Do not display incomplete calculations as actual profit.
        if (revenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal grossMargin = grossProfit.multiply(BigDecimal.valueOf(100))
                    .divide(revenue, 2, RoundingMode.HALF_UP);
            BigDecimal netMargin = netProfit.multiply(BigDecimal.valueOf(100))
                    .divide(revenue, 2, RoundingMode.HALF_UP);

            dto.setGrossMarginPercent(grossMargin);
            dto.setNetMarginPercent(netMargin);
            dto.setCalculationComplete(true);
            dto.setStatusMessage("Complete financial statement calculated.");
        } else {
            dto.setGrossMarginPercent(null);
            dto.setNetMarginPercent(null);
            dto.setCalculationComplete(false);
            dto.setStatusMessage("Incomplete: No sales revenue recorded in this period. Costs are tracked, but profit calculations are withheld to prevent misleading profit reporting.");
        }

        return dto;
    }
}
