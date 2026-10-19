package com.amrutha.expense;

import com.amrutha.common.BadRequestException;
import com.amrutha.common.ResourceNotFoundException;
import com.amrutha.expense.dto.ExpenseRequestDto;
import com.amrutha.expense.dto.ExpenseResponseDto;
import com.amrutha.product.BusinessUnit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing operational expenses for Dairy and Rice operations.
 * Enforces business unit segregation and decimal precision.
 */
@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    /**
     * Records a new expense for a business unit.
     */
    public ExpenseResponseDto recordExpense(ExpenseRequestDto dto) {
        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Expense amount must be greater than zero.");
        }
        if (dto.getBusinessUnit() == null) {
            throw new BadRequestException("Business unit (DAIRY or RICE) is required.");
        }
        if (dto.getExpenseDate() == null) {
            throw new BadRequestException("Expense date is required.");
        }

        Expense expense = new Expense();
        expense.setTitle(dto.getDescription().trim());
        expense.setDescription(dto.getDescription().trim());
        expense.setCategory(dto.getCategory().trim());
        expense.setBusinessUnit(dto.getBusinessUnit());
        expense.setAmount(dto.getAmount());
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : null);

        Expense saved = expenseRepository.save(expense);
        return ExpenseResponseDto.fromEntity(saved);
    }

    /**
     * Retrieves expenses with optional filters for business unit, date range, and category.
     */
    @Transactional(readOnly = true)
    public List<ExpenseResponseDto> getExpenses(BusinessUnit businessUnit,
                                                LocalDate startDate,
                                                LocalDate endDate,
                                                String category) {
        List<Expense> expenses;

        if (businessUnit != null && startDate != null && endDate != null) {
            expenses = expenseRepository.findByBusinessUnitAndExpenseDateBetween(businessUnit, startDate, endDate);
        } else if (businessUnit != null) {
            expenses = expenseRepository.findByBusinessUnit(businessUnit);
        } else if (startDate != null && endDate != null) {
            expenses = expenseRepository.findByExpenseDateBetween(startDate, endDate);
        } else {
            expenses = expenseRepository.findAll();
        }

        if (category != null && !category.isBlank()) {
            String catTrimmed = category.trim().toLowerCase();
            expenses = expenses.stream()
                    .filter(e -> e.getCategory() != null && e.getCategory().toLowerCase().contains(catTrimmed))
                    .collect(Collectors.toList());
        }

        return expenses.stream()
                .map(ExpenseResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves an expense by ID.
     */
    @Transactional(readOnly = true)
    public ExpenseResponseDto getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        return ExpenseResponseDto.fromEntity(expense);
    }

    /**
     * Deletes an expense by ID.
     */
    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense", "id", id);
        }
        expenseRepository.deleteById(id);
    }
}
