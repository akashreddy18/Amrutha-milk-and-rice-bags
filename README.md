# Amrutha Fresh Milk & Amrutha Premium Rice

An enterprise-ready e-commerce and operations platform for an Indian dual-division dairy and rice business. Features customer storefronts, dynamic product catalogs, a unified shopping cart, server-validated order management with transactional stock deduction, secure role-based administrative dashboards, and a managerial financial accounting and P&L module with strict divisional segregation.

---

## 🌿 Brand Offerings & Divisions

- **AMRUTHA FRESH MILK (DAIRY)**: Pure, farm-fresh, unadulterated cow & buffalo milk, natural set curd, desi bilona ghee, and fresh malai paneer with daily morning (5:30 AM – 7:30 AM) and evening (5:00 PM – 7:30 PM) doorstep deliveries.
- **AMRUTHA PREMIUM RICE (RICE)**: Naturally aged (12–18 months) Sona Masoori, Deluxe BPT / Kolam, and Royal Basmati rice packed in standard 5kg, 10kg, and 25kg bags for households, caterers, and bulk buyers.

---

## 🏛️ System Architecture

```
[ Frontend: HTML5 / Vanilla CSS / ES6 JavaScript ] (Port 3000)
    │
    │  REST JSON over HTTP / CORS Protected
    ▼
[ Spring Boot 3 Backend / Java 21 ] (Port 8080)
    ├── Security: Spring Security 6 + BCrypt + Stateless JWT
    ├── Catalog & Inventory: Products, Stock Quantity & Active/Deactivation
    ├── Customer & Orders: Transactional Stock Validation & Unique Order Numbering
    ├── Procurement (COGS): Raw Milk & Paddy Purchases (Farmer/Mill tracking)
    ├── Operations (OPEX): Division-Segregated Expense Vouchers
    └── Financial Analytics: Daily / Monthly / Custom Date Range P&L Reports
    │
    ▼
[ Database Layer: MySQL 8.0 (Production) / H2 In-Memory (Dev/Test) ]
```

---

## 🎨 Frontend Pages & Features

1. **Homepage (`index.html`)**:
   - Dual-brand overview with high-resolution imagery and quick-action navigation.
   - Quality trust badges (100% farm fresh, tested fat/SNF, certified weights).
   - Direct division navigation and contact details.
2. **Amrutha Fresh Milk (`milk.html`)**:
   - Dynamic catalog loading from `GET /api/products?businessUnit=DAIRY`.
   - Real-time morning/evening delivery schedule display.
   - Interactive quantity selector (`+` / `-`) with unit subtotal calculations.
   - Direct integration into the unified shopping cart.
3. **Amrutha Premium Rice (`rice.html`)**:
   - Dynamic catalog loading from `GET /api/products?businessUnit=RICE`.
   - Multi-weight bag size selector (5kg, 10kg, 25kg) with live price calculation.
   - One-click addition to unified shopping cart.
4. **Unified Shopping Cart (`cart.js`)**:
   - Shared cart state across all pages via `localStorage`.
   - Slide-in responsive cart drawer with itemized line items, quantity adjustment, and clear-cart option.
   - Doorstep delivery customer checkout form (Name, Phone, Address, Slot, Notes).
   - Submits directly to `POST /api/orders` with server-side price and stock validation.
   - Displays confirmed order screen with unique order number (`ORD-YYYYMMDD-XXXXX`).
5. **Private Admin Portal (`/admin/login` -> `admin/login.html`)**:
   - Private administrative gateway completely separated from the public customer storefront.
   - Enforces Spring Security 6 authentication using BCrypt password hashing.
   - Upon successful credentials verification, issues a stateless HMAC-SHA256 JWT token and automatically redirects to `/admin/dashboard`.
6. **Private Admin Command Center (`/admin/dashboard` -> `admin/dashboard.html`)**:
   - Protected workspace accessible strictly to authenticated staff with valid JWT bearer tokens.
   - Immediate client-side security guard redirects unauthorized visitors and customers directly to `/admin/login`.
   - Combined business overview for the owner (revenue, orders, inventory alerts).
   - Dedicated Dairy division metrics (milk stock, morning/evening delivery batches).
   - Dedicated Rice division metrics (bag inventory, distribution by bag size).
   - Order fulfillment lifecycle manager (`CONFIRMED` -> `PACKED` -> `OUT_FOR_DELIVERY` -> `DELIVERED` / `CANCELLED`).
   - Catalog & stock editor (add/edit products, toggle availability, quick stock adjustment).
   - **Finances & P&L Statement Tab**: Divisional P&L with strict Dairy vs. Rice segregation, category breakdowns, and transaction ledgers.

