package com.amrutha.product;

import com.amrutha.common.ApiResponse;
import com.amrutha.product.dto.ProductRequestDto;
import com.amrutha.product.dto.ProductResponseDto;
import com.amrutha.product.dto.UpdateStockRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Administrator Product & Inventory Management.
 * Base Path: /api/admin/products
 * Restricted strictly to authenticated users with administrative roles.
 */
@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/admin/products
     * Lists products with optional business unit and active filters.
     * By default, returns all products (both active and inactive) for admin visibility.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProducts(
            @RequestParam(required = false) BusinessUnit businessUnit,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {

        List<ProductResponseDto> products = productService.getProducts(businessUnit, activeOnly);
        return ResponseEntity.ok(ApiResponse.ok("Products loaded successfully", products));
    }

    /**
     * GET /api/admin/products/{id}
     * Retrieves full product details by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductById(@PathVariable Long id) {
        ProductResponseDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok("Product retrieved successfully", product));
    }

    /**
     * POST /api/admin/products
     * Adds a new product to the catalog.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponseDto>> addProduct(
            @Valid @RequestBody ProductRequestDto requestDto) {

        ProductResponseDto created = productService.addProduct(requestDto);
        return new ResponseEntity<>(
                ApiResponse.created("Product created successfully with ID: " + created.getId(), created),
                HttpStatus.CREATED
        );
    }

    /**
     * PUT /api/admin/products/{id}
     * Updates an existing product.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDto requestDto) {

        ProductResponseDto updated = productService.updateProduct(id, requestDto);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    /**
     * PATCH /api/admin/products/{id}/deactivate
     * Deactivates a product from the storefront catalog.
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<ProductResponseDto>> deactivateProduct(@PathVariable Long id) {
        ProductResponseDto deactivated = productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated successfully", deactivated));
    }

    /**
     * PATCH /api/admin/products/{id}/activate
     * Re-activates a deactivated product.
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<ProductResponseDto>> activateProduct(@PathVariable Long id) {
        ProductResponseDto activated = productService.activateProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product re-activated successfully", activated));
    }

    /**
     * PATCH /api/admin/products/{id}/stock
     * Updates inventory stock quantity for a product.
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStockRequestDto requestDto) {

        ProductResponseDto updated = productService.updateStock(id, requestDto.getStockQuantity());
        return ResponseEntity.ok(ApiResponse.ok("Stock quantity updated to " + updated.getStockQuantity(), updated));
    }
}
