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
