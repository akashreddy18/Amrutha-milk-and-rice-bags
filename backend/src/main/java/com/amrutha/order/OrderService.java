package com.amrutha.order;

import com.amrutha.common.BadRequestException;
import com.amrutha.common.ResourceNotFoundException;
import com.amrutha.customer.Customer;
import com.amrutha.customer.CustomerRepository;
import com.amrutha.order.dto.CreateOrderRequestDto;
import com.amrutha.order.dto.OrderItemRequestDto;
import com.amrutha.order.dto.OrderResponseDto;
import com.amrutha.orderitem.OrderItem;
import com.amrutha.product.BusinessUnit;
import com.amrutha.product.Product;
import com.amrutha.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * Service managing customer orders with strict server-side validation,
 * transactional stock deduction, price computation, and status lifecycle.
 */
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    /**
     * Creates a customer order:
     * - Looks up or registers Customer
     * - Validates each product exists and is active
     * - Validates and deducts stock in the current transaction
     * - Computes unitPrice, subtotal, and totalAmount strictly on the server
     * - Assigns BusinessUnit (DAIRY, RICE, or MIXED)
     * - Generates a guaranteed unique order number
     */
    public OrderResponseDto createOrder(CreateOrderRequestDto request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item.");
        }

        // 1. Resolve or create Customer
        String trimmedPhone = request.getCustomerPhone().trim();
        Customer customer = customerRepository.findByPhone(trimmedPhone)
                .orElseGet(() -> {
                    Customer newCust = new Customer();
                    newCust.setName(request.getCustomerName().trim());
                    newCust.setPhone(trimmedPhone);
                    newCust.setAddress(request.getDeliveryAddress().trim());
                    newCust.setDeliverySlot(request.getDeliverySlot());
                    return customerRepository.save(newCust);
                });

        // 2. Prepare Order entity
        Order order = new Order();
        order.setOrderNumber(generateUniqueOrderNumber());
        order.setCustomer(customer);
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerPhone(trimmedPhone);
        order.setDeliveryAddress(request.getDeliveryAddress().trim());
        order.setDeliverySlot(request.getDeliverySlot());
        order.setDeliveryDate(LocalDate.now());
        order.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        order.setStatus(OrderStatus.CONFIRMED);

        BigDecimal serverCalculatedTotal = BigDecimal.ZERO;
        Set<BusinessUnit> detectedUnits = new HashSet<>();

        // 3. Process each line item with strict validation & stock deduction
        for (OrderItemRequestDto itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be at least 1 for all items.");
            }

            // Lookup product from database
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            // Validate active status
            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' (ID: " + product.getId() + ") is currently inactive and cannot be ordered.");
            }

            // Validate sufficient stock
            int availableStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            if (availableStock < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() + "'. Available: "
                        + availableStock + ", requested: " + itemReq.getQuantity());
            }

            // Deduct stock safely within transaction
            product.setStockQuantity(availableStock - itemReq.getQuantity());
            productRepository.save(product);

            // Calculate item price and subtotal strictly from DB price
            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            serverCalculatedTotal = serverCalculatedTotal.add(subtotal);

            // Record business unit
            detectedUnits.add(product.getBusinessUnit());

            // Build OrderItem
            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    product.getName(),
                    product.getUnit(),
                    product.getBusinessUnit(),
                    unitPrice,
                    itemReq.getQuantity()
            );
            order.addItem(orderItem);
        }

        // 4. Set final server-calculated total
        order.setTotalAmount(serverCalculatedTotal);

        // 5. Determine overall order business unit for separate reporting
        if (detectedUnits.size() == 1) {
            order.setBusinessUnit(detectedUnits.iterator().next());
        } else {
            order.setBusinessUnit(BusinessUnit.MIXED);
        }

        Order savedOrder = orderRepository.save(order);
        return OrderResponseDto.fromEntity(savedOrder);
    }

    /**
     * Retrieves all orders, optionally filtered by BusinessUnit and/or OrderStatus.
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrders(BusinessUnit businessUnit, OrderStatus status) {
        List<Order> orders;
        if (businessUnit != null && status != null) {
            orders = orderRepository.findByBusinessUnit(businessUnit).stream()
                    .filter(o -> o.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (businessUnit != null) {
            orders = orderRepository.findByBusinessUnit(businessUnit);
        } else if (status != null) {
            orders = orderRepository.findByStatus(status);
        } else {
            orders = orderRepository.findAll();
        }

        return orders.stream()
                .map(OrderResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves an order by ID.
     */
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return OrderResponseDto.fromEntity(order);
    }

    /**
     * Retrieves an order by unique order number.
     */
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return OrderResponseDto.fromEntity(order);
    }

    /**
     * Retrieves all orders for a customer by phone number.
     */
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByCustomerPhone(String customerPhone) {
        return orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(customerPhone).stream()
                .map(OrderResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Updates order status across lifecycle (PENDING, CONFIRMED, PACKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED).
     * If an order is CANCELLED, previously deducted stock is safely restored to inventory.
     */
    public OrderResponseDto updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == newStatus) {
            return OrderResponseDto.fromEntity(order);
        }

        // If transitioning to CANCELLED, restore stock
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    product.setStockQuantity(currentStock + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return OrderResponseDto.fromEntity(updated);
    }

    /**
     * Generates a unique, readable order number: ORD-YYYYMMDD-XXXXX
     */
    private String generateUniqueOrderNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String orderNumber;
        int attempts = 0;
        do {
            int randomSuffix = ThreadLocalRandom.current().nextInt(10000, 99999);
            orderNumber = "ORD-" + datePrefix + "-" + randomSuffix;
            attempts++;
            if (attempts > 50) {
                orderNumber = "ORD-" + datePrefix + "-" + System.currentTimeMillis() % 100000;
                break;
            }
        } while (orderRepository.findByOrderNumber(orderNumber).isPresent());
        return orderNumber;
    }
}
