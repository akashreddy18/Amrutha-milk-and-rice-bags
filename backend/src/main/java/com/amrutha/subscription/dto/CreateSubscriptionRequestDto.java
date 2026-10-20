package com.amrutha.subscription.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateSubscriptionRequestDto {

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 120, message = "Customer name must be between 2 and 120 characters")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    @Size(min = 10, max = 20, message = "Valid phone number required")
    private String customerPhone;

    @NotBlank(message = "Delivery address is required")
    @Size(min = 5, max = 500, message = "Delivery address must be between 5 and 500 characters")
    private String deliveryAddress;

    @NotBlank(message = "Milk type is required (e.g. Pure Cow Milk or Pure Buffalo Milk)")
    private String milkType;

    @NotBlank(message = "Daily quantity is required (500 ml, 1 Litre, or 2 Litres)")
    private String dailyQuantity;

    @NotNull(message = "Duration in days is required (7 or 30 days)")
    @Min(value = 7, message = "Minimum duration is 7 days")
    private Integer durationDays;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotBlank(message = "Preferred delivery slot is required")
    private String deliverySlot;

    private String notes;

    public CreateSubscriptionRequestDto() {
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

    public String getDeliverySlot() {
        return deliverySlot;
    }

    public void setDeliverySlot(String deliverySlot) {
        this.deliverySlot = deliverySlot;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
