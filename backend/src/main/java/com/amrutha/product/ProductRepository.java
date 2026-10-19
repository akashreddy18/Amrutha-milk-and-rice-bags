package com.amrutha.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for Product entity.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Finds all active products.
     */
    List<Product> findByActiveTrue();

    /**
     * Finds all products filtered by business unit (DAIRY or RICE) that are currently active.
     */
    List<Product> findByBusinessUnitAndActiveTrue(BusinessUnit businessUnit);

    /**
     * Finds all products by business unit (including inactive ones if requested).
     */
    List<Product> findByBusinessUnit(BusinessUnit businessUnit);

    /**
     * Finds all products by active flag.
     */
    List<Product> findByActive(boolean active);

    /**
     * Checks if a product with the same name already exists (case-insensitive).
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Checks if a product with the same name already exists for other IDs (case-insensitive).
     */
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
