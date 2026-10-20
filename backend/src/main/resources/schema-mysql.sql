-- ===================================================================
-- AMRUTHA DAIRY & RICE - PRODUCTION MYSQL SCHEMA MIGRATION SCRIPT
-- ===================================================================
-- Database: amrutha_db
-- Target: MySQL 8.0+ / MariaDB 10.5+
-- Engine: InnoDB
-- Charset: utf8mb4 (Full Unicode support for Telugu / Hindi text)
-- ===================================================================
--
-- BACKUP & RESTORE INSTRUCTIONS:
--
-- 1. Daily Backup Command:
--    mysqldump -u root -p --single-transaction --quick --lock-tables=false \
--      --routines --triggers amrutha_db > /backups/amrutha_db_$(date +\%Y\%m\%d_\%H\%M\%S).sql
--
-- 2. Restore Backup Command:
--    mysql -u root -p amrutha_db < /backups/amrutha_db_YYYYMMDD_HHMMSS.sql
--
-- 3. Automated Daily Cron (runs daily at 2:00 AM):
--    0 2 * * * /usr/bin/mysqldump -u amrutha_user -p'StrongPassword' --single-transaction amrutha_db | gzip > /backups/amrutha_$(date +\%F).sql.gz
--
-- ===================================================================

CREATE DATABASE IF NOT EXISTS amrutha_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE amrutha_db;

