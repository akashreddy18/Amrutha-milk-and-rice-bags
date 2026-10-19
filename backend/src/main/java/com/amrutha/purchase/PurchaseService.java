package com.amrutha.purchase;

import com.amrutha.common.BadRequestException;
import com.amrutha.common.ResourceNotFoundException;
import com.amrutha.product.BusinessUnit;
import com.amrutha.purchase.dto.PurchaseRequestDto;
import com.amrutha.purchase.dto.PurchaseResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * Service for recording raw material purchases
 * (Farmer raw milk procurement and Mill raw paddy procurement).
 * Recorded separately from operating expenses to prevent double-counting.
 */
@Service
@Transactional
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;

    public PurchaseService(PurchaseRepository purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    /**
     * Records a new raw material purchase.
     */
    public PurchaseResponseDto recordPurchase(PurchaseRequestDto dto) {
        if (dto.getQuantity() == null || dto.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Purchase quantity must be greater than zero.");
        }
        if (dto.getUnitRate() == null || dto.getUnitRate().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Unit rate must be greater than zero.");
        }
        if (dto.getBusinessUnit() == null) {
            throw new BadRequestException("Business unit (DAIRY or RICE) is required.");
        }
        if (dto.getPurchaseDate() == null) {
            throw new BadRequestException("Purchase date is required.");
        }

        BigDecimal computedTotal = dto.getTotalCost();
        if (computedTotal == null || computedTotal.compareTo(BigDecimal.ZERO) <= 0) {
            computedTotal = dto.getQuantity().multiply(dto.getUnitRate());
        }

        String purchaseNumber = dto.getPurchaseNumber();
        if (purchaseNumber == null || purchaseNumber.isBlank()) {
            purchaseNumber = generateUniquePurchaseNumber();
        }

        Purchase purchase = new Purchase();
        purchase.setPurchaseNumber(purchaseNumber.trim());
        purchase.setSupplierName(dto.getSupplierName().trim());
        purchase.setBusinessUnit(dto.getBusinessUnit());
        purchase.setItemDescription(dto.getItemDescription().trim());
        purchase.setQuantity(dto.getQuantity());
        purchase.setUnit(dto.getUnit().trim());
        purchase.setUnitRate(dto.getUnitRate());
        purchase.setTotalCost(computedTotal);
        purchase.setPurchaseDate(dto.getPurchaseDate());
        purchase.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : null);

        Purchase saved = purchaseRepository.save(purchase);
        return PurchaseResponseDto.fromEntity(saved);
    }

    /**
     * Retrieves purchases with optional filters for business unit and date range.
     */
    @Transactional(readOnly = true)
    public List<PurchaseResponseDto> getPurchases(BusinessUnit businessUnit,
                                                  LocalDate startDate,
                                                  LocalDate endDate) {
        List<Purchase> purchases;

        if (businessUnit != null && startDate != null && endDate != null) {
            purchases = purchaseRepository.findByBusinessUnitAndPurchaseDateBetween(businessUnit, startDate, endDate);
        } else if (businessUnit != null) {
            purchases = purchaseRepository.findByBusinessUnit(businessUnit);
        } else if (startDate != null && endDate != null) {
            purchases = purchaseRepository.findByPurchaseDateBetween(startDate, endDate);
        } else {
            purchases = purchaseRepository.findAll();
        }

        return purchases.stream()
                .map(PurchaseResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a purchase by ID.
     */
    @Transactional(readOnly = true)
    public PurchaseResponseDto getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", id));
        return PurchaseResponseDto.fromEntity(purchase);
    }

    /**
     * Deletes a purchase by ID.
     */
    public void deletePurchase(Long id) {
        if (!purchaseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Purchase", "id", id);
        }
        purchaseRepository.deleteById(id);
    }

    private String generateUniquePurchaseNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String number;
        int attempts = 0;
        do {
            int randomSuffix = ThreadLocalRandom.current().nextInt(1000, 9999);
            number = "PUR-" + datePrefix + "-" + randomSuffix;
            attempts++;
            if (attempts > 50) {
                number = "PUR-" + datePrefix + "-" + (System.currentTimeMillis() % 10000);
                break;
            }
        } while (purchaseRepository.findByPurchaseNumber(number).isPresent());
        return number;
    }
}
