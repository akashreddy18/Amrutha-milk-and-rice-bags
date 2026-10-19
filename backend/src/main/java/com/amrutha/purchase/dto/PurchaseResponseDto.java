package com.amrutha.purchase.dto;

import com.amrutha.product.BusinessUnit;
import com.amrutha.purchase.Purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response representation for a Purchase record.
 */
public class PurchaseResponseDto {

    private Long id;
    private String purchaseNumber;
    private String supplierName;
    private BusinessUnit businessUnit;
    private String itemDescription;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitRate;
    private BigDecimal totalCost;
    private LocalDate purchaseDate;
    private String notes;
    private LocalDateTime createdAt;

    public PurchaseResponseDto() {
    }

    public static PurchaseResponseDto fromEntity(Purchase entity) {
        if (entity == null) return null;
        PurchaseResponseDto dto = new PurchaseResponseDto();
        dto.setId(entity.getId());
        dto.setPurchaseNumber(entity.getPurchaseNumber());
        dto.setSupplierName(entity.getSupplierName());
        dto.setBusinessUnit(entity.getBusinessUnit());
        dto.setItemDescription(entity.getItemDescription());
        dto.setQuantity(entity.getQuantity());
        dto.setUnit(entity.getUnit());
        dto.setUnitRate(entity.getUnitRate());
        dto.setTotalCost(entity.getTotalCost());
        dto.setPurchaseDate(entity.getPurchaseDate());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

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
}