---

## 💰 Financial Management & Accounting Rules

The application implements a managerially sound financial management module with strict segregation between Dairy and Rice:

### Documented Accounting Rules:
1. **Revenue Recognition**:
   - Recognized strictly from completed/delivered customer orders (excluding `CANCELLED` orders).
   - For combined customer orders containing both dairy and rice items, individual line items are partitioned to Dairy or Rice based on `item.getBusinessUnit()`.
2. **Cost of Goods Sold (COGS - Purchases)**:
   - Direct raw material procurements are recorded separately in the `Purchase` entity to **prevent double-counting** with operational expenses:
     - **Dairy COGS**: Raw milk procurement from local farmers (Litre basis, fat/SNF tracking).
     - **Rice COGS**: Raw paddy procurement from farmers/mills (75kg bag basis).
3. **Operating Expenses (OPEX - Expenses)**:
   - Operational overheads are recorded in the `Expense` entity with standard division-specific categories:
     - **Dairy Categories**: *Cattle feed*, *Animal care*, *Milk procurement*, *Labour*, *Transport*, *Electricity*, *Equipment*.
     - **Rice Categories**: *Paddy procurement*, *Milling*, *Packaging*, *Labour*, *Transport*, *Storage*, *Electricity*.
4. **Profit Equations**:
   $$\text{Gross Profit} = \text{Revenue} - \text{COGS}$$
   $$\text{Net Operating Profit} = \text{Gross Profit} - \text{OPEX} = \text{Revenue} - (\text{COGS} + \text{OPEX})$$
5. **Incomplete Calculation Protection**:
   - When revenue is ₹0 in a period, calculations are marked incomplete (`isCalculationComplete = false`) and margins are withheld to prevent misleading profit metrics.

---

## ⚙️ Environment-Based Configuration

The backend reads database credentials and security parameters from environment variables with safe defaults:

| Environment Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | HTTP port for Spring Boot backend |
| `SPRING_PROFILES_ACTIVE` | `dev` | Active profile (`dev` uses H2 in-memory, `prod` uses MySQL) |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/amrutha_db...` | Complete JDBC database URL |
| `DB_HOST` | `localhost` | MySQL host (used in default URL) |
| `DB_PORT` | `3306` | MySQL port (used in default URL) |
| `DB_NAME` | `amrutha_db` | MySQL database name |
| `SPRING_DATASOURCE_USERNAME` / `DB_USERNAME` | `root` | MySQL database username |
| `SPRING_DATASOURCE_PASSWORD` / `DB_PASSWORD` | *(empty)* | MySQL database password |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` (dev) / `validate` (prod) | Hibernate schema behavior |
| `JWT_SECRET` | *(64-char key)* | Secret key for signing HMAC-SHA256 JWT tokens |
| `JWT_EXPIRATION_HOURS` | `24` | Token lifespan in hours |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Allowed web origins for CORS |
| `AMRUTHA_ADMIN_PASS` | `AmruthaAdmin@2026` | Initial password for master admin (`admin`) |
| `AMRUTHA_OWNER_PASS` | `AmruthaOwner@2026` | Initial password for business owner (`owner`) |
| `AMRUTHA_DAIRY_PASS` | `DairyAdmin@2026` | Initial password for dairy manager (`dairy_manager`) |
| `AMRUTHA_RICE_PASS` | `RiceAdmin@2026` | Initial password for rice manager (`rice_manager`) |

---

## 🚀 Getting Started Locally

### Prerequisites
- **Java 21 JDK** installed
- **Node.js 18+** installed
- **Maven 3.8+** (or bundled via IntelliJ/IDE)
- **MySQL 8.0+** (optional; local dev profile falls back to H2 in-memory DB)

### Step 1: Start Frontend Server
From the project root:
```bash
node server.js
```
The frontend static server will start on **`http://localhost:3000`**.

### Step 2: Start Spring Boot Backend
In a separate terminal window:
```powershell
$env:JAVA_HOME = "C:\Users\Akash\.jdks\ms-21.0.11"
cd backend
mvn spring-boot:run
```
Or for local zero-setup in-memory database:
```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
mvn spring-boot:run
```
The backend REST API will start on **`http://localhost:8080`**.

