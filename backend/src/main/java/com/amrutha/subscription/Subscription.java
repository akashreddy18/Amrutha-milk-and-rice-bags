package com.amrutha.subscription;

import com.amrutha.customer.Customer;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity representing a customer milk delivery subscription.
 */
@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subscription_number", nullable = false, unique = true, length = 50)
    private String subscriptionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 30)
    private String customerPhone;

    @Column(name = "delivery_address", nullable = false, length = 500)
    private String deliveryAddress;

    @Column(name = "milk_type", nullable = false, length = 50)
    private String milkType; // e.g. "Pure Cow Milk", "Pure Buffalo Milk"

    @Column(name = "daily_quantity", nullable = false, length = 20)
    private String dailyQuantity; // "500 ml", "1 Litre", "2 Litres"

    @Column(name = "daily_quantity_litres", nullable = false, precision = 5, scale = 2)
    private BigDecimal dailyQuantityLitres; // 0.50, 1.00, 2.00

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays; // 7, 30

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "delivery_slot", nullable = false, length = 100)
    private String deliverySlot; // "Morning (5:30 AM – 7:30 AM)", "Evening (5:00 PM – 7:00 PM)"

    @Column(name = "daily_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus = "PENDING"; // "PENDING", "PAID"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "paused_date")
    private LocalDate pausedDate;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Subscription() {
    }

    public Subscription(String subscriptionNumber, Customer customer, String customerName,
                        String customerPhone, String deliveryAddress, String milkType,
                        String dailyQuantity, BigDecimal dailyQuantityLitres, Integer durationDays,
                        LocalDate startDate, LocalDate endDate, String deliverySlot,
                        BigDecimal dailyRate, BigDecimal totalAmount, String notes) {
        this.subscriptionNumber = subscriptionNumber;
        this.customer = customer;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.deliveryAddress = deliveryAddress;
        this.milkType = milkType;
        this.dailyQuantity = dailyQuantity;
        this.dailyQuantityLitres = dailyQuantityLitres;
        this.durationDays = durationDays;
        this.startDate = startDate;
        this.endDate = endDate;
        this.deliverySlot = deliverySlot;
        this.dailyRate = dailyRate;
        this.totalAmount = totalAmount;
        this.notes = notes;
        this.status = SubscriptionStatus.ACTIVE;
        this.paymentStatus = "PENDING";
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSubscriptionNumber() {
        return subscriptionNumber;
    }

    public void setSubscriptionNumber(String subscriptionNumber) {
        this.subscriptionNumber = subscriptionNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getMilkType() {
        return milkType;
    }

    public void setMilkType(String milkType) {
        this.milkType = milkType;
    }

    public String getDailyQuantity() {
        return dailyQuantity;
    }

    public void setDailyQuantity(String dailyQuantity) {
        this.dailyQuantity = dailyQuantity;
    }

    public BigDecimal getDailyQuantityLitres() {
        return dailyQuantityLitres;
    }

    public void setDailyQuantityLitres(BigDecimal dailyQuantityLitres) {
        this.dailyQuantityLitres = dailyQuantityLitres;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getDeliverySlot() {
        return deliverySlot;
    }

    public void setDeliverySlot(String deliverySlot) {
        this.deliverySlot = deliverySlot;
    }

    public BigDecimal getDailyRate() {
        return dailyRate;
    }

    public void setDailyRate(BigDecimal dailyRate) {
        this.dailyRate = dailyRate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }

    public LocalDate getPausedDate() {
        return pausedDate;
    }

    public void setPausedDate(LocalDate pausedDate) {
        this.pausedDate = pausedDate;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
