package com.amrutha.expense.dto;

import com.amrutha.expense.Expense;
import com.amrutha.product.BusinessUnit;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response representation for an Expense record.
 */
public class ExpenseResponseDto {

    private Long id;
    private String title;
    private String description;
    private String category;
    private BusinessUnit businessUnit;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String notes;
    private LocalDateTime createdAt;

    public ExpenseResponseDto() {
    }

    public static ExpenseResponseDto fromEntity(Expense entity) {
        if (entity == null) return null;
        ExpenseResponseDto dto = new ExpenseResponseDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setCategory(entity.getCategory());
        dto.setBusinessUnit(entity.getBusinessUnit());
        dto.setAmount(entity.getAmount());
        dto.setExpenseDate(entity.getExpenseDate());
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
}
