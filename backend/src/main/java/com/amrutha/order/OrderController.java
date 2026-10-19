package com.amrutha.order;

import com.amrutha.common.ApiResponse;
import com.amrutha.order.dto.CreateOrderRequestDto;
import com.amrutha.order.dto.OrderResponseDto;
import com.amrutha.product.BusinessUnit;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Order operations.
 * Base Path: /api/orders
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/orders
     * Places a customer order.
     * Validates product availability and stock, computes totals on server,
     * updates stock transactionally, and generates unique orderNumber.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDto>> createOrder(
            @Valid @RequestBody CreateOrderRequestDto request) {

        OrderResponseDto order = orderService.createOrder(request);
        return new ResponseEntity<>(
                ApiResponse.created("Order placed successfully! Order Number: " + order.getOrderNumber(), order),
                HttpStatus.CREATED
        );
    }

    /**
     * GET /api/orders
     * Retrieves all orders, optionally filtered by BusinessUnit (DAIRY, RICE, MIXED) and/or Status.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getOrders(
            @RequestParam(required = false) BusinessUnit businessUnit,
            @RequestParam(required = false) OrderStatus status) {

        List<OrderResponseDto> orders = orderService.getOrders(businessUnit, status);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved " + orders.size() + " orders", orders));
    }

    /**
     * GET /api/orders/{id}
     * Retrieves an order by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderById(@PathVariable Long id) {
        OrderResponseDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok("Order retrieved successfully", order));
    }

    /**
     * GET /api/orders/number/{orderNumber}
     * Retrieves an order by unique order number.
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderByNumber(@PathVariable String orderNumber) {
        OrderResponseDto order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok("Order retrieved successfully", order));
    }

    /**
     * PATCH /api/orders/{id}/status
     * Updates an order status (e.g. PACKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponseDto>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        OrderResponseDto updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated to " + status, updated));
    }
}