-- -------------------------------------------------------------------
-- 1. ADMIN USERS TABLE (Spring Security & Role-Based Access Control)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hash (strength 10+)',
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(40) NOT NULL COMMENT 'ROLE_ADMIN, ROLE_OWNER, ROLE_DAIRY_ADMIN, ROLE_RICE_ADMIN',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admin_username (username),
    INDEX idx_admin_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 2. PRODUCTS TABLE (Dairy & Rice Catalog with Inventory Tracking)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    local_name VARCHAR(150),
    description TEXT,
    business_unit VARCHAR(20) NOT NULL COMMENT 'DAIRY or RICE',
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL COMMENT 'e.g. Litre, 25kg Bag, 500g',
    stock_quantity INT NOT NULL DEFAULT 50 COMMENT 'Available inventory level',
    category VARCHAR(50),
    badge VARCHAR(50),
    image_url VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_business_unit (business_unit),
    INDEX idx_products_active (active),
    INDEX idx_products_stock (stock_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 3. CUSTOMERS TABLE (Customer CRM with Delivery Slots)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(120),
    address VARCHAR(500),
    delivery_slot VARCHAR(100) COMMENT 'e.g. Morning (5:30 AM – 7:30 AM), Evening (5:00 PM – 7:00 PM)',
    preferred_business_unit VARCHAR(20) COMMENT 'DAIRY or RICE',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 4. CUSTOMER ORDERS TABLE (Fulfillment Lifecycle & Delivery Dates)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(120),
    customer_phone VARCHAR(30),
    business_unit VARCHAR(20) COMMENT 'DAIRY, RICE, or NULL for mixed enterprise orders',
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_address VARCHAR(500),
    delivery_slot VARCHAR(100),
    delivery_date DATE,
    notes VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, CONFIRMED, PACKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_orders_status (status),
    INDEX idx_orders_business_unit (business_unit),
    INDEX idx_orders_delivery_date (delivery_date),
    INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 5. ORDER ITEMS TABLE (Line Items with Business Unit Partitioning)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(150) NOT NULL,
    unit VARCHAR(50),
    business_unit VARCHAR(20) COMMENT 'DAIRY or RICE for revenue partitioning',
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order_items_bu (business_unit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 5B. SUBSCRIPTIONS TABLE (Customer Daily Milk Subscriptions)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address VARCHAR(500) NOT NULL,
    milk_type VARCHAR(50) NOT NULL COMMENT 'Pure Cow Milk or Pure Buffalo Milk',
    daily_quantity VARCHAR(20) NOT NULL COMMENT '500 ml, 1 Litre, 2 Litres',
    daily_quantity_litres DECIMAL(5, 2) NOT NULL,
    duration_days INT NOT NULL COMMENT '7 or 30 days',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    delivery_slot VARCHAR(100) NOT NULL COMMENT 'Morning (5:30 AM – 7:30 AM), Evening (5:00 PM – 7:00 PM)',
    daily_rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, PAID',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, PAUSED, CANCELLED, COMPLETED',
    paused_date DATE,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_sub_customer_phone (customer_phone),
    INDEX idx_sub_status (status),
    INDEX idx_sub_dates (start_date, end_date),
    INDEX idx_sub_slot (delivery_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 6. PURCHASES TABLE (Raw Material Procurement - Cost of Goods Sold)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_name VARCHAR(150) NOT NULL COMMENT 'Farmer name or Rice Mill name',
    business_unit VARCHAR(20) NOT NULL COMMENT 'DAIRY or RICE',
    item_description VARCHAR(200) NOT NULL COMMENT 'e.g. Raw Milk Procurement, Samba Masoori Raw Paddy',
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL COMMENT 'Litre, 75kg Bag, Quintal',
    unit_rate DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_purchases_unit (business_unit),
    INDEX idx_purchases_date (purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 7. EXPENSES TABLE (Operational Expenses - OPEX)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(60) NOT NULL COMMENT 'Cattle feed, Animal care, Labour, Transport, Electricity, Equipment, Milling, Packaging, Storage',
    business_unit VARCHAR(20) NOT NULL COMMENT 'DAIRY or RICE',
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expenses_unit (business_unit),
    INDEX idx_expenses_category (category),
    INDEX idx_expenses_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 8. INITIAL SEED DATA (Products Catalog - Dairy & Rice)
-- -------------------------------------------------------------------
INSERT INTO products (name, local_name, description, business_unit, price, unit, stock_quantity, category, badge, image_url, active)
VALUES
    ('Pure Cow Milk', '(ఆవు పాలు / गाय का दूध)', '100% natural, farm-fresh pure cow milk. Wholesome, light, and easy to digest. Tested for fat & SNF daily. Zero water added.', 'DAIRY', 60.00, 'Litre', 100, 'Milk', 'Daily Fresh', 'assets/images/brand_milk_pouch.jpg', TRUE),
    ('Pure Buffalo Milk', '(గేదె పాలు / भैंस का दूध)', 'Thick, high-fat natural buffalo milk (7%+ fat). Produces thick malai, excellent for tea, coffee, homemade dahi, and ghee.', 'DAIRY', 75.00, 'Litre', 100, 'Milk', 'Thick & Creamy', 'assets/images/buffalo_milk.jpg', TRUE),
    ('Fresh Malai Paneer (200g)', '(తాజా మలై పనీర్ / ताजा पनीर)', 'Soft, melt-in-mouth cottage cheese crafted from 100% whole milk. High in natural protein, spongy texture. 200g vacuum pack.', 'DAIRY', 90.00, '200g', 80, 'Paneer', 'Farm Fresh', 'assets/images/fresh_paneer.jpg', TRUE),
    ('Fresh Malai Paneer (500g)', '(తాజా మలై పనీర్ / ताजा पनीर)', 'Soft, melt-in-mouth cottage cheese crafted from 100% whole milk. High in natural protein, spongy texture. 500g vacuum pack.', 'DAIRY', 220.00, '500g', 60, 'Paneer', 'Farm Fresh', 'assets/images/fresh_paneer.jpg', TRUE),
    ('Fresh Malai Paneer (1kg)', '(తాజా మలై పనీర్ / ताजा पनीर)', 'Soft, melt-in-mouth cottage cheese crafted from 100% whole milk. High in natural protein, spongy texture. 1kg vacuum pack.', 'DAIRY', 430.00, '1kg', 40, 'Paneer', 'Farm Fresh', 'assets/images/fresh_paneer.jpg', TRUE),
    ('Pure Desi Ghee (250ml)', '(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)', 'Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 250ml glass jar.', 'DAIRY', 210.00, '250ml', 75, 'Ghee', 'Traditional Danedar', 'assets/images/fresh_ghee.jpg', TRUE),
    ('Pure Desi Ghee (500ml)', '(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)', 'Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 500ml glass jar.', 'DAIRY', 410.00, '500ml', 50, 'Ghee', 'Traditional Danedar', 'assets/images/fresh_ghee.jpg', TRUE),
    ('Pure Desi Ghee (1 Litre)', '(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)', 'Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 1 Litre jar.', 'DAIRY', 800.00, '1 Litre', 30, 'Ghee', 'Traditional Danedar', 'assets/images/fresh_ghee.jpg', TRUE),
    ('Amrutha Sona Masoori Rice (25kg)', '(సోనా మసూరి బియ్యం / सोना मसूरी चावल)', 'Finest medium-slender grain rice aged naturally for 12 to 18 months. Non-sticky, fluffy, and aromatic cooking for daily meals.', 'RICE', 1450.00, '25kg Bag', 120, 'Rice', 'Aged 12-18 Months', 'assets/images/brand_rice_bag.jpg', TRUE),
    ('Amrutha Sona Masoori Rice (50kg)', '(సోనా మసూరి బియ్యం / सोना मसूरी चावल)', 'Finest medium-slender grain rice aged naturally for 12 to 18 months. Bulk family & catering standard pack.', 'RICE', 2850.00, '50kg Bag', 50, 'Rice', 'Aged 12-18 Months', 'assets/images/brand_rice_bag.jpg', TRUE),
    ('Amrutha Royal Basmati Rice (25kg)', '(రాయల్ బాస్మతి బియ్యం / रॉयल बासमती चावल)', 'Exquisite Himalayan aged long-grain basmati rice. Each grain doubles in length without breaking. Perfect for Biryani and Pulao.', 'RICE', 2400.00, '25kg Bag', 80, 'Rice', 'Extra Long Grain', 'assets/images/basmati_rice_bag.jpg', TRUE),
    ('Amrutha Deluxe BPT / Kolam Rice (25kg)', '(డీలక్స్ బియ్యం / डीलक्स बीपीटी चावल)', 'Silky white fine grain with tender bite. Cleaned, destoned, and naturally aged for delicious everyday meals.', 'RICE', 1580.00, '25kg Bag', 60, 'Rice', 'Silky & Aromatic', 'assets/images/kolam_rice_bag.jpg', TRUE);

