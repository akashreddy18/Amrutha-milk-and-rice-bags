package com.amrutha.purchase.dto;

import com.amrutha.product.BusinessUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for recording raw material purchases
 * (Raw milk procurement from farmers, Raw paddy/rice from mills).
 */
public class PurchaseRequestDto {

    private String purchaseNumber;

    @NotBlank(message = "Supplier name is required (e.g. Farmer name or Mill name)")
    private String supplierName;

    @NotNull(message = "Business unit is required (DAIRY or RICE)")
    private BusinessUnit businessUnit;

    @NotBlank(message = "Item description is required")
    private String itemDescription;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotBlank(message = "Unit is required (e.g. Litre, 75kg Bag, Quintal)")
    private String unit;

    @NotNull(message = "Unit rate is required")
    @DecimalMin(value = "0.01", message = "Unit rate must be greater than zero")
    private BigDecimal unitRate;

    private BigDecimal totalCost;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    private String notes;

    public PurchaseRequestDto() {
    }

    public PurchaseRequestDto(String supplierName, BusinessUnit businessUnit, String itemDescription,
                              BigDecimal quantity, String unit, BigDecimal unitRate,
                              LocalDate purchaseDate, String notes) {
        this.supplierName = supplierName;
        this.businessUnit = businessUnit;
        this.itemDescription = itemDescription;
        this.quantity = quantity;
        this.unit = unit;
        this.unitRate = unitRate;
        this.purchaseDate = purchaseDate;
        this.notes = notes;
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
}
