package com.amrutha.customer;

import com.amrutha.product.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Customer entity.
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Finds all active customers.
     */
    List<Customer> findByActiveTrue();

    /**
     * Finds customers by active status.
     */
    List<Customer> findByActive(boolean active);

    /**
     * Finds active customers by preferred business unit.
     */
    List<Customer> findByPreferredBusinessUnitAndActiveTrue(BusinessUnit businessUnit);

    /**
     * Finds a customer by phone number.
     */
    Optional<Customer> findByPhone(String phone);

    /**
     * Checks if a phone number is already registered.
     */
    boolean existsByPhone(String phone);

    /**
     * Checks if a phone number belongs to another customer.
     */
    boolean existsByPhoneAndIdNot(String phone, Long id);
}
