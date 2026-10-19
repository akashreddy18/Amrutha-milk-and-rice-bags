package com.amrutha.order;

import com.amrutha.product.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Order entity.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByBusinessUnit(BusinessUnit businessUnit);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByDeliveryDateBetween(LocalDate startDate, LocalDate endDate);

    List<Order> findByStatusAndDeliveryDateBetween(OrderStatus status, LocalDate startDate, LocalDate endDate);

    List<Order> findByBusinessUnitAndDeliveryDateBetween(BusinessUnit businessUnit, LocalDate startDate, LocalDate endDate);

    List<Order> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    List<Order> findByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime startDateTime, LocalDateTime endDateTime);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE (o.deliveryDate BETWEEN :startDate AND :endDate) OR (o.deliveryDate IS NULL AND o.createdAt >= :startDateTime AND o.createdAt <= :endDateTime)")
    List<Order> findOrdersForFinancialReport(@org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
                                            @org.springframework.data.repository.query.Param("endDate") LocalDate endDate,
                                            @org.springframework.data.repository.query.Param("startDateTime") LocalDateTime startDateTime,
                                            @org.springframework.data.repository.query.Param("endDateTime") LocalDateTime endDateTime);
}
