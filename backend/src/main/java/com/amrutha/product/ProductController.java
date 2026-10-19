package com.amrutha.product;

import com.amrutha.common.ApiResponse;
import com.amrutha.product.dto.ProductRequestDto;
import com.amrutha.product.dto.ProductResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Product operations across Dairy and Rice business units.
 * Base Path: /api/products
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/products
     * Lists active products.
     * Optional Query Params:
     *   - businessUnit=DAIRY or businessUnit=RICE (filters by business unit)
     *   - activeOnly=true/false (defaults to true)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProducts(
            @RequestParam(required = false) BusinessUnit businessUnit,
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {

        List<ProductResponseDto> products = productService.getProducts(businessUnit, activeOnly);
        String message = businessUnit != null
                ? "Found " + products.size() + " active " + businessUnit + " products"
                : "Found " + products.size() + " active products";

        return ResponseEntity.ok(ApiResponse.ok(message, products));
    }

    /**
     * GET /api/products/business-unit/{unit}
     * Explicit path endpoint to filter products by business unit (DAIRY or RICE).
     */
    @GetMapping("/business-unit/{unit}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByBusinessUnit(
            @PathVariable("unit") BusinessUnit unit) {

        List<ProductResponseDto> products = productService.getActiveProducts(unit);
        return ResponseEntity.ok(ApiResponse.ok("Products for business unit: " + unit, products));
    }

    /**
     * GET /api/products/{id}
     * Retrieves a single product by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductById(@PathVariable Long id) {
        ProductResponseDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok("Product retrieved successfully", product));
    }

    /**
     * POST /api/products
     * Adds a new product. Validates request body with Bean Validation.
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
     * PUT /api/products/{id}
     * Edits an existing product.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDto requestDto) {

        ProductResponseDto updated = productService.updateProduct(id, requestDto);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    /**
     * PATCH /api/products/{id}/deactivate
     * Deactivates a product (soft delete).
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<ProductResponseDto>> deactivateProduct(@PathVariable Long id) {
        ProductResponseDto deactivated = productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated successfully", deactivated));
    }

    /**
     * DELETE /api/products/{id}
     * Standard DELETE endpoint mapping to soft-deactivation.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> deleteProduct(@PathVariable Long id) {
        ProductResponseDto deactivated = productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deactivated successfully", deactivated));
    }

    /**
     * PATCH /api/products/{id}/activate
     * Re-activates a previously deactivated product.
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<ProductResponseDto>> activateProduct(@PathVariable Long id) {
        ProductResponseDto activated = productService.activateProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product re-activated successfully", activated));
    }
}
