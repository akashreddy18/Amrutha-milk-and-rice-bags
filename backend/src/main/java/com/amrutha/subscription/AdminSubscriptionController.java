package com.amrutha.subscription;

import com.amrutha.common.ApiResponse;
import com.amrutha.subscription.dto.DailyDemandDto;
import com.amrutha.subscription.dto.SubscriptionResponseDto;
import com.amrutha.subscription.dto.UpdateSubscriptionStatusDto;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/subscriptions")
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    public AdminSubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /**
     * GET /api/admin/subscriptions
     * Lists all subscriptions with optional status, milkType, and slot filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionResponseDto>>> getAllSubscriptions(
            @RequestParam(required = false) SubscriptionStatus status,
            @RequestParam(required = false) String milkType,
            @RequestParam(required = false) String deliverySlot) {

        List<SubscriptionResponseDto> list = subscriptionService.getAllSubscriptions(status, milkType, deliverySlot);
        return ResponseEntity.ok(ApiResponse.ok("Subscriptions loaded successfully", list));
    }

    /**
     * GET /api/admin/subscriptions/daily-demand
     * Calculates daily milk quantity requirements for delivery scheduling & procurement.
     */
    @GetMapping("/daily-demand")
    public ResponseEntity<ApiResponse<DailyDemandDto>> getDailyDemand(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        DailyDemandDto demand = subscriptionService.getDailyDemand(date);
        return ResponseEntity.ok(ApiResponse.ok("Daily demand forecast calculated", demand));
    }

    /**
     * PATCH /api/admin/subscriptions/{id}/status
     * Admin status override: ACTIVATE, PAUSE, RESUME, CANCEL.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SubscriptionResponseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSubscriptionStatusDto request) {

        SubscriptionResponseDto updated;
        switch (request.getStatus()) {
            case PAUSED:
                updated = subscriptionService.pauseSubscription(id);
                break;
            case ACTIVE:
                updated = subscriptionService.resumeSubscription(id);
                break;
            case CANCELLED:
                updated = subscriptionService.cancelSubscription(id);
                break;
            default:
                updated = subscriptionService.pauseSubscription(id);
                break;
        }

        return ResponseEntity.ok(ApiResponse.ok("Subscription status updated to " + request.getStatus(), updated));
    }

    /**
     * PATCH /api/admin/subscriptions/{id}/payment
     * Admin payment recording: marks subscription payment as PAID or PENDING.
     */
    @PatchMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<SubscriptionResponseDto>> updatePayment(
            @PathVariable Long id,
            @RequestParam(defaultValue = "PAID") String paymentStatus) {

        SubscriptionResponseDto updated = subscriptionService.updatePaymentStatus(id, paymentStatus);
        return ResponseEntity.ok(ApiResponse.ok("Payment status updated to " + paymentStatus, updated));
    }
}
