package com.amrutha.order.dto;

import com.amrutha.orderitem.OrderItem;
import com.amrutha.product.BusinessUnit;

import java.math.BigDecimal;

/**
 * Line item data returned in order responses.
 */
public class OrderItemResponseDto {

    private Long id;
    private Long productId;
    private String productName;
    private String unit;
    private BusinessUnit businessUnit;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal subtotal;

    public OrderItemResponseDto() {
    }

    public static OrderItemResponseDto fromEntity(OrderItem item) {
        if (item == null) return null;
        OrderItemResponseDto dto = new OrderItemResponseDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        dto.setProductName(item.getProductName());
        dto.setUnit(item.getUnit());
        dto.setBusinessUnit(item.getBusinessUnit());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BusinessUnit getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(BusinessUnit businessUnit) {
        this.businessUnit = businessUnit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
