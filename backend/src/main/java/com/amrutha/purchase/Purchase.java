package com.amrutha.purchase;

import com.amrutha.product.BusinessUnit;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Purchase entity representing raw milk procurement from local farmers
 * or paddy/rice procurement from mills.
 */
@Entity
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "purchase_number", nullable = false, unique = true, length = 50)
    private String purchaseNumber;

    @Column(name = "supplier_name", nullable = false, length = 150)
    private String supplierName; // Farmer name or Rice Mill name

    @Enumerated(EnumType.STRING)
    @Column(name = "business_unit", nullable = false, length = 20)
    private BusinessUnit businessUnit;

    @Column(name = "item_description", nullable = false, length = 200)
    private String itemDescription; // e.g. "Morning Cow Milk Procurement", "Raw Paddy 75kg bags"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, length = 50)
    private String unit; // "Litre", "Bag", "Quintal"

    @Column(name = "unit_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitRate;

    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Purchase() {
    }

    public Purchase(String purchaseNumber, String supplierName, BusinessUnit businessUnit,
                    String itemDescription, BigDecimal quantity, String unit, BigDecimal unitRate,
                    BigDecimal totalCost, LocalDate purchaseDate, String notes) {
        this.purchaseNumber = purchaseNumber;
        this.supplierName = supplierName;
        this.businessUnit = businessUnit;
        this.itemDescription = itemDescription;
        this.quantity = quantity;
        this.unit = unit;
        this.unitRate = unitRate;
        this.totalCost = totalCost;
        this.purchaseDate = purchaseDate;
        this.notes = notes;
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

    public String getPurchaseNumber() {
        return purchaseNumber;
    }

    public void setPurchaseNumber(String purchaseNumber) {
        this.purchaseNumber = purchaseNumber;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public BusinessUnit getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(BusinessUnit businessUnit) {
        this.businessUnit = businessUnit;
    }

    public String getItemDescription() {
        return itemDescription;
    }

    public void setItemDescription(String itemDescription) {
        this.itemDescription = itemDescription;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitRate() {
        return unitRate;
    }

    public void setUnitRate(BigDecimal unitRate) {
        this.unitRate = unitRate;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
