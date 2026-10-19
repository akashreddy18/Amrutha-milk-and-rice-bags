package com.amrutha.customer;

import com.amrutha.common.BadRequestException;
import com.amrutha.common.ResourceNotFoundException;
import com.amrutha.customer.dto.CustomerRequestDto;
import com.amrutha.customer.dto.CustomerResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer handling business logic for Customer management.
 */
@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /**
     * Retrieves all customers, optionally filtered by active status.
     */
    @Transactional(readOnly = true)
    public List<CustomerResponseDto> getCustomers(Boolean activeOnly) {
        boolean filterActive = activeOnly == null || activeOnly;
        List<Customer> customers = filterActive
                ? customerRepository.findByActiveTrue()
                : customerRepository.findAll();

        return customers.stream()
                .map(CustomerResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single customer by ID.
     */
    @Transactional(readOnly = true)
    public CustomerResponseDto getCustomerById(Long id) {
        Customer customer = findCustomerById(id);
        return CustomerResponseDto.fromEntity(customer);
    }

    /**
     * Registers a new customer.
     */
    public CustomerResponseDto addCustomer(CustomerRequestDto dto) {
        String trimmedPhone = dto.getPhone().trim();
        if (customerRepository.existsByPhone(trimmedPhone)) {
            throw new BadRequestException("Customer with phone number '" + trimmedPhone + "' is already registered.");
        }

        Customer customer = new Customer();
        mapDtoToEntity(dto, customer);
        if (dto.getActive() != null) {
            customer.setActive(dto.getActive());
        }

        Customer saved = customerRepository.save(customer);
        return CustomerResponseDto.fromEntity(saved);
    }

    /**
     * Updates an existing customer.
     */
    public CustomerResponseDto updateCustomer(Long id, CustomerRequestDto dto) {
        Customer customer = findCustomerById(id);
        String trimmedPhone = dto.getPhone().trim();

        if (customerRepository.existsByPhoneAndIdNot(trimmedPhone, id)) {
            throw new BadRequestException("Another customer with phone number '" + trimmedPhone + "' already exists.");
        }

        mapDtoToEntity(dto, customer);
        if (dto.getActive() != null) {
            customer.setActive(dto.getActive());
        }

        Customer updated = customerRepository.save(customer);
        return CustomerResponseDto.fromEntity(updated);
    }

    /**
     * Deactivates a customer.
     */
    public CustomerResponseDto deactivateCustomer(Long id) {
        Customer customer = findCustomerById(id);
        if (!customer.isActive()) {
            throw new BadRequestException("Customer '" + customer.getName() + "' (ID: " + id + ") is already inactive.");
        }
        customer.setActive(false);
        Customer saved = customerRepository.save(customer);
        return CustomerResponseDto.fromEntity(saved);
    }

    /**
     * Re-activates a customer.
     */
    public CustomerResponseDto activateCustomer(Long id) {
        Customer customer = findCustomerById(id);
        if (customer.isActive()) {
            throw new BadRequestException("Customer '" + customer.getName() + "' (ID: " + id + ") is already active.");
        }
        customer.setActive(true);
        Customer saved = customerRepository.save(customer);
        return CustomerResponseDto.fromEntity(saved);
    }

    /**
     * Helper to retrieve customer by ID or throw ResourceNotFoundException.
     */
    private Customer findCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
    }

    /**
     * Helper to copy fields from DTO to entity.
     */
    private void mapDtoToEntity(CustomerRequestDto dto, Customer customer) {
        customer.setName(dto.getName().trim());
        customer.setPhone(dto.getPhone().trim());
        customer.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        customer.setAddress(dto.getAddress() != null ? dto.getAddress().trim() : null);
        customer.setDeliverySlot(dto.getDeliverySlot() != null ? dto.getDeliverySlot().trim() : null);
        customer.setPreferredBusinessUnit(dto.getPreferredBusinessUnit());
    }
}
