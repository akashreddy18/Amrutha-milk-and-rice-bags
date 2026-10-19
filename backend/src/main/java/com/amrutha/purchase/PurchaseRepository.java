package com.amrutha.purchase;

import com.amrutha.product.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Purchase entity.
 */
@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    Optional<Purchase> findByPurchaseNumber(String purchaseNumber);

    List<Purchase> findByBusinessUnit(BusinessUnit businessUnit);

    List<Purchase> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate);

    List<Purchase> findByBusinessUnitAndPurchaseDateBetween(BusinessUnit businessUnit, LocalDate startDate, LocalDate endDate);
}
