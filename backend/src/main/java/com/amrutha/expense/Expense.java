package com.amrutha.expense;

import com.amrutha.product.BusinessUnit;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Expense entity tracking operational expenses for Dairy and Rice operations.
 * Dairy expenses: Cattle feed, Animal care, Milk procurement, Labour, Transport, Electricity, Equipment.
 * Rice expenses: Paddy procurement, Milling, Packaging, Labour, Transport, Storage, Electricity.
 */
@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 60)
    private String category; // e.g. "Cattle feed", "Milling", "Electricity", "Labour", "Transport"

    @Enumerated(EnumType.STRING)
    @Column(name = "business_unit", nullable = false, length = 20)
    private BusinessUnit businessUnit;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Expense() {
    }

    public Expense(String title, String description, String category, BusinessUnit businessUnit,
                   BigDecimal amount, LocalDate expenseDate, String notes) {
        this.title = title;
        this.description = description != null ? description : title;
        this.category = category;
        this.businessUnit = businessUnit;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.notes = notes;
    }

    public Expense(String title, String category, BusinessUnit businessUnit,
                   BigDecimal amount, LocalDate expenseDate, String notes) {
        this(title, title, category, businessUnit, amount, expenseDate, notes);
    }

    @PrePersist
    protected void onCreate() {
        if (this.description == null && this.title != null) {
            this.description = this.title;
        }
        if (this.title == null && this.description != null) {
            this.title = this.description;
        }
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

    public String getTitle() {
        return title != null ? title : description;
    }

    public void setTitle(String title) {
        this.title = title;
        if (this.description == null) {
            this.description = title;
        }
    }

    public String getDescription() {
        return description != null ? description : title;
    }

    public void setDescription(String description) {
        this.description = description;
        if (this.title == null) {
            this.title = description;
        }
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BusinessUnit getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(BusinessUnit businessUnit) {
        this.businessUnit = businessUnit;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
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
