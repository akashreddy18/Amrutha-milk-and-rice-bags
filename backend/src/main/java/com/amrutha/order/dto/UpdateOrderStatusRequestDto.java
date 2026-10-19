package com.amrutha.order.dto;

import com.amrutha.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Payload for updating an order's delivery/fulfillment status.
 */
public class UpdateOrderStatusRequestDto {

    @NotNull(message = "Order status is required")
    private OrderStatus status;

    public UpdateOrderStatusRequestDto() {
    }

    public UpdateOrderStatusRequestDto(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
