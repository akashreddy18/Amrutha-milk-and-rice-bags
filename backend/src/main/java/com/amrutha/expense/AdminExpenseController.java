package com.amrutha.expense;

import com.amrutha.common.ApiResponse;
import com.amrutha.expense.dto.ExpenseRequestDto;
import com.amrutha.expense.dto.ExpenseResponseDto;
import com.amrutha.product.BusinessUnit;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Administrator Operational Expense Management.
 * Base Path: /api/admin/expenses
 * Strictly restricted to authenticated users with administrative roles.
 */
@RestController
@RequestMapping("/api/admin/expenses")
public class AdminExpenseController {

    private final ExpenseService expenseService;

    public AdminExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    /**
     * POST /api/admin/expenses
     * Records a new expense with category, description, amount, date, and business unit.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> recordExpense(
            @Valid @RequestBody ExpenseRequestDto requestDto) {

        ExpenseResponseDto created = expenseService.recordExpense(requestDto);
        return new ResponseEntity<>(
                ApiResponse.created("Expense recorded successfully with ID: " + created.getId(), created),
                HttpStatus.CREATED
        );
    }

    /**
     * GET /api/admin/expenses
     * Lists expenses with optional filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> getExpenses(
            @RequestParam(required = false) BusinessUnit businessUnit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String category) {

        List<ExpenseResponseDto> list = expenseService.getExpenses(businessUnit, startDate, endDate, category);
        return ResponseEntity.ok(ApiResponse.ok("Expenses retrieved successfully (" + list.size() + ")", list));
    }

    /**
     * GET /api/admin/expenses/{id}
     * Retrieves a single expense by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> getExpenseById(@PathVariable Long id) {
        ExpenseResponseDto dto = expenseService.getExpenseById(id);
        return ResponseEntity.ok(ApiResponse.ok("Expense details retrieved", dto));
    }

    /**
     * DELETE /api/admin/expenses/{id}
     * Deletes an expense entry.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.ok("Expense entry deleted successfully", null));
    }

    /**
     * GET /api/admin/expenses/categories
     * Returns standard suggested expense categories for a given business unit (DAIRY or RICE).
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories(
            @RequestParam(required = false) BusinessUnit businessUnit) {

        List<String> categories = ExpenseCategories.getCategoriesFor(businessUnit);
        return ResponseEntity.ok(ApiResponse.ok("Expense categories for " + businessUnit, categories));
    }
}
