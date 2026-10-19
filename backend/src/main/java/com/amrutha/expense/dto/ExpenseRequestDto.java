package com.amrutha.expense.dto;

import com.amrutha.product.BusinessUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for creating or updating an operational expense record.
 */
public class ExpenseRequestDto {

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    @NotBlank(message = "Expense category is required")
    private String category;

    @NotBlank(message = "Expense description is required")
    private String description;

    @NotNull(message = "Expense amount is required")
    @DecimalMin(value = "0.01", message = "Expense amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Business unit is required (DAIRY or RICE)")
    private BusinessUnit businessUnit;

    private String notes;

    public ExpenseRequestDto() {
    }

    public ExpenseRequestDto(LocalDate expenseDate, String category, String description,
                             BigDecimal amount, BusinessUnit businessUnit, String notes) {
        this.expenseDate = expenseDate;
        this.category = category;
        this.description = description;
        this.amount = amount;
        this.businessUnit = businessUnit;
        this.notes = notes;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BusinessUnit getBusinessUnit() {
        return businessUnit;
    }

    public void setBusinessUnit(BusinessUnit businessUnit) {
        this.businessUnit = businessUnit;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
