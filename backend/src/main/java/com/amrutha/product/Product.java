package com.amrutha.product;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Product Entity representing items sold across Dairy and Rice business units.
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "local_name", length = 150)
    private String localName;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_unit", nullable = false, length = 20)
    private BusinessUnit businessUnit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 50)
    private String unit; // e.g. "Litre", "25kg Bag", "500g"

    @Column(length = 50)
    private String category; // e.g. "Milk", "Rice", "Ghee"

    @Column(length = 50)
    private String badge; // e.g. "100% Farm Fresh", "Aged 12-18 Months"

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 100;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Product() {
    }

    public Product(String name, String localName, String description, BusinessUnit businessUnit,
                   BigDecimal price, String unit, String category, String badge, String imageUrl) {
        this(name, localName, description, businessUnit, price, unit, category, badge, imageUrl, 100);
    }

    public Product(String name, String localName, String description, BusinessUnit businessUnit,
                   BigDecimal price, String unit, String category, String badge, String imageUrl,
                   Integer stockQuantity) {
        this.name = name;
        this.localName = localName;
        this.description = description;
        this.businessUnit = businessUnit;
        this.price = price;
        this.unit = unit;
        this.category = category;
        this.badge = badge;
        this.imageUrl = imageUrl;
        this.stockQuantity = stockQuantity != null ? stockQuantity : 100;
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

    public String getLocalName() {
        return localName;
    }

    public void setLocalName(String localName) {
        this.localName = localName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BusinessUnit getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(BusinessUnit businessUnit) {
        this.businessUnit = businessUnit;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
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
