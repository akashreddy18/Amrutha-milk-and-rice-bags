package com.amrutha.subscription.dto;

import com.amrutha.subscription.SubscriptionStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateSubscriptionStatusDto {

    @NotNull(message = "Status is required")
    private SubscriptionStatus status;

    private String notes;

    public UpdateSubscriptionStatusDto() {
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
