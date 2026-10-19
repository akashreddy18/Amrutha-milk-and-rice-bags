package com.amrutha.customer.dto;

import com.amrutha.product.BusinessUnit;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating and editing customers.
 */
public class CustomerRequestDto {

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s()]{10,20}$", message = "Phone number must be valid (at least 10 digits)")
    private String phone;

    @Email(message = "Email must be a valid email address format")
    @Size(max = 120, message = "Email cannot exceed 120 characters")
    private String email;

    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    @Size(max = 100, message = "Delivery slot cannot exceed 100 characters")
    private String deliverySlot;

    private BusinessUnit preferredBusinessUnit;

    private Boolean active = true;

    public CustomerRequestDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDeliverySlot() {
        return deliverySlot;
    }

    public void setDeliverySlot(String deliverySlot) {
        this.deliverySlot = deliverySlot;
    }

    public BusinessUnit getPreferredBusinessUnit() {
        return preferredBusinessUnit;
    }

    public void setPreferredBusinessUnit(BusinessUnit preferredBusinessUnit) {
        this.preferredBusinessUnit = preferredBusinessUnit;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
