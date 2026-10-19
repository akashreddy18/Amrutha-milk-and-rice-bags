package com.amrutha.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request payload for creating a customer order.
 * Customer info and items are validated server-side.
 */
public class CreateOrderRequestDto {

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 120, message = "Customer name must be between 2 and 120 characters")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{10,20}$", message = "Valid phone number (at least 10 digits) is required")
    private String customerPhone;

    @NotBlank(message = "Delivery address is required")
    @Size(min = 5, max = 500, message = "Delivery address must be between 5 and 500 characters")
    private String deliveryAddress;

    @Size(max = 100, message = "Delivery slot cannot exceed 100 characters")
    private String deliverySlot;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequestDto> items;

    public CreateOrderRequestDto() {
    }

    public CreateOrderRequestDto(String customerName, String customerPhone, String deliveryAddress,
                                 String deliverySlot, String notes, List<OrderItemRequestDto> items) {
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.deliveryAddress = deliveryAddress;
        this.deliverySlot = deliverySlot;
        this.notes = notes;
        this.items = items;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getDeliverySlot() {
        return deliverySlot;
    }

    public void setDeliverySlot(String deliverySlot) {
        this.deliverySlot = deliverySlot;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<OrderItemRequestDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequestDto> items) {
        this.items = items;
    }
}
