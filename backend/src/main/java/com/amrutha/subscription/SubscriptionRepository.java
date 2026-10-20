package com.amrutha.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findBySubscriptionNumber(String subscriptionNumber);

    List<Subscription> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);

    List<Subscription> findByStatusOrderByCreatedAtDesc(SubscriptionStatus status);

    long countByStatus(SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.status = :status AND s.startDate <= :date AND s.endDate >= :date")
    List<Subscription> findActiveOnDate(@Param("date") LocalDate date, @Param("status") SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.startDate <= :endDate AND s.endDate >= :startDate ORDER BY s.createdAt DESC")
    List<Subscription> findInDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
