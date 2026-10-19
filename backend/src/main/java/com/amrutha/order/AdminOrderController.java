package com.amrutha.order;

import com.amrutha.common.ApiResponse;
import com.amrutha.order.dto.OrderResponseDto;
import com.amrutha.order.dto.UpdateOrderStatusRequestDto;
import com.amrutha.product.BusinessUnit;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Administrator Order & Fulfillment Operations.
 * Base Path: /api/admin/orders
 * Strictly restricted to authenticated users with administrative roles.
 */
@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * GET /api/admin/orders
     * Lists orders with optional filters for businessUnit and order status.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getOrders(
            @RequestParam(required = false) BusinessUnit businessUnit,
            @RequestParam(required = false) OrderStatus status) {

        List<OrderResponseDto> orders = orderService.getOrders(businessUnit, status);
        return ResponseEntity.ok(ApiResponse.ok("Orders loaded successfully (" + orders.size() + ")", orders));
    }

    /**
     * GET /api/admin/orders/{id}
     * Retrieves detailed order info including customer phone, address, and line items.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderById(@PathVariable Long id) {
        OrderResponseDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok("Order retrieved successfully", order));
    }

    /**
     * PATCH /api/admin/orders/{id}/status
     * Updates order fulfillment status (PENDING -> CONFIRMED -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED or CANCELLED).
     * If CANCELLED, stock is safely restored in the database transaction.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponseDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequestDto requestDto) {

        OrderResponseDto updated = orderService.updateOrderStatus(id, requestDto.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Order status updated to " + updated.getStatus(), updated));
    }
}
