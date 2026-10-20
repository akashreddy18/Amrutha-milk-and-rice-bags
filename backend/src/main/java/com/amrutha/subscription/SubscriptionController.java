package com.amrutha.subscription;

import com.amrutha.common.ApiResponse;
import com.amrutha.subscription.dto.CreateSubscriptionRequestDto;
import com.amrutha.subscription.dto.SubscriptionResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /**
     * POST /api/subscriptions
     * Public customer endpoint to start a new daily milk subscription.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionResponseDto>> createSubscription(
            @Valid @RequestBody CreateSubscriptionRequestDto request) {

        SubscriptionResponseDto created = subscriptionService.createSubscription(request);
        return new ResponseEntity<>(
                ApiResponse.created("Subscription confirmed! Reference Number: " + created.getSubscriptionNumber(), created),
                HttpStatus.CREATED
        );
    }

    /**
     * GET /api/subscriptions/customer/{phone}
     * Retrieves active and past subscriptions for customer self-service.
     */
    @GetMapping("/customer/{phone}")
    public ResponseEntity<ApiResponse<List<SubscriptionResponseDto>>> getCustomerSubscriptions(
            @PathVariable String phone) {

        List<SubscriptionResponseDto> list = subscriptionService.getSubscriptionsByCustomerPhone(phone);
        return ResponseEntity.ok(ApiResponse.ok("Customer subscriptions retrieved", list));
    }

    /**
     * PATCH /api/subscriptions/{id}/pause
     * Allows customer to pause their daily milk delivery.
     */
    @PatchMapping("/{id}/pause")
    public ResponseEntity<ApiResponse<SubscriptionResponseDto>> pauseSubscription(@PathVariable Long id) {
        SubscriptionResponseDto paused = subscriptionService.pauseSubscription(id);
        return ResponseEntity.ok(ApiResponse.ok("Subscription paused successfully", paused));
    }

    /**
     * PATCH /api/subscriptions/{id}/resume
     * Allows customer to resume their paused subscription.
     */
    @PatchMapping("/{id}/resume")
    public ResponseEntity<ApiResponse<SubscriptionResponseDto>> resumeSubscription(@PathVariable Long id) {
        SubscriptionResponseDto resumed = subscriptionService.resumeSubscription(id);
        return ResponseEntity.ok(ApiResponse.ok("Subscription resumed successfully", resumed));
    }

    /**
     * PATCH /api/subscriptions/{id}/cancel
     * Allows customer to cancel their subscription.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionResponseDto>> cancelSubscription(@PathVariable Long id) {
        SubscriptionResponseDto cancelled = subscriptionService.cancelSubscription(id);
        return ResponseEntity.ok(ApiResponse.ok("Subscription cancelled successfully", cancelled));
    }
}
