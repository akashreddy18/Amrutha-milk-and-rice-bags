package com.amrutha.customer;

import com.amrutha.common.ApiResponse;
import com.amrutha.customer.dto.CustomerRequestDto;
import com.amrutha.customer.dto.CustomerResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Customer operations.
 * Base Path: /api/customers
 */
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /**
     * GET /api/customers
     * Retrieves all customers (active by default).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponseDto>>> getCustomers(
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {

        List<CustomerResponseDto> customers = customerService.getCustomers(activeOnly);
        return ResponseEntity.ok(ApiResponse.ok("Retrieved " + customers.size() + " customers", customers));
    }

    /**
     * GET /api/customers/{id}
     * Retrieves customer by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> getCustomerById(@PathVariable Long id) {
        CustomerResponseDto customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer retrieved successfully", customer));
    }

    /**
     * POST /api/customers
     * Registers a new customer.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponseDto>> addCustomer(
            @Valid @RequestBody CustomerRequestDto requestDto) {

        CustomerResponseDto created = customerService.addCustomer(requestDto);
        return new ResponseEntity<>(
                ApiResponse.created("Customer registered successfully with ID: " + created.getId(), created),
                HttpStatus.CREATED
        );
    }

    /**
     * PUT /api/customers/{id}
     * Updates an existing customer.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequestDto requestDto) {

        CustomerResponseDto updated = customerService.updateCustomer(id, requestDto);
        return ResponseEntity.ok(ApiResponse.ok("Customer updated successfully", updated));
    }

    /**
     * PATCH /api/customers/{id}/deactivate
     * Deactivates a customer.
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> deactivateCustomer(@PathVariable Long id) {
        CustomerResponseDto deactivated = customerService.deactivateCustomer(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer deactivated successfully", deactivated));
    }

    /**
     * DELETE /api/customers/{id}
     * Deactivates customer via standard DELETE verb.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> deleteCustomer(@PathVariable Long id) {
        CustomerResponseDto deactivated = customerService.deactivateCustomer(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer deactivated successfully", deactivated));
    }

    /**
     * PATCH /api/customers/{id}/activate
     * Re-activates a customer.
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> activateCustomer(@PathVariable Long id) {
        CustomerResponseDto activated = customerService.activateCustomer(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer re-activated successfully", activated));
    }
}
