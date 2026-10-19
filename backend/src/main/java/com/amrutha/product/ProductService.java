package com.amrutha.product;

import com.amrutha.common.BadRequestException;
import com.amrutha.common.ResourceNotFoundException;
import com.amrutha.product.dto.ProductRequestDto;
import com.amrutha.product.dto.ProductResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer handling business logic for Product management.
 */
@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Retrieves all active products, optionally filtered by businessUnit (DAIRY or RICE).
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getActiveProducts(BusinessUnit businessUnit) {
        List<Product> products;
        if (businessUnit != null) {
            products = productRepository.findByBusinessUnitAndActiveTrue(businessUnit);
        } else {
            products = productRepository.findByActiveTrue();
        }
        return products.stream()
                .map(ProductResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves products with flexible filters for business unit and active status.
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProducts(BusinessUnit businessUnit, Boolean activeOnly) {
        boolean filterActive = activeOnly == null || activeOnly;
        if (filterActive) {
            return getActiveProducts(businessUnit);
        }

        List<Product> products;
        if (businessUnit != null) {
            products = productRepository.findByBusinessUnit(businessUnit);
        } else {
            products = productRepository.findAll();
        }
        return products.stream()
                .map(ProductResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single product by its ID.
     */
    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {
        Product product = findProductById(id);
        return ProductResponseDto.fromEntity(product);
    }

    /**
     * Adds a new product.
     */
    public ProductResponseDto addProduct(ProductRequestDto dto) {
        // Validation check for unique name
        if (productRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new BadRequestException("Product with name '" + dto.getName() + "' already exists.");
        }

        Product product = new Product();
        mapDtoToEntity(dto, product);
        if (dto.getActive() != null) {
            product.setActive(dto.getActive());
        }

        Product saved = productRepository.save(product);
        return ProductResponseDto.fromEntity(saved);
    }

    /**
     * Updates an existing product.
     */
    public ProductResponseDto updateProduct(Long id, ProductRequestDto dto) {
        Product product = findProductById(id);

        // Validation check for unique name (excluding self)
        if (productRepository.existsByNameIgnoreCaseAndIdNot(dto.getName().trim(), id)) {
            throw new BadRequestException("Another product with name '" + dto.getName() + "' already exists.");
        }

        mapDtoToEntity(dto, product);
        if (dto.getActive() != null) {
            product.setActive(dto.getActive());
        }

        Product updated = productRepository.save(product);
        return ProductResponseDto.fromEntity(updated);
    }

    /**
     * Deactivates a product (soft delete).
     */
    public ProductResponseDto deactivateProduct(Long id) {
        Product product = findProductById(id);
        if (!product.isActive()) {
            throw new BadRequestException("Product '" + product.getName() + "' (ID: " + id + ") is already deactivated.");
        }
        product.setActive(false);
        Product saved = productRepository.save(product);
        return ProductResponseDto.fromEntity(saved);
    }

    /**
     * Re-activates a previously deactivated product.
     */
    public ProductResponseDto activateProduct(Long id) {
        Product product = findProductById(id);
        if (product.isActive()) {
            throw new BadRequestException("Product '" + product.getName() + "' (ID: " + id + ") is already active.");
        }
        product.setActive(true);
        Product saved = productRepository.save(product);
        return ProductResponseDto.fromEntity(saved);
    }

    /**
     * Updates stock inventory quantity for a product.
     */
    public ProductResponseDto updateStock(Long id, Integer newStockQuantity) {
        if (newStockQuantity == null || newStockQuantity < 0) {
            throw new BadRequestException("Stock quantity cannot be null or negative.");
        }
        Product product = findProductById(id);
        product.setStockQuantity(newStockQuantity);
        Product updated = productRepository.save(product);
        return ProductResponseDto.fromEntity(updated);
    }

    /**
     * Helper to find Product by ID or throw ResourceNotFoundException.
     */
    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    /**
     * Helper to map request DTO fields to entity.
     */
    private void mapDtoToEntity(ProductRequestDto dto, Product product) {
        product.setName(dto.getName().trim());
        product.setLocalName(dto.getLocalName() != null ? dto.getLocalName().trim() : null);
        product.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        product.setBusinessUnit(dto.getBusinessUnit());
        product.setPrice(dto.getPrice());
        product.setUnit(dto.getUnit().trim());
        product.setCategory(dto.getCategory() != null ? dto.getCategory().trim() : null);
        product.setBadge(dto.getBadge() != null ? dto.getBadge().trim() : null);
        product.setImageUrl(dto.getImageUrl() != null ? dto.getImageUrl().trim() : null);
        if (dto.getStockQuantity() != null) {
            product.setStockQuantity(dto.getStockQuantity());
        }
    }
}
