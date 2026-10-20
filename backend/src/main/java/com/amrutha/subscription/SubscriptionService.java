package com.amrutha.subscription;

import com.amrutha.common.BadRequestException;
import com.amrutha.common.ResourceNotFoundException;
import com.amrutha.customer.Customer;
import com.amrutha.customer.CustomerRepository;
import com.amrutha.product.BusinessUnit;
import com.amrutha.subscription.dto.CreateSubscriptionRequestDto;
import com.amrutha.subscription.dto.DailyDemandDto;
import com.amrutha.subscription.dto.SubscriptionResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CustomerRepository customerRepository;
    private final Random random = new Random();

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               CustomerRepository customerRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.customerRepository = customerRepository;
    }

    /**
     * Creates a new customer milk subscription with automatic customer profile resolution,
     * daily volume calculation, price determination, and scheduled delivery window.
     */
    public SubscriptionResponseDto createSubscription(CreateSubscriptionRequestDto request) {
        String trimmedPhone = request.getCustomerPhone().trim();

        // 1. Resolve or register Customer
        Customer customer = customerRepository.findByPhone(trimmedPhone)
                .orElseGet(() -> {
                    Customer newCust = new Customer();
                    newCust.setName(request.getCustomerName().trim());
                    newCust.setPhone(trimmedPhone);
                    newCust.setAddress(request.getDeliveryAddress().trim());
                    newCust.setDeliverySlot(request.getDeliverySlot());
                    newCust.setPreferredBusinessUnit(BusinessUnit.DAIRY);
                    return customerRepository.save(newCust);
                });

        // 2. Validate & Compute Daily Litres
        String qtyStr = request.getDailyQuantity().trim().toLowerCase();
        BigDecimal dailyLitres;
        if (qtyStr.contains("500") || qtyStr.contains("half")) {
            dailyLitres = new BigDecimal("0.50");
        } else if (qtyStr.contains("2")) {
            dailyLitres = new BigDecimal("2.00");
        } else {
            dailyLitres = new BigDecimal("1.00");
        }

        // 3. Compute Daily Rate based on Milk Type
        boolean isBuffalo = request.getMilkType().toLowerCase().contains("buffalo");
        BigDecimal baseRatePerLitre = isBuffalo ? new BigDecimal("75.00") : new BigDecimal("60.00");
        BigDecimal dailyRate = baseRatePerLitre.multiply(dailyLitres).setScale(2, RoundingMode.HALF_UP);

        // 4. Compute Duration & Dates
        int duration = (request.getDurationDays() != null && request.getDurationDays() >= 30) ? 30 : 7;
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().plusDays(1);
        LocalDate endDate = startDate.plusDays(duration - 1);

        BigDecimal totalAmount = dailyRate.multiply(BigDecimal.valueOf(duration)).setScale(2, RoundingMode.HALF_UP);

        // 5. Generate unique subscription number
        String subNumber = generateUniqueSubscriptionNumber();

        Subscription subscription = new Subscription(
                subNumber,
                customer,
                request.getCustomerName().trim(),
                trimmedPhone,
                request.getDeliveryAddress().trim(),
                isBuffalo ? "Pure Buffalo Milk" : "Pure Cow Milk",
                dailyLitres.compareTo(new BigDecimal("0.50")) == 0 ? "500 ml" :
                        (dailyLitres.compareTo(new BigDecimal("2.00")) == 0 ? "2 Litres" : "1 Litre"),
                dailyLitres,
                duration,
                startDate,
                endDate,
                request.getDeliverySlot().trim(),
                dailyRate,
                totalAmount,
                request.getNotes()
        );

        Subscription saved = subscriptionRepository.save(subscription);
        return mapToDto(saved);
    }

    /**
     * Retrieves all subscriptions (active and past) for a specific customer phone.
     */
    @Transactional(readOnly = true)
    public List<SubscriptionResponseDto> getSubscriptionsByCustomerPhone(String phone) {
        String trimmed = phone.trim();
        return subscriptionRepository.findByCustomerPhoneOrderByCreatedAtDesc(trimmed).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Pauses an active subscription (e.g. customer vacation).
     */
    public SubscriptionResponseDto pauseSubscription(Long id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));

        if (sub.getStatus() == SubscriptionStatus.CANCELLED || sub.getStatus() == SubscriptionStatus.COMPLETED) {
            throw new BadRequestException("Cannot pause a " + sub.getStatus() + " subscription.");
        }

        sub.setStatus(SubscriptionStatus.PAUSED);
        sub.setPausedDate(LocalDate.now());
        return mapToDto(subscriptionRepository.save(sub));
    }

    /**
     * Resumes a paused subscription, extending the end date by the days paused.
     */
    public SubscriptionResponseDto resumeSubscription(Long id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));

        if (sub.getStatus() != SubscriptionStatus.PAUSED) {
            throw new BadRequestException("Only PAUSED subscriptions can be resumed.");
        }

        if (sub.getPausedDate() != null) {
            long daysPaused = ChronoUnit.DAYS.between(sub.getPausedDate(), LocalDate.now());
            if (daysPaused > 0) {
                sub.setEndDate(sub.getEndDate().plusDays(daysPaused));
            }
        }

        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setPausedDate(null);
        return mapToDto(subscriptionRepository.save(sub));
    }

    /**
     * Cancels an active or paused subscription.
     */
    public SubscriptionResponseDto cancelSubscription(Long id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));

        sub.setStatus(SubscriptionStatus.CANCELLED);
        return mapToDto(subscriptionRepository.save(sub));
    }

    /**
     * Updates payment status (e.g. marked as PAID upon cash/UPI collection).
     */
    public SubscriptionResponseDto updatePaymentStatus(Long id, String paymentStatus) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));

        sub.setPaymentStatus(paymentStatus.toUpperCase().trim());
        return mapToDto(subscriptionRepository.save(sub));
    }

    /**
     * Lists all subscriptions with optional status, milk type, and slot filtering.
     */
    @Transactional(readOnly = true)
    public List<SubscriptionResponseDto> getAllSubscriptions(SubscriptionStatus status, String milkType, String deliverySlot) {
        List<Subscription> list;
        if (status != null) {
            list = subscriptionRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            list = subscriptionRepository.findAll();
        }

        return list.stream()
                .filter(s -> milkType == null || milkType.isBlank() || s.getMilkType().equalsIgnoreCase(milkType.trim()))
                .filter(s -> deliverySlot == null || deliverySlot.isBlank() || s.getDeliverySlot().toLowerCase().contains(deliverySlot.toLowerCase().trim()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Aggregates daily milk quantity requirements for delivery scheduling & farm procurement.
     */
    @Transactional(readOnly = true)
    public DailyDemandDto getDailyDemand(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<Subscription> activeSubs = subscriptionRepository.findActiveOnDate(targetDate, SubscriptionStatus.ACTIVE);

        DailyDemandDto dto = new DailyDemandDto();
        dto.setForecastDate(targetDate);
        dto.setActiveSubscribersCount(activeSubs.size());

        BigDecimal mCow = BigDecimal.ZERO;
        BigDecimal mBuffalo = BigDecimal.ZERO;
        BigDecimal eCow = BigDecimal.ZERO;
        BigDecimal eBuffalo = BigDecimal.ZERO;

        BigDecimal activeRev = BigDecimal.ZERO;
        BigDecimal paidRev = BigDecimal.ZERO;
        BigDecimal pendingRev = BigDecimal.ZERO;

        for (Subscription sub : activeSubs) {
            boolean isMorning = sub.getDeliverySlot().toLowerCase().contains("morning");
            boolean isCow = sub.getMilkType().toLowerCase().contains("cow");
            BigDecimal qty = sub.getDailyQuantityLitres();

            if (isMorning) {
                if (isCow) mCow = mCow.add(qty);
                else mBuffalo = mBuffalo.add(qty);
            } else {
                if (isCow) eCow = eCow.add(qty);
                else eBuffalo = eBuffalo.add(qty);
            }

            activeRev = activeRev.add(sub.getTotalAmount());
            if ("PAID".equalsIgnoreCase(sub.getPaymentStatus())) {
                paidRev = paidRev.add(sub.getTotalAmount());
            } else {
                pendingRev = pendingRev.add(sub.getTotalAmount());
            }
        }

        dto.setMorningCowLitres(mCow);
        dto.setMorningBuffaloLitres(mBuffalo);
        dto.setMorningTotalLitres(mCow.add(mBuffalo));

        dto.setEveningCowLitres(eCow);
        dto.setEveningBuffaloLitres(eBuffalo);
        dto.setEveningTotalLitres(eCow.add(eBuffalo));

        dto.setTotalCowLitres(mCow.add(eCow));
        dto.setTotalBuffaloLitres(mBuffalo.add(eBuffalo));
        dto.setGrandTotalLitres(mCow.add(mBuffalo).add(eCow).add(eBuffalo));

        dto.setTotalActiveRevenue(activeRev);
        dto.setTotalPaidRevenue(paidRev);
        dto.setTotalPendingRevenue(pendingRev);

        return dto;
    }

    /**
     * Calculates actual recorded subscription revenue for financial statements.
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateRecordedSubscriptionRevenue(LocalDate startDate, LocalDate endDate) {
        List<Subscription> subs = subscriptionRepository.findInDateRange(startDate, endDate);
        return subs.stream()
                .filter(s -> s.getStatus() != SubscriptionStatus.CANCELLED)
                .map(Subscription::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String generateUniqueSubscriptionNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String subNum;
        do {
            int randomSeq = 1000 + random.nextInt(9000);
            subNum = "SUB-" + datePart + "-" + randomSeq;
        } while (subscriptionRepository.findBySubscriptionNumber(subNum).isPresent());
        return subNum;
    }

    private SubscriptionResponseDto mapToDto(Subscription s) {
        SubscriptionResponseDto dto = new SubscriptionResponseDto();
        dto.setId(s.getId());
        dto.setSubscriptionNumber(s.getSubscriptionNumber());
        dto.setCustomerId(s.getCustomer() != null ? s.getCustomer().getId() : null);
        dto.setCustomerName(s.getCustomerName());
        dto.setCustomerPhone(s.getCustomerPhone());
        dto.setDeliveryAddress(s.getDeliveryAddress());
        dto.setMilkType(s.getMilkType());
        dto.setDailyQuantity(s.getDailyQuantity());
        dto.setDailyQuantityLitres(s.getDailyQuantityLitres());
        dto.setDurationDays(s.getDurationDays());
        dto.setStartDate(s.getStartDate());
        dto.setEndDate(s.getEndDate());
        dto.setDeliverySlot(s.getDeliverySlot());
        dto.setDailyRate(s.getDailyRate());
        dto.setTotalAmount(s.getTotalAmount());
        dto.setPaymentStatus(s.getPaymentStatus());
        dto.setStatus(s.getStatus());
        dto.setPausedDate(s.getPausedDate());
        dto.setNotes(s.getNotes());
        dto.setCreatedAt(s.getCreatedAt());

        long daysRemaining = 0;
        if (s.getStatus() == SubscriptionStatus.ACTIVE && s.getEndDate() != null) {
            LocalDate today = LocalDate.now();
            if (!today.isAfter(s.getEndDate())) {
                daysRemaining = ChronoUnit.DAYS.between(today, s.getEndDate()) + 1;
            }
        }
        dto.setDaysRemaining(daysRemaining);

        return dto;
    }
}
