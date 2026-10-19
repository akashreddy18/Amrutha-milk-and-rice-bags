package com.amrutha.expense;

import com.amrutha.product.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Spring Data JPA Repository for Expense entity.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByBusinessUnit(BusinessUnit businessUnit);

    List<Expense> findByCategory(String category);

    List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);

    List<Expense> findByBusinessUnitAndExpenseDateBetween(BusinessUnit businessUnit, LocalDate startDate, LocalDate endDate);

    List<Expense> findByBusinessUnitAndCategory(BusinessUnit businessUnit, String category);
}
