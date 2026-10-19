package com.amrutha;

import com.amrutha.common.BadRequestException;
import com.amrutha.order.OrderService;
import com.amrutha.order.OrderStatus;
import com.amrutha.order.dto.CreateOrderRequestDto;
import com.amrutha.order.dto.OrderItemRequestDto;
import com.amrutha.order.dto.OrderResponseDto;
import com.amrutha.product.BusinessUnit;
import com.amrutha.product.ProductService;
import com.amrutha.product.dto.ProductRequestDto;
import com.amrutha.product.dto.ProductResponseDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class AmruthaApplicationTests {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Test
    void contextLoads() {
        assertNotNull(productService, "ProductService should be injected properly");
        assertNotNull(orderService, "OrderService should be injected properly");
    }

    @Test
    @DisplayName("Should list seeded active products")
    void testGetActiveProducts() {
        List<ProductResponseDto> products = productService.getActiveProducts(null);
        assertNotNull(products);
        assertFalse(products.isEmpty(), "Should contain seeded products");
    }

    @Test
    @DisplayName("Should filter active products by BusinessUnit DAIRY")
    void testFilterDairyProducts() {
        List<ProductResponseDto> dairyList = productService.getActiveProducts(BusinessUnit.DAIRY);
        assertNotNull(dairyList);
        for (ProductResponseDto p : dairyList) {
            assertEquals(BusinessUnit.DAIRY, p.getBusinessUnit());
        }
    }

    @Test
    @DisplayName("Should filter active products by BusinessUnit RICE")
    void testFilterRiceProducts() {
        List<ProductResponseDto> riceList = productService.getActiveProducts(BusinessUnit.RICE);
        assertNotNull(riceList);
        for (ProductResponseDto p : riceList) {
            assertEquals(BusinessUnit.RICE, p.getBusinessUnit());
        }
    }

    @Test
    @DisplayName("Should add, edit, and deactivate a product")
    void testAddEditDeactivateProduct() {
        // 1. Add
        ProductRequestDto newProduct = new ProductRequestDto();
        newProduct.setName("Desi Bilona Cow Ghee");
        newProduct.setLocalName("(దేశీ ఆవు నెయ్యి)");
        newProduct.setDescription("Pure traditional bilona churned ghee from grass-fed cow milk.");
        newProduct.setBusinessUnit(BusinessUnit.DAIRY);
        newProduct.setPrice(new BigDecimal("650.00"));
        newProduct.setUnit("500ml");
        newProduct.setCategory("Ghee");
        newProduct.setBadge("Traditional Bilona");
        newProduct.setStockQuantity(50);

        ProductResponseDto created = productService.addProduct(newProduct);
        assertNotNull(created.getId());
        assertEquals("Desi Bilona Cow Ghee", created.getName());
        assertTrue(created.isActive());

        // 2. Edit
        newProduct.setPrice(new BigDecimal("680.00"));
        ProductResponseDto updated = productService.updateProduct(created.getId(), newProduct);
        assertEquals(new BigDecimal("680.00"), updated.getPrice());

        // 3. Deactivate
        ProductResponseDto deactivated = productService.deactivateProduct(created.getId());
        assertFalse(deactivated.isActive());

        // 4. Verify deactivated item is not in active products
        List<ProductResponseDto> activeList = productService.getActiveProducts(BusinessUnit.DAIRY);
        boolean stillPresent = activeList.stream().anyMatch(p -> p.getId().equals(created.getId()));
        assertFalse(stillPresent, "Deactivated product should not be in active list");
    }

    @Test
    @DisplayName("Should create order with server-calculated total and safely deduct stock")
    void testCreateOrder_CalculatesTotalAndDeductsStock() {
        // Fetch existing cow milk (₹68) and sona masoori rice (₹1450)
        List<ProductResponseDto> dairyList = productService.getActiveProducts(BusinessUnit.DAIRY);
        List<ProductResponseDto> riceList = productService.getActiveProducts(BusinessUnit.RICE);
        ProductResponseDto cowMilk = dairyList.get(0);
        ProductResponseDto sonaMasoori = riceList.get(0);

        int initialMilkStock = cowMilk.getStockQuantity();
        int initialRiceStock = sonaMasoori.getStockQuantity();

        int orderMilkQty = 2; // 2 * 68 = 136
        int orderRiceQty = 1; // 1 * 1450 = 1450
        BigDecimal expectedTotal = cowMilk.getPrice().multiply(BigDecimal.valueOf(orderMilkQty))
                .add(sonaMasoori.getPrice().multiply(BigDecimal.valueOf(orderRiceQty)));

        CreateOrderRequestDto request = new CreateOrderRequestDto(
                "Suresh Reddy",
                "+919848011223",
                "House No 4-50, Gandhi Road, Market Center",
                "Morning (5:30 AM – 7:30 AM)",
                "Leave at doorstep",
                List.of(
                        new OrderItemRequestDto(cowMilk.getId(), orderMilkQty),
                        new OrderItemRequestDto(sonaMasoori.getId(), orderRiceQty)
                )
        );

        OrderResponseDto order = orderService.createOrder(request);

        // Assert order created
        assertNotNull(order.getId());
        assertTrue(order.getOrderNumber().startsWith("ORD-"), "Order number must follow standard prefix");
        assertEquals("Suresh Reddy", order.getCustomerName());
        assertEquals("+919848011223", order.getCustomerPhone());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        assertEquals(BusinessUnit.MIXED, order.getBusinessUnit(), "Order with Dairy & Rice must be marked MIXED");

        // Assert Server-Side Calculation (never trusting browser)
        assertEquals(expectedTotal, order.getTotalAmount(), "Total must be calculated strictly on server");
        assertEquals(2, order.getItems().size());

        // Assert Stock Deduction
        ProductResponseDto updatedMilk = productService.getProductById(cowMilk.getId());
        ProductResponseDto updatedRice = productService.getProductById(sonaMasoori.getId());
        assertEquals(initialMilkStock - orderMilkQty, updatedMilk.getStockQuantity());
        assertEquals(initialRiceStock - orderRiceQty, updatedRice.getStockQuantity());
    }

    @Test
    @DisplayName("Should prevent order when requested quantity exceeds available stock")
    void testCreateOrder_RejectsInsufficientStock() {
        List<ProductResponseDto> dairyList = productService.getActiveProducts(BusinessUnit.DAIRY);
        ProductResponseDto product = dairyList.get(0);

        CreateOrderRequestDto request = new CreateOrderRequestDto(
                "Priya Sharma",
                "+919848099887",
                "Apartment 101, Main Road",
                "Morning",
                "Bulk test",
                List.of(new OrderItemRequestDto(product.getId(), 999999)) // Exceeds available stock
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> orderService.createOrder(request));
        assertTrue(ex.getMessage().contains("Insufficient stock"));
    }

    @Test
    @DisplayName("Should prevent order for inactive products")
    void testCreateOrder_RejectsInactiveProduct() {
        // Create and immediately deactivate a product
        ProductRequestDto tempDto = new ProductRequestDto();
        tempDto.setName("Seasonal Sweet Lassi");
        tempDto.setBusinessUnit(BusinessUnit.DAIRY);
        tempDto.setPrice(new BigDecimal("40.00"));
        tempDto.setUnit("300ml");
        tempDto.setStockQuantity(20);

        ProductResponseDto created = productService.addProduct(tempDto);
        productService.deactivateProduct(created.getId());

        CreateOrderRequestDto request = new CreateOrderRequestDto(
                "Anita Rao",
                "+919848055443",
                "Door 3-1, Temple Street",
                "Evening",
                null,
                List.of(new OrderItemRequestDto(created.getId(), 2))
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> orderService.createOrder(request));
        assertTrue(ex.getMessage().contains("inactive and cannot be ordered"));
    }

    @Test
    @DisplayName("Should safely restore stock when order is cancelled")
    void testCancelOrder_RestoresStock() {
        List<ProductResponseDto> dairyList = productService.getActiveProducts(BusinessUnit.DAIRY);
        ProductResponseDto cowMilk = dairyList.get(0);
        int initialStock = cowMilk.getStockQuantity();

        CreateOrderRequestDto request = new CreateOrderRequestDto(
                "Kalyan Kumar",
                "+919848022334",
                "Bypass Road, Depot Area",
                "Morning",
                null,
                List.of(new OrderItemRequestDto(cowMilk.getId(), 5))
        );

        OrderResponseDto created = orderService.createOrder(request);
        assertEquals(initialStock - 5, productService.getProductById(cowMilk.getId()).getStockQuantity());

        // Cancel order
        OrderResponseDto cancelled = orderService.updateOrderStatus(created.getId(), OrderStatus.CANCELLED);
        assertEquals(OrderStatus.CANCELLED, cancelled.getStatus());

        // Verify stock is restored
        assertEquals(initialStock, productService.getProductById(cowMilk.getId()).getStockQuantity());
    }
}
