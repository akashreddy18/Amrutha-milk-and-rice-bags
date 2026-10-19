package com.amrutha.order;

/**
 * Lifecycle status of a customer order.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PACKED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
