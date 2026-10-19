package com.amrutha.customer.dto;

import com.amrutha.customer.Customer;
import com.amrutha.product.BusinessUnit;

import java.time.LocalDateTime;

/**
 * Response DTO for Customer entity.
 */
public class CustomerResponseDto {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String deliverySlot;
    private BusinessUnit preferredBusinessUnit;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CustomerResponseDto() {
    }

    public static CustomerResponseDto fromEntity(Customer customer) {
        if (customer == null) {
            return null;
        }
        CustomerResponseDto dto = new CustomerResponseDto();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());
        dto.setAddress(customer.getAddress());
        dto.setDeliverySlot(customer.getDeliverySlot());
        dto.setPreferredBusinessUnit(customer.getPreferredBusinessUnit());
        dto.setActive(customer.isActive());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setUpdatedAt(customer.getUpdatedAt());
        return dto;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDeliverySlot() {
        return deliverySlot;
    }

    public void setDeliverySlot(String deliverySlot) {
        this.deliverySlot = deliverySlot;
    }

    public BusinessUnit getPreferredBusinessUnit() {
        return preferredBusinessUnit;
    }

    public void setPreferredBusinessUnit(BusinessUnit preferredBusinessUnit) {
        this.preferredBusinessUnit = preferredBusinessUnit;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
