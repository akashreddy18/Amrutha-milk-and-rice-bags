package com.amrutha.purchase;

import com.amrutha.common.ApiResponse;
import com.amrutha.product.BusinessUnit;
import com.amrutha.purchase.dto.PurchaseRequestDto;
import com.amrutha.purchase.dto.PurchaseResponseDto;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Administrator Raw Material Purchases Management.
 * Base Path: /api/admin/purchases
 * Tracked separately from expenses to prevent double-counting.
 * Strictly restricted to authenticated users with administrative roles.
 */
@RestController
@RequestMapping("/api/admin/purchases")
public class AdminPurchaseController {

    private final PurchaseService purchaseService;

    public AdminPurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    /**
     * POST /api/admin/purchases
     * Records a new raw material purchase (raw milk procurement / paddy).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseResponseDto>> recordPurchase(
            @Valid @RequestBody PurchaseRequestDto requestDto) {

        PurchaseResponseDto created = purchaseService.recordPurchase(requestDto);
        return new ResponseEntity<>(
                ApiResponse.created("Purchase recorded successfully with Number: " + created.getPurchaseNumber(), created),
                HttpStatus.CREATED
        );
    }

    /**
     * GET /api/admin/purchases
     * Lists raw material purchases with optional filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseResponseDto>>> getPurchases(
            @RequestParam(required = false) BusinessUnit businessUnit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<PurchaseResponseDto> list = purchaseService.getPurchases(businessUnit, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok("Purchases retrieved successfully (" + list.size() + ")", list));
    }

    /**
     * GET /api/admin/purchases/{id}
     * Retrieves a single purchase by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseResponseDto>> getPurchaseById(@PathVariable Long id) {
        PurchaseResponseDto dto = purchaseService.getPurchaseById(id);
        return ResponseEntity.ok(ApiResponse.ok("Purchase details retrieved", dto));
    }

    /**
     * DELETE /api/admin/purchases/{id}
     * Deletes a purchase entry.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.ok(ApiResponse.ok("Purchase entry deleted successfully", null));
    }
}
