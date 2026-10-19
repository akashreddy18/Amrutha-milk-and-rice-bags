package com.amrutha.customer;

import com.amrutha.product.BusinessUnit;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Customer Entity representing household and wholesale buyers of Amrutha Milk and Rice.
 */
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(length = 500)
    private String address;

    @Column(name = "delivery_slot", length = 100)
    private String deliverySlot; // e.g. "Morning (5:30 AM – 7:30 AM)", "Evening", "Anytime"

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_business_unit", length = 20)
    private BusinessUnit preferredBusinessUnit;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Customer() {
    }

    public Customer(String name, String phone, String email, String address, String deliverySlot, BusinessUnit preferredBusinessUnit) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.deliverySlot = deliverySlot;
        this.preferredBusinessUnit = preferredBusinessUnit;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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
