package com.amrutha;

import com.amrutha.customer.Customer;
import com.amrutha.customer.CustomerRepository;
import com.amrutha.expense.Expense;
import com.amrutha.expense.ExpenseCategories;
import com.amrutha.expense.ExpenseRepository;
import com.amrutha.finance.FinancialReportService;
import com.amrutha.finance.dto.FinancialReportDto;
import com.amrutha.finance.dto.FinancialSummaryDto;
import com.amrutha.order.Order;
import com.amrutha.order.OrderRepository;
import com.amrutha.order.OrderStatus;
import com.amrutha.orderitem.OrderItem;
import com.amrutha.product.BusinessUnit;
import com.amrutha.product.Product;
import com.amrutha.product.ProductRepository;
import com.amrutha.purchase.Purchase;
import com.amrutha.purchase.PurchaseRepository;
import com.amrutha.security.AdminUser;
import com.amrutha.security.AdminUserRepository;
import com.amrutha.security.JwtTokenProvider;
import com.amrutha.security.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration and Unit tests for Amrutha Financial Management Module.
 * Verifies:
 * 1. Strict segregation between DAIRY and RICE finances.
 * 2. Dairy expenses never appear in Rice reports, and Rice expenses never appear in Dairy reports.
 * 3. Purchases recorded separately from operational expenses (COGS vs OPEX) avoiding double counting.
 * 4. Revenue calculation from completed orders and partitioning of mixed orders.
 * 5. Accurate accounting rules (Revenue, COGS, OPEX, Gross Profit, Net Operating Profit).
 * 6. Protection against displaying incomplete calculations as actual profit.
 * 7. Daily, Monthly, and Date Range reporting.
 * 8. API endpoints with role-based security.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
