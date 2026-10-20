package com.amrutha;

import com.amrutha.customer.Customer;
import com.amrutha.customer.CustomerRepository;
import com.amrutha.product.BusinessUnit;
import com.amrutha.product.Product;
import com.amrutha.product.ProductRepository;
import com.amrutha.security.AdminUser;
import com.amrutha.security.AdminUserRepository;
import com.amrutha.security.Role;
import com.amrutha.expense.Expense;
import com.amrutha.expense.ExpenseCategories;
import com.amrutha.expense.ExpenseRepository;
import com.amrutha.order.Order;
import com.amrutha.order.OrderRepository;
import com.amrutha.order.OrderStatus;
import com.amrutha.orderitem.OrderItem;
import com.amrutha.purchase.Purchase;
import com.amrutha.purchase.PurchaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Main Spring Boot Application for Amrutha Fresh Milk & Premium Rice bags.
 */
@SpringBootApplication
public class AmruthaApplication {

    private static final Logger log = LoggerFactory.getLogger(AmruthaApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AmruthaApplication.class, args);
        log.info("=================================================================");
        log.info("  Amrutha Dairy & Rice Backend is running!");
        log.info("  API Base URL: http://localhost:8080/api/products");
        log.info("  Admin Login: http://localhost:8080/api/auth/login");
        log.info("  Admin API: http://localhost:8080/api/admin/dashboard/overview");
        log.info("  Finance API: http://localhost:8080/api/admin/finance/daily");
        log.info("=================================================================");
    }

    /**
     * Seeds initial sample products, customer records, administrator accounts,
     * raw material purchases, and operational expenses if empty.
     */
    @Bean
    public CommandLineRunner seedDatabase(ProductRepository productRepository,
                                          CustomerRepository customerRepository,
                                          AdminUserRepository adminUserRepository,
                                          OrderRepository orderRepository,
                                          PurchaseRepository purchaseRepository,
                                          ExpenseRepository expenseRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin Users with BCrypt encrypted passwords
            if (adminUserRepository.count() == 0) {
                log.info("Seeding initial administrator accounts with BCrypt password hashing...");

                // 1. Master System Administrator
                String adminPass = System.getenv("AMRUTHA_ADMIN_PASS") != null && !System.getenv("AMRUTHA_ADMIN_PASS").isBlank()
                        ? System.getenv("AMRUTHA_ADMIN_PASS") : "AmruthaAdmin@2026";
                adminUserRepository.save(new AdminUser(
                        "admin",
                        passwordEncoder.encode(adminPass),
                        "Amrutha Head Administrator",
                        Role.ROLE_ADMIN
                ));

                // 2. Business Owner (Combined Overview Access)
                String ownerPass = System.getenv("AMRUTHA_OWNER_PASS") != null && !System.getenv("AMRUTHA_OWNER_PASS").isBlank()
                        ? System.getenv("AMRUTHA_OWNER_PASS") : "AmruthaOwner@2026";
                adminUserRepository.save(new AdminUser(
                        "owner",
                        passwordEncoder.encode(ownerPass),
                        "Amrutha Business Owner",
                        Role.ROLE_OWNER
                ));

                // 3. Dairy Operations Manager
                String dairyPass = System.getenv("AMRUTHA_DAIRY_PASS") != null && !System.getenv("AMRUTHA_DAIRY_PASS").isBlank()
                        ? System.getenv("AMRUTHA_DAIRY_PASS") : "DairyAdmin@2026";
                adminUserRepository.save(new AdminUser(
                        "dairy_manager",
                        passwordEncoder.encode(dairyPass),
                        "Dairy Operations Manager",
                        Role.ROLE_DAIRY_ADMIN
                ));

                // 4. Rice Division Manager
                String ricePass = System.getenv("AMRUTHA_RICE_PASS") != null && !System.getenv("AMRUTHA_RICE_PASS").isBlank()
                        ? System.getenv("AMRUTHA_RICE_PASS") : "RiceAdmin@2026";
                adminUserRepository.save(new AdminUser(
                        "rice_manager",
                        passwordEncoder.encode(ricePass),
                        "Rice Division Manager",
                        Role.ROLE_RICE_ADMIN
                ));

                log.info("Initialized {} administrator accounts.", adminUserRepository.count());
            }

            if (productRepository.count() == 0) {
                log.info("Seeding initial Amrutha products for DAIRY and RICE business units...");

                // DAIRY PRODUCTS
                productRepository.save(new Product(
                        "Pure Cow Milk",
                        "(ఆవు పాలు / गाय का दूध)",
                        "100% natural, farm-fresh pure cow milk. Light, easy to digest, and rich in natural calcium. Daily morning & evening milking.",
                        BusinessUnit.DAIRY,
                        new BigDecimal("60.00"),
                        "Litre",
                        "Milk",
                        "Daily Fresh",
                        "assets/images/brand_milk_pouch.jpg"
                ));

                productRepository.save(new Product(
                        "Pure Buffalo Milk",
                        "(గేదె పాలు / भैंस का दूध)",
                        "Thick, high-fat natural buffalo milk (7%+ fat). Gives thick malai and thick curd. Ideal for tea, coffee, and traditional sweets.",
                        BusinessUnit.DAIRY,
                        new BigDecimal("75.00"),
                        "Litre",
                        "Milk",
                        "Thick & Creamy",
                        "assets/images/buffalo_milk.jpg"
                ));

                productRepository.save(new Product(
                        "Fresh Malai Paneer (200g)",
                        "(తాజా మలై పనీర్ / ताजा पनीर)",
                        "Soft, melt-in-mouth cottage cheese crafted from pure whole milk. High in natural protein, spongy texture. 200g vacuum pack.",
                        BusinessUnit.DAIRY,
                        new BigDecimal("90.00"),
                        "200g",
                        "Paneer",
                        "Farm Fresh",
                        "assets/images/fresh_paneer.jpg",
                        80
                ));

                productRepository.save(new Product(
                        "Fresh Malai Paneer (500g)",
                        "(తాజా మలై పనీర్ / ताजा पनीर)",
                        "Soft, melt-in-mouth cottage cheese crafted from pure whole milk. High in natural protein, spongy texture. 500g vacuum pack.",
                        BusinessUnit.DAIRY,
                        new BigDecimal("220.00"),
                        "500g",
                        "Paneer",
                        "Farm Fresh",
                        "assets/images/fresh_paneer.jpg",
                        60
                ));

                productRepository.save(new Product(
                        "Fresh Malai Paneer (1kg)",
                        "(తాజా మలై పనీర్ / ताजा पनीर)",
                        "Soft, melt-in-mouth cottage cheese crafted from pure whole milk. High in natural protein, spongy texture. 1kg vacuum pack.",
                        BusinessUnit.DAIRY,
                        new BigDecimal("430.00"),
                        "1kg",
                        "Paneer",
                        "Farm Fresh",
                        "assets/images/fresh_paneer.jpg",
                        40
                ));

                productRepository.save(new Product(
                        "Pure Desi Ghee (250ml)",
                        "(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)",
                        "Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 250ml glass jar.",
                        BusinessUnit.DAIRY,
                        new BigDecimal("210.00"),
                        "250ml",
                        "Ghee",
                        "Traditional Danedar",
                        "assets/images/fresh_ghee.jpg",
                        75
                ));

                productRepository.save(new Product(
                        "Pure Desi Ghee (500ml)",
                        "(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)",
                        "Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 500ml glass jar.",
                        BusinessUnit.DAIRY,
                        new BigDecimal("410.00"),
                        "500ml",
                        "Ghee",
                        "Traditional Danedar",
                        "assets/images/fresh_ghee.jpg",
                        50
                ));

                productRepository.save(new Product(
                        "Pure Desi Ghee (1 Litre)",
                        "(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)",
                        "Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 1 Litre jar.",
                        BusinessUnit.DAIRY,
                        new BigDecimal("800.00"),
                        "1 Litre",
                        "Ghee",
                        "Traditional Danedar",
                        "assets/images/fresh_ghee.jpg",
                        30
                ));

                // RICE PRODUCTS
                productRepository.save(new Product(
                        "Amrutha Sona Masoori Rice (25kg)",
                        "(సోనా మసూరి బియ్యం / सोना मसूरी चावल)",
                        "Finest medium-slender grain rice aged naturally for 12 to 18 months. Non-sticky, fluffy, and aromatic cooking for daily family meals.",
                        BusinessUnit.RICE,
                        new BigDecimal("1450.00"),
                        "25kg Bag",
                        "Rice",
                        "Aged 12-18 Months",
                        "assets/images/brand_rice_bag.jpg"
                ));

                productRepository.save(new Product(
                        "Amrutha Sona Masoori Rice (50kg)",
                        "(సోనా మసూరి బియ్యం / सोना मसूरी चावल)",
                        "Finest medium-slender grain rice aged naturally for 12 to 18 months. Bulk family & catering standard pack.",
                        BusinessUnit.RICE,
                        new BigDecimal("2850.00"),
                        "50kg Bag",
                        "Rice",
                        "Aged 12-18 Months",
                        "assets/images/brand_rice_bag.jpg"
                ));

                productRepository.save(new Product(
                        "Amrutha Royal Basmati Rice (25kg)",
                        "(రాయల్ బాస్మతి బియ్యం / रॉयल बासमती चावल)",
                        "Exquisite Himalayan aged long-grain basmati rice. Each grain doubles in length without breaking. Perfect for Biryani and Pulao.",
                        BusinessUnit.RICE,
                        new BigDecimal("2400.00"),
                        "25kg Bag",
                        "Rice",
                        "Extra Long Grain",
                        "assets/images/basmati_rice_bag.jpg"
                ));

                productRepository.save(new Product(
                        "Amrutha Deluxe BPT / Kolam Rice (25kg)",
                        "(డీలక్స్ బియ్యం / डीलक्स बीपीटी चावल)",
                        "Silky white fine grain with tender bite. Cleaned, destoned, and naturally aged for delicious everyday meals.",
                        BusinessUnit.RICE,
                        new BigDecimal("1580.00"),
                        "25kg Bag",
                        "Rice",
                        "Silky & Aromatic",
                        "assets/images/kolam_rice_bag.jpg"
                ));

                log.info("Initialized {} sample products.", productRepository.count());
            }

            Customer sampleCustomer = null;
            if (customerRepository.count() == 0) {
                log.info("Seeding sample customer records...");
                sampleCustomer = new Customer(
                        "Ramesh Sharma",
                        "+916304495282",
                        "customer@amrutha.com",
                        "Venkatarampuram Road, Kodad Town - 508206, Telangana",
                        "Morning (5:30 AM – 7:30 AM)",
                        BusinessUnit.DAIRY
                );
                sampleCustomer = customerRepository.save(sampleCustomer);
                log.info("Initialized sample customer: {}", sampleCustomer.getName());
            } else {
                sampleCustomer = customerRepository.findAll().get(0);
            }

            // Seed Sample Purchases (COGS - Raw Materials)
            if (purchaseRepository.count() == 0) {
                log.info("Seeding initial raw material procurement purchases (COGS)...");
                LocalDate today = LocalDate.now();

                // Dairy Purchases
                purchaseRepository.save(new Purchase(
                        "PUR-20261018-0001",
                        "Farmer Krishna Reddy (Guntur)",
                        BusinessUnit.DAIRY,
                        "Morning Pure Cow Milk Procurement (Farm Fresh)",
                        new BigDecimal("250.00"),
                        "Litre",
                        new BigDecimal("42.00"),
                        new BigDecimal("10500.00"),
                        today,
                        "Batch #DF-201, 4.2% Fat, SNF 8.5%"
                ));

                purchaseRepository.save(new Purchase(
                        "PUR-20261018-0002",
                        "Farmer Venkata Rao (Vijayawada)",
                        BusinessUnit.DAIRY,
                        "Morning Buffalo Milk Procurement (7.2% Fat)",
                        new BigDecimal("180.00"),
                        "Litre",
                        new BigDecimal("52.00"),
                        new BigDecimal("9360.00"),
                        today,
                        "Batch #BF-108, Chilled at 4°C"
                ));

                // Rice Purchases
                purchaseRepository.save(new Purchase(
                        "PUR-20261018-0003",
                        "Miryalaguda Paddy Producers Co-op",
                        BusinessUnit.RICE,
                        "Raw Paddy 75kg bags (BPT 5204 Samba Masoori)",
                        new BigDecimal("40.00"),
                        "75kg Bag",
                        new BigDecimal("1750.00"),
                        new BigDecimal("70000.00"),
                        today,
                        "Aged Kharif harvest, 12% moisture certified"
                ));

                purchaseRepository.save(new Purchase(
                        "PUR-20261018-0004",
                        "Nandyal Agro Cultivators",
                        BusinessUnit.RICE,
                        "Raw Sona Masoori Paddy (Grade A)",
                        new BigDecimal("30.00"),
                        "75kg Bag",
                        new BigDecimal("1600.00"),
                        new BigDecimal("48000.00"),
                        today,
                        "Direct farm gate procurement"
                ));

                log.info("Initialized {} sample purchases.", purchaseRepository.count());
            }

            // Seed Sample Operational Expenses (OPEX)
            if (expenseRepository.count() == 0) {
                log.info("Seeding initial operational expenses (OPEX)...");
                LocalDate today = LocalDate.now();

                // DAIRY EXPENSES
                expenseRepository.save(new Expense(
                        "Organic Green Fodder & Feed Supplement",
                        "Monthly silage and mineral blocks for dairy herd",
                        ExpenseCategories.CATTLE_FEED,
                        BusinessUnit.DAIRY,
                        new BigDecimal("4200.00"),
                        today,
                        "Supplied by Agro Nutrients Ltd"
                ));

                expenseRepository.save(new Expense(
                        "Veterinary Health Inspection & Vaccination",
                        "Bi-weekly herd wellness check and deworming by licensed vet",
                        ExpenseCategories.ANIMAL_CARE,
                        BusinessUnit.DAIRY,
                        new BigDecimal("1500.00"),
                        today,
                        "Dr. Prasad (Veterinary Officer)"
                ));

                expenseRepository.save(new Expense(
                        "Daily Farm Milking & Cleaning Staff Wages",
                        "Wages for morning and evening milkers and barn hygienists",
                        ExpenseCategories.LABOUR,
                        BusinessUnit.DAIRY,
                        new BigDecimal("3500.00"),
                        today,
                        "Cash disbursement voucher #D-102"
                ));

                expenseRepository.save(new Expense(
                        "Refrigerated Milk Delivery Van Fuel & Tolls",
                        "Diesel and city route delivery logistics",
                        ExpenseCategories.TRANSPORT,
                        BusinessUnit.DAIRY,
                        new BigDecimal("1850.00"),
                        today,
                        "Vehicle #AP-16-TX-4521"
                ));

                expenseRepository.save(new Expense(
                        "Bulk Milk Chiller (BMC) Power Utility Bill",
                        "Electricity for 2000L cold storage tank maintaining 3°C",
                        ExpenseCategories.ELECTRICITY,
                        BusinessUnit.DAIRY,
                        new BigDecimal("2400.00"),
                        today,
                        "APSPDCL Meter #784512"
                ));

                expenseRepository.save(new Expense(
                        "Stainless Steel Milk Cans & Milking Machine Maintenance",
                        "Replacement rubber liners and food-grade sanitizing detergents",
                        ExpenseCategories.EQUIPMENT,
                        BusinessUnit.DAIRY,
                        new BigDecimal("1200.00"),
                        today,
                        "Dairy Equipments & Spares Guntur"
                ));

                // RICE EXPENSES
                expenseRepository.save(new Expense(
                        "Paddy Hulling, Polishing & Destoning Charges",
                        "Contract milling for 70 quintals at Sri Lakshmi Rice Mill",
                        ExpenseCategories.MILLING,
                        BusinessUnit.RICE,
                        new BigDecimal("6500.00"),
                        today,
                        "Job work invoice #SLM-902"
                ));

                expenseRepository.save(new Expense(
                        "Custom Printed 25kg Non-Woven Laminated Rice Bags",
                        "500 brand packaging bags with Moisture-lock lining",
                        ExpenseCategories.PACKAGING,
                        BusinessUnit.RICE,
                        new BigDecimal("3200.00"),
                        today,
                        "Balaji Polymers Hyderabad"
                ));

                expenseRepository.save(new Expense(
                        "Central Grain Warehouse Monthly Rent & Moisture Control",
                        "Dry storage godown bay 4 rent and pest treatment",
                        ExpenseCategories.STORAGE,
                        BusinessUnit.RICE,
                        new BigDecimal("4000.00"),
                        today,
                        "Godown lease payment for current month"
                ));

                expenseRepository.save(new Expense(
                        "Bag Stacking, Loading & Unloading Porter Wages",
                        "Hamali union charges for truck loading of 25kg bags",
                        ExpenseCategories.LABOUR,
                        BusinessUnit.RICE,
                        new BigDecimal("2800.00"),
                        today,
                        "Hamali Union receipt #H-554"
                ));

                expenseRepository.save(new Expense(
                        "Freight Truck Delivery from Mill to Distribution Hub",
                        "Direct transport for 120 bags of Sona Masoori",
                        ExpenseCategories.TRANSPORT,
                        BusinessUnit.RICE,
                        new BigDecimal("3600.00"),
                        today,
                        "Sri Sai Logistics LR #4401"
                ));

                expenseRepository.save(new Expense(
                        "Rice Grading & Sorter Machine Power Charges",
                        "Three-phase industrial electricity for grain cleaner and color sorter",
                        ExpenseCategories.ELECTRICITY,
                        BusinessUnit.RICE,
                        new BigDecimal("1950.00"),
                        today,
                        "TSSPDCL Commercial Substation"
                ));

                log.info("Initialized {} sample expenses.", expenseRepository.count());
            }

            // Seed Sample Completed Orders if empty, ensuring sales revenue is recognized
            if (orderRepository.count() == 0 && sampleCustomer != null) {
                log.info("Seeding initial completed customer orders for revenue recognition...");
                LocalDate today = LocalDate.now();

                // Order 1: Dairy Delivered Order
                Order dairyOrder = new Order(
                        "ORD-20261018-001",
                        sampleCustomer,
                        BusinessUnit.DAIRY,
                        new BigDecimal("1480.00"),
                        sampleCustomer.getAddress(),
                        "Morning (5:30 AM – 7:30 AM)",
                        today,
                        "Daily subscription milk delivery"
                );
                dairyOrder.setStatus(OrderStatus.DELIVERED);
                dairyOrder.setCustomerName(sampleCustomer.getName());
                dairyOrder.setCustomerPhone(sampleCustomer.getPhone());

                OrderItem dairyItem1 = new OrderItem(dairyOrder, null, "Pure Cow Milk", "Litre",
                        BusinessUnit.DAIRY, new BigDecimal("68.00"), 10);
                OrderItem dairyItem2 = new OrderItem(dairyOrder, null, "Pure Buffalo Milk", "Litre",
                        BusinessUnit.DAIRY, new BigDecimal("80.00"), 10);
                dairyOrder.getItems().add(dairyItem1);
                dairyOrder.getItems().add(dairyItem2);
                orderRepository.save(dairyOrder);

                // Order 2: Rice Delivered Order
                Order riceOrder = new Order(
                        "ORD-20261018-002",
                        sampleCustomer,
                        BusinessUnit.RICE,
                        new BigDecimal("5300.00"),
                        sampleCustomer.getAddress(),
                        "Anytime Delivery",
                        today,
                        "Monthly family rice provision"
                );
                riceOrder.setStatus(OrderStatus.DELIVERED);
                riceOrder.setCustomerName(sampleCustomer.getName());
                riceOrder.setCustomerPhone(sampleCustomer.getPhone());

                OrderItem riceItem1 = new OrderItem(riceOrder, null, "Amrutha Sona Masoori Rice (25kg)", "25kg Bag",
                        BusinessUnit.RICE, new BigDecimal("1450.00"), 2);
                OrderItem riceItem2 = new OrderItem(riceOrder, null, "Amrutha Royal Basmati Rice (25kg)", "25kg Bag",
                        BusinessUnit.RICE, new BigDecimal("2400.00"), 1);
                riceOrder.getItems().add(riceItem1);
                riceOrder.getItems().add(riceItem2);
                orderRepository.save(riceOrder);

                log.info("Initialized {} completed sample orders for financial reporting.", orderRepository.count());
            }
        };
    }
}