---

## 🗄️ Production Database Setup & Migrations

### 1. Initial Schema Migration
To initialize a fresh MySQL database in production, run the migration script [schema-mysql.sql](file:///c:/Users/Akash/Desktop/Amrutha%20milk%20and%20rice%20bags/backend/src/main/resources/schema-mysql.sql):
```bash
mysql -u root -p < backend/src/main/resources/schema-mysql.sql
```

### 2. Running in Production
```bash
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL="jdbc:mysql://db.internal:3306/amrutha_db?useSSL=true&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="amrutha_user"
export SPRING_DATASOURCE_PASSWORD="StrongProductionPasswordHere"
export JWT_SECRET="YourVeryLongAndSecure64CharacterMinimumJWTSecretKeyForProduction2026"
export CORS_ALLOWED_ORIGINS="https://amruthafresh.com,https://admin.amruthafresh.com"

java -jar target/amrutha-backend-1.0.0.jar
```

### 3. Automated Database Backups (mysqldump)
Run a single-transaction backup:
```bash
mysqldump -u amrutha_user -p --single-transaction --quick --lock-tables=false \
  --routines --triggers amrutha_db > /var/backups/amrutha_db_$(date +%Y%m%d_%H%M%S).sql
```

Daily automated cron job (runs every day at 2:00 AM):
```cron
0 2 * * * /usr/bin/mysqldump -u amrutha_user -p'StrongPassword' --single-transaction amrutha_db | gzip > /var/backups/amrutha_$(date +\%F).sql.gz
```

Restore command:
```bash
mysql -u amrutha_user -p amrutha_db < /var/backups/amrutha_db_20261018_020000.sql
```

---

## 📡 API Reference & cURL Examples

### 1. Public Storefront Endpoints

#### Filter Products by Business Unit (DAIRY)
```bash
curl -X GET "http://localhost:8080/api/products?businessUnit=DAIRY" \
  -H "Accept: application/json"
```

#### Filter Products by Business Unit (RICE)
```bash
curl -X GET "http://localhost:8080/api/products?businessUnit=RICE" \
  -H "Accept: application/json"
```

#### Create Customer Order (Server-Side Validated)
```bash
curl -X POST "http://localhost:8080/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Ramesh Sharma",
    "customerPhone": "9876543210",
    "deliveryAddress": "Flat 302, Green Valley Apartments, Market Road",
    "deliverySlot": "Morning (5:30 AM – 7:30 AM)",
    "notes": "Please call before arrival",
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 4, "quantity": 1 }
    ]
  }'
```

#### Look Up Order by Order Number
```bash
curl -X GET "http://localhost:8080/api/orders/number/ORD-20261018-71506" \
  -H "Accept: application/json"
```

---

### 2. Administrative Endpoints (Requires JWT)

#### Admin Login (Obtain Token)
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AmruthaAdmin@2026"
  }'
```

#### Get Daily Financial Report
```bash
curl -X GET "http://localhost:8080/api/admin/finance/daily?date=2026-10-18" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Accept: application/json"
```

#### Get Monthly Financial Report
```bash
curl -X GET "http://localhost:8080/api/admin/finance/monthly?year=2026&month=10" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Accept: application/json"
```

#### Record Operational Expense (OPEX)
```bash
curl -X POST "http://localhost:8080/api/admin/expenses" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessUnit": "DAIRY",
    "expenseDate": "2026-10-18",
    "category": "Cattle feed",
    "description": "Organic Alfalfa Hay Bales",
    "amount": 3200.00,
    "notes": "Voucher #CF-201"
  }'
```

#### Record Raw Material Purchase (COGS)
```bash
curl -X POST "http://localhost:8080/api/admin/purchases" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessUnit": "RICE",
    "purchaseDate": "2026-10-18",
    "supplierName": "Miryalaguda Paddy Producers Co-op",
    "itemDescription": "Raw Paddy 75kg bags (BPT 5204)",
    "quantity": 10.0,
    "unit": "75kg Bag",
    "unitRate": 1800.00,
    "notes": "Moisture content 12%"
  }'