public class FinancialManagementTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FinancialReportService financialReportService;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String adminToken;
    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        // Clear transaction data for deterministic test execution
        orderRepository.deleteAll();
        expenseRepository.deleteAll();
        purchaseRepository.deleteAll();

        // Setup admin user & JWT
        AdminUser admin = adminUserRepository.findByUsername("admin")
                .orElseGet(() -> adminUserRepository.save(new AdminUser(
                        "admin",
                        passwordEncoder.encode("AmruthaAdmin@2026"),
                        "Master Admin",
                        Role.ROLE_ADMIN
                )));
        adminToken = jwtTokenProvider.generateToken(admin);

        // Setup customer
        testCustomer = customerRepository.findAll().stream().findFirst().orElseGet(() -> {
            Customer cust = new Customer("Test Customer", "+919876543210", "test@amrutha.com", "Test Colony", "Morning", BusinessUnit.DAIRY);
            return customerRepository.save(cust);
        });
    }

    @Test
    @DisplayName("Financial Segregation: Dairy expenses must NEVER appear in Rice reports and vice versa")
    void testStrictFinancialSegregation() {
        LocalDate reportDate = LocalDate.of(2026, 10, 18);

        // 1. Record Dairy expenses
        expenseRepository.save(new Expense(
                "Cattle Feed Silage", "Dairy fodder", ExpenseCategories.CATTLE_FEED,
                BusinessUnit.DAIRY, new BigDecimal("4500.00"), reportDate, "Supplier Agro"
        ));
        expenseRepository.save(new Expense(
                "Veterinary Inspection", "Animal health", ExpenseCategories.ANIMAL_CARE,
                BusinessUnit.DAIRY, new BigDecimal("1200.00"), reportDate, "Dr. Rao"
        ));
        expenseRepository.save(new Expense(
                "Milk Chiller Electricity", "Dairy power", ExpenseCategories.ELECTRICITY,
                BusinessUnit.DAIRY, new BigDecimal("2300.00"), reportDate, "APSPDCL"
        ));

        // 2. Record Rice expenses
        expenseRepository.save(new Expense(
                "Paddy Milling Charges", "Custom milling", ExpenseCategories.MILLING,
                BusinessUnit.RICE, new BigDecimal("6500.00"), reportDate, "Sri Lakshmi Mill"
        ));
        expenseRepository.save(new Expense(
                "Laminated Rice Bags", "Packaging", ExpenseCategories.PACKAGING,
                BusinessUnit.RICE, new BigDecimal("3200.00"), reportDate, "Polymers Ltd"
        ));
        expenseRepository.save(new Expense(
                "Godown Storage Rent", "Warehouse", ExpenseCategories.STORAGE,
                BusinessUnit.RICE, new BigDecimal("4000.00"), reportDate, "Warehouse Bay"
        ));

        // 3. Generate Daily Report
        FinancialReportDto report = financialReportService.getDailyReport(reportDate);

        assertNotNull(report);
        FinancialSummaryDto dairy = report.getDairy();
        FinancialSummaryDto rice = report.getRice();
        FinancialSummaryDto combined = report.getCombined();

        // 4. Verify Dairy figures (4500 + 1200 + 2300 = 8000.00)
        assertEquals(new BigDecimal("8000.00"), dairy.getOperatingExpenses());
        assertEquals(3, dairy.getExpensesCount());
        assertTrue(dairy.getExpensesByCategory().containsKey(ExpenseCategories.CATTLE_FEED));
        assertTrue(dairy.getExpensesByCategory().containsKey(ExpenseCategories.ANIMAL_CARE));
        assertTrue(dairy.getExpensesByCategory().containsKey(ExpenseCategories.ELECTRICITY));

        // CRITICAL CHECK: Assert that Rice expense categories NEVER appear in Dairy report
        assertFalse(dairy.getExpensesByCategory().containsKey(ExpenseCategories.MILLING), "Rice category MILLING must never appear in Dairy!");
        assertFalse(dairy.getExpensesByCategory().containsKey(ExpenseCategories.PACKAGING), "Rice category PACKAGING must never appear in Dairy!");
        assertFalse(dairy.getExpensesByCategory().containsKey(ExpenseCategories.STORAGE), "Rice category STORAGE must never appear in Dairy!");

        // 5. Verify Rice figures (6500 + 3200 + 4000 = 13700.00)
        assertEquals(new BigDecimal("13700.00"), rice.getOperatingExpenses());
        assertEquals(3, rice.getExpensesCount());
        assertTrue(rice.getExpensesByCategory().containsKey(ExpenseCategories.MILLING));
        assertTrue(rice.getExpensesByCategory().containsKey(ExpenseCategories.PACKAGING));
        assertTrue(rice.getExpensesByCategory().containsKey(ExpenseCategories.STORAGE));

        // CRITICAL CHECK: Assert that Dairy expense categories NEVER appear in Rice report
        assertFalse(rice.getExpensesByCategory().containsKey(ExpenseCategories.CATTLE_FEED), "Dairy category CATTLE_FEED must never appear in Rice!");
        assertFalse(rice.getExpensesByCategory().containsKey(ExpenseCategories.ANIMAL_CARE), "Dairy category ANIMAL_CARE must never appear in Rice!");

        // 6. Verify Combined figures (8000 + 13700 = 21700.00)
        assertEquals(new BigDecimal("21700.00"), combined.getOperatingExpenses());
        assertEquals(6, combined.getExpensesCount());
    }

    @Test
    @DisplayName("Purchases (COGS) are tracked separately from Operating Expenses to prevent double-counting")
    void testPurchasesSeparateFromExpenses() {
        LocalDate reportDate = LocalDate.of(2026, 10, 18);

        // Record Raw Milk Purchase (COGS)
        purchaseRepository.save(new Purchase(
                "PUR-DAIRY-001", "Farmer Krishna", BusinessUnit.DAIRY,
                "Farm Fresh Cow Milk Procurement", new BigDecimal("100.00"), "Litre",
                new BigDecimal("42.00"), new BigDecimal("4200.00"), reportDate, "Morning lot"
        ));

        // Record Dairy Operating Expense (OPEX)
        expenseRepository.save(new Expense(
                "Farm Labour", "Milking wages", ExpenseCategories.LABOUR,
                BusinessUnit.DAIRY, new BigDecimal("1500.00"), reportDate, "Voucher #10"
        ));

        FinancialReportDto report = financialReportService.getDailyReport(reportDate);
        FinancialSummaryDto dairy = report.getDairy();

        // Verify COGS and OPEX are strictly distinct
        assertEquals(new BigDecimal("4200.00"), dairy.getCogsPurchases(), "COGS must match raw material purchases");
        assertEquals(new BigDecimal("1500.00"), dairy.getOperatingExpenses(), "OPEX must strictly contain operational expenses");
        assertEquals(new BigDecimal("5700.00"), dairy.getTotalCosts(), "Total Costs = COGS + OPEX");
    }

    @Test
    @DisplayName("Accounting Rules: Revenue, Gross Profit, Net Operating Profit, and Margins")
    void testAccountingRulesAndProfitCalculations() {
        LocalDate reportDate = LocalDate.of(2026, 10, 18);

        // 1. Create a delivered Dairy order (Revenue = 10L @ ₹68 = ₹680.00)
        Order dairyOrder = new Order("ORD-TEST-001", testCustomer, BusinessUnit.DAIRY,
                new BigDecimal("680.00"), "Test Address", "Morning", reportDate, "Delivered Order");
        dairyOrder.setStatus(OrderStatus.DELIVERED);
        OrderItem item1 = new OrderItem(dairyOrder, null, "Pure Cow Milk", "Litre", BusinessUnit.DAIRY,
                new BigDecimal("68.00"), 10);
        dairyOrder.getItems().add(item1);
        orderRepository.save(dairyOrder);

        // 2. Dairy Raw Milk Purchase (COGS = ₹420.00)
        purchaseRepository.save(new Purchase(
                "PUR-TEST-001", "Farmer Krishna", BusinessUnit.DAIRY,
                "Cow Milk", new BigDecimal("10.00"), "Litre",
                new BigDecimal("42.00"), new BigDecimal("420.00"), reportDate, "Lot #1"
        ));

        // 3. Dairy Operating Expense (OPEX = ₹100.00)
        expenseRepository.save(new Expense(
                "Milk Transport Fuel", "Delivery van diesel", ExpenseCategories.TRANSPORT,
                BusinessUnit.DAIRY, new BigDecimal("100.00"), reportDate, "Fuel bill"
        ));

        FinancialReportDto report = financialReportService.getDailyReport(reportDate);
        FinancialSummaryDto dairy = report.getDairy();

        // Revenue = 680.00
        assertEquals(new BigDecimal("680.00"), dairy.getRevenue());
        // COGS = 420.00
        assertEquals(new BigDecimal("420.00"), dairy.getCogsPurchases());
        // Gross Profit = Revenue - COGS = 680.00 - 420.00 = 260.00
        assertEquals(new BigDecimal("260.00"), dairy.getGrossProfit());
        // Operating Expenses = 100.00
        assertEquals(new BigDecimal("100.00"), dairy.getOperatingExpenses());
        // Total Costs = COGS + OPEX = 420.00 + 100.00 = 520.00
        assertEquals(new BigDecimal("520.00"), dairy.getTotalCosts());
        // Net Operating Profit = Gross Profit - OPEX = 260.00 - 100.00 = 160.00
        assertEquals(new BigDecimal("160.00"), dairy.getNetProfit());

        // Calculation is complete
        assertTrue(dairy.isCalculationComplete());
        // Gross Margin = (260 / 680) * 100 = 38.24%
        assertEquals(new BigDecimal("38.24"), dairy.getGrossMarginPercent());
        // Net Margin = (160 / 680) * 100 = 23.53%
        assertEquals(new BigDecimal("23.53"), dairy.getNetMarginPercent());
    }

    @Test
    @DisplayName("Incomplete Calculation Protection: When Revenue is Zero, profit is not falsely reported")
    void testIncompleteCalculationProtectionWhenZeroRevenue() {
        LocalDate reportDate = LocalDate.of(2026, 10, 18);

        // Only expenses, no completed sales
        expenseRepository.save(new Expense(
                "Paddy Hulling", "Milling fee", ExpenseCategories.MILLING,
                BusinessUnit.RICE, new BigDecimal("3500.00"), reportDate, "Mill"
        ));

        FinancialReportDto report = financialReportService.getDailyReport(reportDate);
        FinancialSummaryDto rice = report.getRice();

        assertEquals(BigDecimal.ZERO, rice.getRevenue());
        assertEquals(new BigDecimal("3500.00"), rice.getOperatingExpenses());
        // Net Profit shows loss (-3500.00)
        assertEquals(new BigDecimal("-3500.00"), rice.getNetProfit());

        // MUST be flagged incomplete to avoid misleading users
        assertFalse(rice.isCalculationComplete(), "Report must be flagged incomplete when no sales revenue is present");
        assertNull(rice.getGrossMarginPercent(), "Gross margin must be withheld when revenue is zero");
        assertNull(rice.getNetMarginPercent(), "Net margin must be withheld when revenue is zero");
        assertTrue(rice.getStatusMessage().contains("Incomplete"));
    }

    @Test
    @DisplayName("Mixed Order Revenue Partitioning: Line items are partitioned to correct business unit")
    void testMixedOrderPartitioning() {
        LocalDate reportDate = LocalDate.of(2026, 10, 18);

        // Order contains both Dairy and Rice items
        Order mixedOrder = new Order("ORD-MIXED-001", testCustomer, null,
                new BigDecimal("2130.00"), "Apartment 101", "Morning", reportDate, "Combined order");
        mixedOrder.setStatus(OrderStatus.DELIVERED);

        // Dairy Item: 10L Cow milk = ₹680.00
        OrderItem dairyItem = new OrderItem(mixedOrder, null, "Pure Cow Milk", "Litre", BusinessUnit.DAIRY,
                new BigDecimal("68.00"), 10);

        // Rice Item: 1 Bag Sona Masoori = ₹1450.00
        OrderItem riceItem = new OrderItem(mixedOrder, null, "Amrutha Sona Masoori", "25kg Bag", BusinessUnit.RICE,
                new BigDecimal("1450.00"), 1);

        mixedOrder.getItems().add(dairyItem);
        mixedOrder.getItems().add(riceItem);
        orderRepository.save(mixedOrder);

        FinancialReportDto report = financialReportService.getDailyReport(reportDate);

        // Verify Dairy received exactly ₹680.00
        assertEquals(new BigDecimal("680.00"), report.getDairy().getRevenue());
        // Verify Rice received exactly ₹1450.00
        assertEquals(new BigDecimal("1450.00"), report.getRice().getRevenue());
        // Verify Combined received exactly ₹2130.00
        assertEquals(new BigDecimal("2130.00"), report.getCombined().getRevenue());
    }

    @Test
    @DisplayName("Cancelled orders do NOT count towards sales revenue")
    void testCancelledOrdersExcludedFromRevenue() {
        LocalDate reportDate = LocalDate.of(2026, 10, 18);

        Order cancelledOrder = new Order("ORD-CANCEL-001", testCustomer, BusinessUnit.DAIRY,
                new BigDecimal("800.00"), "Cancelled Address", "Morning", reportDate, "Cancelled order");
        cancelledOrder.setStatus(OrderStatus.CANCELLED);
        OrderItem item = new OrderItem(cancelledOrder, null, "Buffalo Milk", "Litre", BusinessUnit.DAIRY,
                new BigDecimal("80.00"), 10);
        cancelledOrder.getItems().add(item);
        orderRepository.save(cancelledOrder);

        FinancialReportDto report = financialReportService.getDailyReport(reportDate);
        assertEquals(BigDecimal.ZERO, report.getDairy().getRevenue(), "Cancelled orders must produce zero revenue");
    }

    @Test
    @DisplayName("Monthly Report Filters: Aggregates full month data accurately")
    void testMonthlyReport() {
        // Record expenses across different days in October 2026
        expenseRepository.save(new Expense(
                "Dairy Feed Day 1", "Silage", ExpenseCategories.CATTLE_FEED,
                BusinessUnit.DAIRY, new BigDecimal("2000.00"), LocalDate.of(2026, 10, 1), "Day 1"
        ));
        expenseRepository.save(new Expense(
                "Dairy Feed Day 15", "Silage", ExpenseCategories.CATTLE_FEED,
                BusinessUnit.DAIRY, new BigDecimal("3000.00"), LocalDate.of(2026, 10, 15), "Day 15"
        ));
        // Expense in November (should NOT be included in October report)
        expenseRepository.save(new Expense(
                "Dairy Feed Nov", "Silage", ExpenseCategories.CATTLE_FEED,
                BusinessUnit.DAIRY, new BigDecimal("5000.00"), LocalDate.of(2026, 11, 1), "Nov 1"
        ));

        FinancialReportDto octReport = financialReportService.getMonthlyReport(2026, 10);
        assertEquals("MONTHLY", octReport.getPeriodType());
        assertEquals(LocalDate.of(2026, 10, 1), octReport.getStartDate());
        assertEquals(LocalDate.of(2026, 10, 31), octReport.getEndDate());
        // October Dairy OPEX must be 2000 + 3000 = 5000.00
        assertEquals(new BigDecimal("5000.00"), octReport.getDairy().getOperatingExpenses());
    }

    @Test
    @DisplayName("Admin REST API: Record new expense via POST /api/admin/expenses")
    void testRecordExpenseViaRestApi() throws Exception {
        Map<String, Object> expensePayload = Map.of(
                "expenseDate", "2026-10-18",
                "category", ExpenseCategories.CATTLE_FEED,
                "description", "Organic Cattle Feed Supplement 50kg Bags",
                "amount", 4200.00,
                "businessUnit", "DAIRY",
                "notes", "Direct agro mill purchase"
        );

        mockMvc.perform(post("/api/admin/expenses")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expensePayload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.category", is(ExpenseCategories.CATTLE_FEED)))
                .andExpect(jsonPath("$.data.amount", is(4200.0)))
                .andExpect(jsonPath("$.data.businessUnit", is("DAIRY")));
    }

    @Test
    @DisplayName("Admin REST API: Record raw material purchase via POST /api/admin/purchases")
    void testRecordPurchaseViaRestApi() throws Exception {
        Map<String, Object> purchasePayload = Map.of(
                "supplierName", "Farmer Venkata Reddy",
                "businessUnit", "DAIRY",
                "itemDescription", "Morning Buffalo Milk (7.5% Fat)",
                "quantity", 200.0,
                "unit", "Litre",
                "unitRate", 52.0,
                "purchaseDate", "2026-10-18",
                "notes", "Morning chilling batch"
        );

        mockMvc.perform(post("/api/admin/purchases")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(purchasePayload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.supplierName", is("Farmer Venkata Reddy")))
                .andExpect(jsonPath("$.data.totalCost", is(10400.0))) // 200 * 52 = 10400.00
                .andExpect(jsonPath("$.data.purchaseNumber", startsWith("PUR-")));
    }

    @Test
    @DisplayName("Admin REST API: Financial Report endpoint /api/admin/finance/daily returns segregated statement")
    void testGetDailyReportRestApi() throws Exception {
        mockMvc.perform(get("/api/admin/finance/daily?date=2026-10-18")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.dairy.businessUnit", is("DAIRY")))
                .andExpect(jsonPath("$.data.rice.businessUnit", is("RICE")))
                .andExpect(jsonPath("$.data.combined.businessUnit", is("COMBINED")))
                .andExpect(jsonPath("$.data.accountingRules", containsString("ACCOUNTING RULES:")));
    }

    @Test
    @DisplayName("Security: Unauthenticated request to /api/admin/finance is rejected with 401")
    void testUnauthorizedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/admin/finance/daily"))
                .andExpect(status().isUnauthorized());
    }
}
