package com.amrutha;

import com.amrutha.product.BusinessUnit;
import com.amrutha.product.Product;
import com.amrutha.product.ProductRepository;
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
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
public class AdminSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ProductRepository productRepository;

    private String validAdminToken;

    @BeforeEach
    void setUp() {
        // Ensure test admin exists
        AdminUser admin = adminUserRepository.findByUsername("admin")
                .orElseGet(() -> adminUserRepository.save(new AdminUser(
                        "admin",
                        passwordEncoder.encode("AmruthaAdmin@2026"),
                        "Master Admin",
                        Role.ROLE_ADMIN
                )));

        validAdminToken = jwtTokenProvider.generateToken(admin);
    }

    @Test
    @DisplayName("SECURITY: Admin endpoints must strictly reject unauthenticated requests with 401")
    void testUnauthorizedAccessToAdminEndpoints_Returns401() throws Exception {
        // Overview Dashboard without token -> 401
        mockMvc.perform(get("/api/admin/dashboard/overview"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Unauthorized")));

        // Dairy Dashboard without token -> 401
        mockMvc.perform(get("/api/admin/dashboard/dairy"))
                .andExpect(status().isUnauthorized());

        // Rice Dashboard without token -> 401
        mockMvc.perform(get("/api/admin/dashboard/rice"))
                .andExpect(status().isUnauthorized());

        // Products Admin list without token -> 401
        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isUnauthorized());

        // Orders Admin list without token -> 401
        mockMvc.perform(get("/api/admin/orders"))
                .andExpect(status().isUnauthorized());

        // Stock modification without token -> 401
        mockMvc.perform(patch("/api/admin/products/1/stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stockQuantity\":50}"))
                .andExpect(status().isUnauthorized());

        // Order status change without token -> 401
        mockMvc.perform(patch("/api/admin/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DELIVERED\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("SECURITY: Customer storefront catalog must remain publicly accessible without credentials")
    void testCustomerPublicEndpoints_SucceedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/products/business-unit/DAIRY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/products/business-unit/RICE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("AUTH: Login with wrong password must return 401 Unauthorized")
    void testAdminLogin_InvalidCredentials_Returns401() throws Exception {
        Map<String, String> badLogin = Map.of(
                "username", "admin",
                "password", "WrongPassword123!"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Invalid username or password")));
    }

    @Test
    @DisplayName("AUTH: Login with valid credentials returns 200 and signed JWT token")
    void testAdminLogin_ValidCredentials_Returns200AndToken() throws Exception {
        Map<String, String> validLogin = Map.of(
                "username", "admin",
                "password", "AmruthaAdmin@2026"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("DASHBOARD: Authorized admin can fetch combined owner, dairy, and rice dashboards")
    void testAuthorizedAdminDashboards() throws Exception {
        // 1. Combined Owner Overview
        mockMvc.perform(get("/api/admin/dashboard/overview")
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRevenue").exists())
                .andExpect(jsonPath("$.data.ordersByStatus").exists());

        // 2. Dairy Division Dashboard
        mockMvc.perform(get("/api/admin/dashboard/dairy")
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalDairyStockUnits").isNumber());

        // 3. Rice Division Dashboard
        mockMvc.perform(get("/api/admin/dashboard/rice")
                        .header("Authorization", "Bearer " + validAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRiceStockBags").isNumber());
    }

    @Test
    @DisplayName("STOCK: Admin can update inventory stock quantity")
    void testAdminStockUpdate() throws Exception {
        Product product = productRepository.findAll().stream()
                .filter(p -> p.getBusinessUnit() == BusinessUnit.DAIRY)
                .findFirst()
                .orElseGet(() -> productRepository.save(new Product(
                        "Test Cow Milk", "(ఆవు పాలు)", "Pure milk", BusinessUnit.DAIRY,
                        new BigDecimal("68.00"), "Litre", "Milk", "Fresh", "img.jpg", 50
                )));

        Map<String, Integer> stockPayload = Map.of("stockQuantity", 145);

        mockMvc.perform(patch("/api/admin/products/" + product.getId() + "/stock")
                        .header("Authorization", "Bearer " + validAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stockPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stockQuantity").value(145));
    }
}