```

---

## 🧪 Verification Record (Actual Executed Tests)

All security, logic, and accounting checks were executed directly on the live environment:

### 1. Maven Backend Test Suite
```
[INFO] Running com.amrutha.AdminSecurityTests (6 tests) -> PASSED
[INFO] Running com.amrutha.AmruthaApplicationTests (9 tests) -> PASSED
[INFO] Running com.amrutha.FinancialManagementTests (11 tests) -> PASSED
[INFO] Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 2. End-to-End System Integration Suite
```
Homepage (index.html)                            [PASS]
Dairy Page (milk.html)                           [PASS]
Rice Page (rice.html)                            [PASS]
Dairy Product Filter (3 products)                [PASS]
Rice Product Filter (3 products)                 [PASS]
Unauthenticated 401 Block                        [PASS]
Invalid Password 401 Block                       [PASS]
Valid Admin Login (JWT Token)                    [PASS]
Customer Order Creation (ORD-20261018-71506)     [PASS]
Stock Deduction (100 to 98)                      [PASS]
Insufficient Stock 400 Block                     [PASS]
Financial Segregation (Dairy vs Rice)            [PASS]
Documented Accounting Rules                      [PASS]
Negative Order Qty 400 Block                     [PASS]
Non-existent Product 404 Block                   [PASS]
Negative Expense Amount 400 Block                [PASS]
=========================================================
ALL VERIFICATION CHECKS PASSED (100% SUCCESS)
```

### 3. Dedicated Admin Portal & Customer Isolation Verification
```
GET /admin/login returns HTTP 200                [PASS]
/admin/login contains Admin Portal Sign In       [PASS]
/admin/login loads /admin/login.js               [PASS]
GET /admin/dashboard returns HTTP 200            [PASS]
/admin/dashboard contains Admin Dashboard        [PASS]
/admin/dashboard contains Security Guard         [PASS]
/admin/dashboard loads /admin/dashboard.js       [PASS]
GET /admin returns 302 Redirect                  [PASS]
/admin redirects to /admin/login                 [PASS]
GET /admin.html returns 302 Redirect             [PASS]
/admin.html redirects to /admin/login            [PASS]
Customer Homepage has NO Staff Portal link       [PASS]
Customer Milk Page has NO Staff Portal link      [PASS]
Customer Rice Page has NO Staff Portal link      [PASS]
Unauthenticated blocked from /admin/finance      [PASS]
Unauthenticated blocked from /admin/orders       [PASS]
Unauthenticated blocked from /admin/dashboard    [PASS]
Invalid admin credentials rejected (HTTP 401)    [PASS]
Admin login succeeds with valid credentials      [PASS]
Admin user authenticated with ROLE_ADMIN         [PASS]
GET /api/auth/me verifies valid admin token      [PASS]
Authenticated GET /admin/dashboard/overview      [PASS]
Authenticated GET /admin/finance/daily           [PASS]
=========================================================
ALL 19 VERIFICATION CHECKS PASSED (100% SUCCESS)
```

---

## 📋 Checklist of Remaining Tasks Before Accepting Real Customer Orders

Before taking the application live for real customers with live transactions, complete the following items:

1. **Online Payment Gateway Integration**:
   - Integrate Razorpay, Cashfree, or UPI QR code gateway.
   - Implement webhook verification for asynchronous payment confirmations.
2. **Transactional SMS & WhatsApp Notifications**:
   - Connect an SMS/WhatsApp gateway (e.g., Twilio, Gupshup, or MSG91) to send order confirmation, dispatch alerts, and morning delivery reminders.
3. **SSL/TLS & Domain Security**:
   - Deploy backend behind a reverse proxy (Nginx / Cloudflare) with HTTPS/SSL certificates.
   - Restrict MySQL port `3306` to localhost/private network only.
4. **FSSAI & Regulatory Compliance**:
   - Add official FSSAI license number and legal manufacturer/packer address to website footer and order receipts.
   - Implement Terms & Conditions, Privacy Policy, and Refund/Cancellation Policy pages.
5. **GST Invoicing & Tax Calculations**:
   - Add GST breakdown (0% on fresh raw milk, standard rate on branded packed products) to order receipts and invoice PDFs.
6. **Delivery Route Optimization**:
   - Implement delivery area/pincode validation during checkout to ensure orders are only accepted within serviceable routes.
7. **Production Database & Automated Backups**:
   - Provision a production MySQL server.
   - Configure off-site daily backups (e.g., AWS S3 or Google Cloud Storage) with automated backup retention policies.
