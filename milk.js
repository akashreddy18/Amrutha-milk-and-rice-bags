/**
 * AMRUTHA FRESH MILK & DAIRY - PAGE SCRIPT (milk.js)
 * 
 * Supports Farm-Fresh Milk, Fresh Malai Paneer, and Pure Desi Ghee.
 * Features unit selection (Paneer: 200g, 500g, 1kg; Ghee: 250ml, 500ml, 1L),
 * touch-friendly quantity selectors, live price & subtotal recalculation,
 * and seamless dual-mode operation (Live Spring Boot REST API & offline fallback).
 */

// Master dairy cards state
const dairyState = {
  'cow-milk': {
    id: 'cow-milk',
    productId: 1,
    name: 'Pure Cow Milk',
    unit: '1 Litre',
    unitType: 'Litre',
    price: 60,
    qty: 1,
    image: 'assets/images/brand_milk_pouch.jpg',
    sizes: null
  },
  'buffalo-milk': {
    id: 'buffalo-milk',
    productId: 2,
    name: 'Pure Buffalo Milk',
    unit: '1 Litre',
    unitType: 'Litre',
    price: 75,
    qty: 1,
    image: 'assets/images/buffalo_milk.jpg',
    sizes: null
  },
  'fresh-paneer': {
    id: 'fresh-paneer',
    productId: 3,
    name: 'Fresh Malai Paneer',
    unit: '200 g',
    unitType: 'Pack',
    price: 90,
    qty: 1,
    image: 'assets/images/fresh_paneer.jpg',
    sizes: [
      { size: '200 g', price: 90, productId: 3 },
      { size: '500 g', price: 220, productId: 4 },
      { size: '1 kg', price: 430, productId: 5 }
    ]
  },
  'pure-ghee': {
    id: 'pure-ghee',
    productId: 6,
    name: 'Pure Desi Ghee',
    unit: '250 ml',
    unitType: 'Jar',
    price: 210,
    qty: 1,
    image: 'assets/images/fresh_ghee.jpg',
    sizes: [
      { size: '250 ml', price: 210, productId: 6 },
      { size: '500 ml', price: 410, productId: 7 },
      { size: '1 litre', label: '1 Litre', price: 800, productId: 8 }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Bind events immediately to pre-rendered HTML cards for fast UX
  setupDairyListeners();

  // Load live products from backend (or fallback smoothly)
  loadDairyProducts();

  // Initialize Milk Subscription System
  initSubscriptionBuilder();
  initCustomerPortal();

  // Mobile Floating Bar Trigger
  const btnFloatingViewCart = document.getElementById('btnFloatingViewCart');
  if (btnFloatingViewCart) {
    btnFloatingViewCart.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof AmruthaCart !== 'undefined') {
        AmruthaCart.open();
      }
    });
  }
});

/**
 * Loads dairy products from Spring Boot DAIRY API with fallback
 */
async function loadDairyProducts() {
  const container = document.getElementById('milkCatalogGrid');
  if (!container) return;

  if (typeof AmruthaAPI === 'undefined') {
    // If api.js not present, fallback is already in place via static HTML
    return;
  }

  try {
    const response = await AmruthaAPI.getProductsByUnit('DAIRY');

    if (response && response.success && response.data && response.data.length > 0) {
      // Synchronize backend IDs and prices into dairyState
      syncBackendProducts(response.data);
      // Re-render the grid with live backend data and indicators
      renderDairyGrid(container, response.data);
    }
  } catch (err) {
    console.warn('Backend dairy API unavailable; preserving static catalog view:', err);
  }
}

/**
 * Synchronizes live backend products with dairyState
 */
function syncBackendProducts(backendProducts) {
  backendProducts.forEach(bp => {
    const nameLower = (bp.name || '').toLowerCase();
    const unitLower = (bp.unit || '').toLowerCase();

    if (nameLower.includes('cow milk')) {
      dairyState['cow-milk'].productId = bp.id;
      if (bp.price) dairyState['cow-milk'].price = Number(bp.price);
    } else if (nameLower.includes('buffalo milk')) {
      dairyState['buffalo-milk'].productId = bp.id;
      if (bp.price) dairyState['buffalo-milk'].price = Number(bp.price);
    } else if (nameLower.includes('paneer')) {
      const pSizes = dairyState['fresh-paneer'].sizes;
      pSizes.forEach(s => {
        if (unitLower.includes(s.size.toLowerCase().replace(/\s+/g, ''))) {
          s.productId = bp.id;
          if (bp.price) s.price = Number(bp.price);
        }
      });
      if (unitLower.includes('200g')) {
        dairyState['fresh-paneer'].productId = bp.id;
        if (bp.price) dairyState['fresh-paneer'].price = Number(bp.price);
      }
    } else if (nameLower.includes('ghee')) {
      const gSizes = dairyState['pure-ghee'].sizes;
      gSizes.forEach(s => {
        if (unitLower.includes(s.size.toLowerCase().replace(/\s+/g, ''))) {
          s.productId = bp.id;
          if (bp.price) s.price = Number(bp.price);
        }
      });
      if (unitLower.includes('250ml')) {
        dairyState['pure-ghee'].productId = bp.id;
        if (bp.price) dairyState['pure-ghee'].price = Number(bp.price);
      }
    }
  });
}

/**
 * Renders dairy product cards with live backend indicators
 */
function renderDairyGrid(container, backendProducts) {
  const cardsHtml = `
    <!-- 1. COW MILK -->
    <article class="milk-product-card" id="cardCowMilk">
      <div class="milk-card-img-wrap">
        <img src="assets/images/brand_milk_pouch.jpg" alt="Pure Indian Cow Milk in official Amrutha pouch" width="400" height="240" loading="eager">
        <span class="milk-card-badge">Daily Fresh</span>
      </div>

      <div class="milk-card-details">
        <div class="milk-product-header">
          <h2 class="milk-product-name">Pure Cow Milk</h2>
          <span class="milk-local-name">ఆవు పాలు &bull; गाय का दूध</span>
        </div>

        <p class="milk-product-desc">
          100% natural, pure farm cow milk. Wholesome, light, and easy to digest. Tested for fat &amp; SNF daily. Zero water added, no chemicals.
        </p>

        <div class="milk-benefits-list">
          <span class="benefit-tag">Zero Water Added</span>
          <span class="benefit-tag">Tested Fat &amp; SNF</span>
          <span class="benefit-tag">Fresh Daily Milking</span>
        </div>

        <div class="milk-price-box">
          <div class="price-main-wrap">
            <span class="price-big-number" id="priceDisplay-cow-milk">₹${dairyState['cow-milk'].price}</span>
            <span class="price-per-unit" id="unitDisplay-cow-milk">/ 1 Litre</span>
          </div>
          <span class="backend-indicator-tag"><span class="backend-indicator-dot"></span> Live API</span>
        </div>

        <div class="qty-selector-container">
          <div class="qty-label-row">
            <span>Select Quantity (Litres):</span>
            <span style="color: var(--text-muted); font-size: 0.82rem;">1 to 20 Litres</span>
          </div>
          <div class="qty-control-box">
            <button type="button" class="qty-btn" data-product="cow-milk" data-action="decrease" aria-label="Decrease Cow Milk Quantity">−</button>
            <span class="qty-display-value" id="qtyVal-cow-milk">${dairyState['cow-milk'].qty} Litre</span>
            <button type="button" class="qty-btn" data-product="cow-milk" data-action="increase" aria-label="Increase Cow Milk Quantity">+</button>
          </div>
          <div class="item-subtotal-hint" id="itemSubtotal-cow-milk">
            Total: ₹${dairyState['cow-milk'].price * dairyState['cow-milk'].qty}
          </div>
        </div>

        <div class="card-btn-area">
          <button type="button" class="btn btn-milk btn-lg btn-add-cart" data-product="cow-milk" id="btnAddCowMilk">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </article>

    <!-- 2. BUFFALO MILK -->
    <article class="milk-product-card" id="cardBuffaloMilk">
      <div class="milk-card-img-wrap">
        <img src="assets/images/buffalo_milk.jpg" alt="Rich Indian Buffalo Milk in bottle" width="400" height="240" loading="eager">
        <span class="milk-card-badge">Thick &amp; Creamy</span>
      </div>

      <div class="milk-card-details">
        <div class="milk-product-header">
          <h2 class="milk-product-name">Pure Buffalo Milk</h2>
          <span class="milk-local-name">గేదె పాలు &bull; भैंस का दूध</span>
        </div>

        <p class="milk-product-desc">
          Thick, rich traditional buffalo milk with natural 7%+ fat. Produces thick malai, excellent for tea, coffee, homemade dahi, and golden ghee.
        </p>

        <div class="milk-benefits-list">
          <span class="benefit-tag">High Cream (7%+ Fat)</span>
          <span class="benefit-tag">Thick Dahi &amp; Malai</span>
          <span class="benefit-tag">Pure &amp; Unadulterated</span>
        </div>

        <div class="milk-price-box">
          <div class="price-main-wrap">
            <span class="price-big-number" id="priceDisplay-buffalo-milk">₹${dairyState['buffalo-milk'].price}</span>
            <span class="price-per-unit" id="unitDisplay-buffalo-milk">/ 1 Litre</span>
          </div>
          <span class="backend-indicator-tag"><span class="backend-indicator-dot"></span> Live API</span>
        </div>

        <div class="qty-selector-container">
          <div class="qty-label-row">
            <span>Select Quantity (Litres):</span>
            <span style="color: var(--text-muted); font-size: 0.82rem;">1 to 20 Litres</span>
          </div>
          <div class="qty-control-box">
            <button type="button" class="qty-btn" data-product="buffalo-milk" data-action="decrease" aria-label="Decrease Buffalo Milk Quantity">−</button>
            <span class="qty-display-value" id="qtyVal-buffalo-milk">${dairyState['buffalo-milk'].qty} Litre</span>
            <button type="button" class="qty-btn" data-product="buffalo-milk" data-action="increase" aria-label="Increase Buffalo Milk Quantity">+</button>
          </div>
          <div class="item-subtotal-hint" id="itemSubtotal-buffalo-milk">
            Total: ₹${dairyState['buffalo-milk'].price * dairyState['buffalo-milk'].qty}
          </div>
        </div>

        <div class="card-btn-area">
          <button type="button" class="btn btn-milk btn-lg btn-add-cart" data-product="buffalo-milk" id="btnAddBuffaloMilk">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </article>

    <!-- 3. FRESH MALAI PANEER -->
    <article class="milk-product-card" id="cardPaneer">
      <div class="milk-card-img-wrap">
        <img src="assets/images/fresh_paneer.jpg" alt="Fresh Malai Paneer cubes on banana leaf" width="400" height="240" loading="eager">
        <span class="milk-card-badge">Farm Fresh</span>
      </div>

      <div class="milk-card-details">
        <div class="milk-product-header">
          <h2 class="milk-product-name">Fresh Malai Paneer</h2>
          <span class="milk-local-name">తాజా మలై పనీర్ &bull; ताजा पनीर</span>
        </div>

        <p class="milk-product-desc">
          Soft, melt-in-mouth cottage cheese crafted from 100% whole milk. High in natural protein, spongy texture, zero preservatives. Vacuum packed for freshness.
        </p>

        <div class="milk-benefits-list">
          <span class="benefit-tag">100% Whole Milk</span>
          <span class="benefit-tag">High Protein</span>
          <span class="benefit-tag">Spongy &amp; Soft</span>
        </div>

        <!-- Pack Size Selector -->
        <div class="dairy-unit-selector-block">
          <div class="dairy-unit-label-row">
            <span>Select Pack Size:</span>
            <span style="color: var(--text-muted); font-size: 0.82rem;">Vacuum Sealed</span>
          </div>
          <div class="dairy-unit-buttons-group">
            ${dairyState['fresh-paneer'].sizes.map(s => `
              <button type="button" class="dairy-unit-btn ${dairyState['fresh-paneer'].unit === s.size ? 'active' : ''}" 
                data-product="fresh-paneer" data-unit="${s.size}" data-price="${s.price}">
                ${s.size}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="milk-price-box">
          <div class="price-main-wrap">
            <span class="price-big-number" id="priceDisplay-fresh-paneer">₹${dairyState['fresh-paneer'].price}</span>
            <span class="price-per-unit" id="unitDisplay-fresh-paneer">/ ${dairyState['fresh-paneer'].unit}</span>
          </div>
          <span class="backend-indicator-tag"><span class="backend-indicator-dot"></span> Live API</span>
        </div>

        <div class="qty-selector-container">
          <div class="qty-label-row">
            <span>Select Quantity:</span>
            <span style="color: var(--text-muted); font-size: 0.82rem;">1 to 15 Packs</span>
          </div>
          <div class="qty-control-box">
            <button type="button" class="qty-btn" data-product="fresh-paneer" data-action="decrease" aria-label="Decrease Paneer Quantity">−</button>
            <span class="qty-display-value" id="qtyVal-fresh-paneer">${dairyState['fresh-paneer'].qty} Pack</span>
            <button type="button" class="qty-btn" data-product="fresh-paneer" data-action="increase" aria-label="Increase Paneer Quantity">+</button>
          </div>
          <div class="item-subtotal-hint" id="itemSubtotal-fresh-paneer">
            Total: ₹${dairyState['fresh-paneer'].price * dairyState['fresh-paneer'].qty}
          </div>
        </div>

        <div class="card-btn-area">
          <button type="button" class="btn btn-milk btn-lg btn-add-cart" data-product="fresh-paneer" id="btnAddPaneer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </article>

    <!-- 4. PURE DESI GHEE -->
    <article class="milk-product-card" id="cardGhee">
      <div class="milk-card-img-wrap">
        <img src="assets/images/fresh_ghee.jpg" alt="Pure traditional Indian Desi Ghee in bowl" width="400" height="240" loading="eager">
        <span class="milk-card-badge">Traditional Danedar</span>
      </div>

      <div class="milk-card-details">
        <div class="milk-product-header">
          <h2 class="milk-product-name">Pure Desi Ghee</h2>
          <span class="milk-local-name">స్వచ్ఛమైన దేశీ నెయ్యి &bull; शुद्ध देसी घी</span>
        </div>

        <p class="milk-product-desc">
          Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma, healthy fats, and pure goodness.
        </p>

        <div class="milk-benefits-list">
          <span class="benefit-tag">Golden Danedar</span>
          <span class="benefit-tag">100% Pure Butterfat</span>
          <span class="benefit-tag">Rich Divine Aroma</span>
        </div>

        <!-- Pack Size Selector -->
        <div class="dairy-unit-selector-block">
          <div class="dairy-unit-label-row">
            <span>Select Jar Size:</span>
            <span style="color: var(--text-muted); font-size: 0.82rem;">Glass Sealed</span>
          </div>
          <div class="dairy-unit-buttons-group">
            ${dairyState['pure-ghee'].sizes.map(s => `
              <button type="button" class="dairy-unit-btn ${dairyState['pure-ghee'].unit === s.size ? 'active' : ''}" 
                data-product="pure-ghee" data-unit="${s.size}" data-price="${s.price}">
                ${s.label || s.size}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="milk-price-box">
          <div class="price-main-wrap">
            <span class="price-big-number" id="priceDisplay-pure-ghee">₹${dairyState['pure-ghee'].price}</span>
            <span class="price-per-unit" id="unitDisplay-pure-ghee">/ ${dairyState['pure-ghee'].unit}</span>
          </div>
          <span class="backend-indicator-tag"><span class="backend-indicator-dot"></span> Live API</span>
        </div>

        <div class="qty-selector-container">
          <div class="qty-label-row">
            <span>Select Quantity:</span>
            <span style="color: var(--text-muted); font-size: 0.82rem;">1 to 15 Jars</span>
          </div>
          <div class="qty-control-box">
            <button type="button" class="qty-btn" data-product="pure-ghee" data-action="decrease" aria-label="Decrease Ghee Quantity">−</button>
            <span class="qty-display-value" id="qtyVal-pure-ghee">${dairyState['pure-ghee'].qty} Jar</span>
            <button type="button" class="qty-btn" data-product="pure-ghee" data-action="increase" aria-label="Increase Ghee Quantity">+</button>
          </div>
          <div class="item-subtotal-hint" id="itemSubtotal-pure-ghee">
            Total: ₹${dairyState['pure-ghee'].price * dairyState['pure-ghee'].qty}
          </div>
        </div>

        <div class="card-btn-area">
          <button type="button" class="btn btn-milk btn-lg btn-add-cart" data-product="pure-ghee" id="btnAddGhee">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  `;

  container.innerHTML = cardsHtml;
  setupDairyListeners();
}

/**
 * Attaches event listeners for unit selection, quantity adjustments, and Add to Cart
 */
function setupDairyListeners() {
  // 1. Pack / Jar Unit Selector Buttons (Paneer & Ghee)
  document.querySelectorAll('.dairy-unit-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const prodKey = btn.getAttribute('data-product');
      const unit = btn.getAttribute('data-unit');
      const price = parseFloat(btn.getAttribute('data-price'));

      if (!dairyState[prodKey]) return;

      // Update active state in button group
      const parentGroup = btn.closest('.dairy-unit-buttons-group');
      if (parentGroup) {
        parentGroup.querySelectorAll('.dairy-unit-btn').forEach(b => b.classList.remove('active'));
      }
      btn.classList.add('active');

      // Update state
      dairyState[prodKey].unit = unit;
      dairyState[prodKey].price = price;

      // Find matching size variant's productId if present
      if (dairyState[prodKey].sizes) {
        const foundSize = dairyState[prodKey].sizes.find(s => s.size.toLowerCase() === unit.toLowerCase());
        if (foundSize && foundSize.productId) {
          dairyState[prodKey].productId = foundSize.productId;
        }
      }

      // Update card price display
      const priceEl = document.getElementById(`priceDisplay-${prodKey}`);
      const unitEl = document.getElementById(`unitDisplay-${prodKey}`);
      if (priceEl) priceEl.textContent = `₹${price}`;
      if (unitEl) unitEl.textContent = `/ ${unit}`;

      // Recalculate subtotal
      updateCardSubtotal(prodKey);
    };
  });

  // 2. Quantity - / + Buttons
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const prodKey = btn.getAttribute('data-product') || btn.getAttribute('data-product-id');
      const action = btn.getAttribute('data-action');

      if (!dairyState[prodKey]) return;

      let curQty = dairyState[prodKey].qty || 1;
      if (action === 'increase' && curQty < 25) {
        curQty++;
      } else if (action === 'decrease' && curQty > 1) {
        curQty--;
      }
      dairyState[prodKey].qty = curQty;

      // Update display label
      const valEl = document.getElementById(`qtyVal-${prodKey}`);
      if (valEl) {
        const uType = dairyState[prodKey].unitType || 'Unit';
        valEl.textContent = `${curQty} ${uType}${curQty > 1 ? 's' : ''}`;
      }

      // Recalculate subtotal
      updateCardSubtotal(prodKey);
    };
  });

  // 3. Add to Cart Buttons
  document.querySelectorAll('.btn-add-cart, .btn-add-dairy').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const prodKey = btn.getAttribute('data-product') || btn.getAttribute('data-product-id');
      if (!dairyState[prodKey]) return;

      const itemState = dairyState[prodKey];
      const cleanUnit = itemState.unit.replace(/\s+/g, '').toLowerCase();

      if (typeof AmruthaCart !== 'undefined') {
        AmruthaCart.add({
          id: `dairy-${prodKey}-${cleanUnit}`,
          productId: itemState.productId || 1,
          name: itemState.name,
          category: 'milk',
          size: itemState.unit,
          price: itemState.price,
          qty: itemState.qty,
          unit: `${itemState.unit} ${itemState.unitType}`.trim(),
          image: itemState.image
        });
      }

      // Button feedback
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `✓ Added ${itemState.qty} to Cart!`;
      btn.classList.add('btn-added-state');

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove('btn-added-state');
      }, 1500);
    };
  });
}

/**
 * Updates card subtotal text
 */
function updateCardSubtotal(prodKey) {
  const item = dairyState[prodKey];
  if (!item) return;

  const subtotalEl = document.getElementById(`itemSubtotal-${prodKey}`);
  if (subtotalEl) {
    const total = item.price * item.qty;
    subtotalEl.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
  }
}

/* ==========================================================================
   AMRUTHA MILK SUBSCRIPTION & CUSTOMER PORTAL LOGIC
   ========================================================================== */

const SUB_PRICING = {
  'Cow Milk': {
    '500 ml': 30,
    '1 Litre': 60,
    '2 Litres': 120
  },
  'Buffalo Milk': {
    '500 ml': 38,
    '1 Litre': 75,
    '2 Litres': 150
  }
};

let subBuilderState = {
  variety: 'Cow Milk',
  quantity: '1 Litre',
  durationDays: 30,
  deliverySlot: 'Morning Delivery (5:30 AM – 7:30 AM)',
  startDate: '',
  endDate: '',
  dailyRate: 60,
  totalAmount: 1800
};

/**
 * Initializes the Daily Milk Subscription Builder
 */
function initSubscriptionBuilder() {
  const startDateInput = document.getElementById('subStartDate');
  if (!startDateInput) return;

  // Set default start date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  startDateInput.min = minDateStr;
  startDateInput.value = minDateStr;
  subBuilderState.startDate = minDateStr;

  // Auto-fill customer details from localStorage if previously used
  const savedPhone = localStorage.getItem('amrutha_customer_phone');
  const savedName = localStorage.getItem('amrutha_customer_name');
  const savedAddr = localStorage.getItem('amrutha_customer_address');
  if (savedPhone) {
    const phoneInput = document.getElementById('subCustPhone');
    if (phoneInput) phoneInput.value = savedPhone;
  }
  if (savedName) {
    const nameInput = document.getElementById('subCustName');
    if (nameInput) nameInput.value = savedName;
  }
  if (savedAddr) {
    const addrInput = document.getElementById('subCustAddress');
    if (addrInput) addrInput.value = savedAddr;
  }

  // 1. Variety Selection (Cow vs Buffalo Milk)
  const optCow = document.getElementById('optCowMilk');
  const optBuffalo = document.getElementById('optBuffaloMilk');

  if (optCow) {
    optCow.addEventListener('click', () => {
      subBuilderState.variety = 'Cow Milk';
      optCow.classList.add('selected');
      if (optBuffalo) optBuffalo.classList.remove('selected');
      recalculateSubscription();
    });
  }

  if (optBuffalo) {
    optBuffalo.addEventListener('click', () => {
      subBuilderState.variety = 'Buffalo Milk';
      optBuffalo.classList.add('selected');
      if (optCow) optCow.classList.remove('selected');
      recalculateSubscription();
    });
  }

  // 2. Quantity Selection Pills
  const qtyPills = document.querySelectorAll('#subQtyPills .sub-pill-btn');
  qtyPills.forEach(pill => {
    pill.addEventListener('click', () => {
      qtyPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      subBuilderState.quantity = pill.getAttribute('data-qty');
      recalculateSubscription();
    });
  });

  // 3. Duration Selection Pills (7 Days vs 30 Days)
  const durationPills = document.querySelectorAll('#subDurationPills .sub-pill-btn');
  durationPills.forEach(pill => {
    pill.addEventListener('click', () => {
      durationPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      subBuilderState.durationDays = parseInt(pill.getAttribute('data-duration'), 10) || 30;
      recalculateSubscription();
    });
  });

  // 4. Delivery Slot Buttons
  const slotBtns = document.querySelectorAll('.sub-slot-btn');
  slotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      slotBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      subBuilderState.deliverySlot = btn.getAttribute('data-slot');
      recalculateSubscription();
    });
  });

  // 5. Start Date Change
  startDateInput.addEventListener('change', () => {
    subBuilderState.startDate = startDateInput.value;
    recalculateSubscription();
  });

  // 6. Confirm Subscription Button
  const btnConfirm = document.getElementById('btnConfirmSubscription');
  if (btnConfirm) {
    btnConfirm.addEventListener('click', handleSubscriptionSubmit);
  }

  // Initial Calculation
  recalculateSubscription();
}

/**
 * Live recalculation of subscription pricing and schedule
 */
function recalculateSubscription() {
  const variety = subBuilderState.variety || 'Cow Milk';
  const qty = subBuilderState.quantity || '1 Litre';
  const days = subBuilderState.durationDays || 30;

  // Compute daily rate & total amount
  const rate = (SUB_PRICING[variety] && SUB_PRICING[variety][qty]) ? SUB_PRICING[variety][qty] : 60;
  const total = rate * days;

  subBuilderState.dailyRate = rate;
  subBuilderState.totalAmount = total;

  // Compute End Date
  let startDate = new Date(subBuilderState.startDate || Date.now());
  if (isNaN(startDate.getTime())) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
  }
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (days - 1));

  const startFormatted = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const endFormatted = endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  subBuilderState.endDate = endDate.toISOString().split('T')[0];

  // Update Summary UI
  const sumVariety = document.getElementById('sumVarietyText');
  const sumQty = document.getElementById('sumDailyQtyText');
  const sumRate = document.getElementById('sumDailyRateText');
  const sumDuration = document.getElementById('sumDurationText');
  const sumSlot = document.getElementById('sumSlotText');
  const sumDateRange = document.getElementById('sumDateRangeText');
  const sumTotal = document.getElementById('sumTotalPayable');
  const sumBadge = document.getElementById('sumBadgePlan');

  if (sumVariety) sumVariety.textContent = variety;
  if (sumQty) sumQty.textContent = `${qty} / day`;
  if (sumRate) sumRate.textContent = `₹${rate.toFixed(2)} / day`;
  if (sumDuration) sumDuration.textContent = `${days} Days (${days} Deliveries)`;
  if (sumSlot) sumSlot.textContent = subBuilderState.deliverySlot.includes('Morning') ? '🌅 Morning (5:30 – 7:30 AM)' : '🌇 Evening (5:00 – 7:00 PM)';
  if (sumDateRange) sumDateRange.textContent = `${startFormatted} → ${endFormatted}`;
  if (sumTotal) sumTotal.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (sumBadge) sumBadge.textContent = `${days} Days Plan`;
}

/**
 * Handles Subscription Creation & Submission
 */
async function handleSubscriptionSubmit(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById('subCustName');
  const phoneInput = document.getElementById('subCustPhone');
  const addrInput = document.getElementById('subCustAddress');
  const btn = document.getElementById('btnConfirmSubscription');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const address = addrInput ? addrInput.value.trim() : '';
  const startDate = subBuilderState.startDate;

  if (!name || name.length < 2) {
    alert('Please enter your full customer name.');
    if (nameInput) nameInput.focus();
    return;
  }

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    alert('Please enter a valid 10-digit mobile number.');
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (!address || address.length < 5) {
    alert('Please enter your complete doorstep delivery address / village.');
    if (addrInput) addrInput.focus();
    return;
  }

  if (!startDate) {
    alert('Please select a valid delivery start date.');
    return;
  }

  // Save customer details in localStorage
  localStorage.setItem('amrutha_customer_phone', cleanPhone);
  localStorage.setItem('amrutha_customer_name', name);
  localStorage.setItem('amrutha_customer_address', address);

  // Disable button while processing
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Activating Subscription...</span>';
  }

  const payload = {
    customerName: name,
    customerPhone: cleanPhone,
    deliveryAddress: address,
    milkType: subBuilderState.variety,
    dailyQuantity: subBuilderState.quantity,
    durationDays: subBuilderState.durationDays,
    startDate: startDate,
    deliverySlot: subBuilderState.deliverySlot
  };

  let newSub = null;

  try {
    if (typeof AmruthaAPI !== 'undefined' && AmruthaAPI.createSubscription) {
      const res = await AmruthaAPI.createSubscription(payload);
      if (res && res.success && res.data) {
        newSub = res.data;
      }
    }
  } catch (err) {
    console.warn('Subscription API unavailable; saving locally:', err);
  }

  // Fallback: Store locally if backend is offline
  if (!newSub) {
    const localId = Date.now();
    const subNum = `SUB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    newSub = {
      id: localId,
      subscriptionNumber: subNum,
      customerName: name,
      customerPhone: cleanPhone,
      deliveryAddress: address,
      milkType: subBuilderState.variety,
      dailyQuantity: subBuilderState.quantity,
      dailyQuantityLitres: subBuilderState.quantity.includes('500') ? 0.5 : (subBuilderState.quantity.includes('2') ? 2.0 : 1.0),
      durationDays: subBuilderState.durationDays,
      startDate: startDate,
      endDate: subBuilderState.endDate,
      deliverySlot: subBuilderState.deliverySlot,
      dailyRate: subBuilderState.dailyRate,
      totalAmount: subBuilderState.totalAmount,
      paymentStatus: 'PENDING',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    saveLocalSubscription(newSub);
  }

  // Restore button
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<span>🚀 Confirm &amp; Activate Subscription</span>';
  }

  // Toast notification
  if (typeof showToast === 'function') {
    showToast(`🎉 Subscription ${newSub.subscriptionNumber} activated successfully!`);
  } else {
    alert(`🎉 Subscription ${newSub.subscriptionNumber} activated successfully!`);
  }

  // Open customer portal and show the new subscription
  openCustomerPortal(cleanPhone);
}

/**
 * Saves subscription to localStorage for offline / GitHub Pages mode
 */
function saveLocalSubscription(sub) {
  try {
    const list = getLocalSubscriptions();
    const existingIndex = list.findIndex(s => s.id === sub.id || s.subscriptionNumber === sub.subscriptionNumber);
    if (existingIndex >= 0) {
      list[existingIndex] = sub;
    } else {
      list.unshift(sub);
    }
    localStorage.setItem('amrutha_local_subscriptions', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save subscription locally', e);
  }
}

/**
 * Retrieves local subscriptions from localStorage
 */
function getLocalSubscriptions() {
  try {
    const raw = localStorage.getItem('amrutha_local_subscriptions');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Initializes Customer Portal Modal (My Orders & Subscriptions)
 */
function initCustomerPortal() {
  const modal = document.getElementById('customerPortalModal');
  const btnOpenTop = document.getElementById('btnOpenCustomerPortal');
  const btnManageTop = document.getElementById('btnManageSubTop');
  const btnClose = document.getElementById('btnCloseCustomerPortal');
  const btnLookup = document.getElementById('btnLookupCustomer');
  const phoneInput = document.getElementById('portalPhoneInput');

  if (!modal) return;

  function openPortal() {
    modal.classList.add('open');
    const savedPhone = localStorage.getItem('amrutha_customer_phone');
    if (savedPhone && phoneInput) {
      phoneInput.value = savedPhone;
      loadCustomerPortalData(savedPhone);
    }
  }

  function closePortal() {
    modal.classList.remove('open');
  }

  if (btnOpenTop) btnOpenTop.addEventListener('click', openPortal);
  if (btnManageTop) btnManageTop.addEventListener('click', openPortal);
  if (btnClose) btnClose.addEventListener('click', closePortal);

  // Close when clicking modal backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePortal();
  });

  // Phone Lookup Button
  if (btnLookup) {
    btnLookup.addEventListener('click', () => {
      const p = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
      if (!p || p.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      localStorage.setItem('amrutha_customer_phone', p);
      loadCustomerPortalData(p);
    });
  }

  // Tab Switching inside portal
  const tabs = document.querySelectorAll('.btn-portal-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTab = tab.getAttribute('data-portal-tab');
      const activeContent = document.getElementById('portalTabActiveSubs');
      const pastContent = document.getElementById('portalTabPastSubs');
      const ordersContent = document.getElementById('portalTabRecentOrders');

      if (activeContent) activeContent.style.display = targetTab === 'active-subs' ? 'block' : 'none';
      if (pastContent) pastContent.style.display = targetTab === 'past-subs' ? 'block' : 'none';
      if (ordersContent) ordersContent.style.display = targetTab === 'recent-orders' ? 'block' : 'none';
    });
  });

  window.openCustomerPortal = function (phone) {
    modal.classList.add('open');
    if (phone && phoneInput) {
      phoneInput.value = phone;
      loadCustomerPortalData(phone);
    }
  };
}

/**
 * Loads subscriptions & orders for the specified customer phone
 */
async function loadCustomerPortalData(phone) {
  const activeContainer = document.getElementById('activeSubsListContainer');
  const pastContainer = document.getElementById('pastSubsListContainer');
  const ordersContainer = document.getElementById('myOrdersListContainer');
  const countActiveEl = document.getElementById('countActiveSubs');
  const countPastEl = document.getElementById('countPastSubs');
  const countOrdersEl = document.getElementById('countMyOrders');

  if (activeContainer) activeContainer.innerHTML = '<div style="text-align: center; padding: 24px; color: #165b33;">⏳ Loading your subscription records...</div>';

  let subscriptions = [];
  let orders = [];

  // 1. Fetch Subscriptions from API
  try {
    if (typeof AmruthaAPI !== 'undefined' && AmruthaAPI.getCustomerSubscriptions) {
      const res = await AmruthaAPI.getCustomerSubscriptions(phone);
      if (res && res.success && Array.isArray(res.data)) {
        subscriptions = res.data;
      }
    }
  } catch (err) {
    console.warn('API subscription lookup failed, using local fallback:', err);
  }

  // Merge with local subscriptions
  const localList = getLocalSubscriptions().filter(s => s.customerPhone === phone);
  const existingIds = new Set(subscriptions.map(s => s.id));
  localList.forEach(ls => {
    if (!existingIds.has(ls.id)) subscriptions.push(ls);
  });

  // Seed sample data for preview if phone matches demo numbers
  if (subscriptions.length === 0 && (phone === '9876543210' || phone === '6304495282' || phone === '9123456789')) {
    subscriptions = [
      {
        id: 101,
        subscriptionNumber: 'SUB-20261020-001',
        customerName: 'Ramesh Sharma',
        customerPhone: phone,
        deliveryAddress: 'H.No 3-45, Venkatarampuram Road, Kodad town 508206',
        milkType: 'Cow Milk',
        dailyQuantity: '1 Litre',
        dailyQuantityLitres: 1.0,
        durationDays: 30,
        startDate: '2026-10-21',
        endDate: '2026-11-19',
        deliverySlot: 'Morning Delivery (5:30 AM – 7:30 AM)',
        dailyRate: 60.00,
        totalAmount: 1800.00,
        paymentStatus: 'PAID',
        status: 'ACTIVE'
      }
    ];
  }

  // 2. Fetch Customer Orders from API or Local Storage (GitHub Pages resilient)
  try {
    if (typeof AmruthaAPI !== 'undefined' && AmruthaAPI.getCustomerOrders) {
      const ordRes = await AmruthaAPI.getCustomerOrders(phone);
      if (ordRes && ordRes.success && Array.isArray(ordRes.data)) {
        orders = ordRes.data;
      }
    }
  } catch (err) {
    console.warn('Order lookup failed:', err);
  }

  // Merge with client-side persistent orders (for offline / GitHub Pages mode)
  try {
    const rawLocalOrders = localStorage.getItem('amrutha_local_orders');
    const localOrders = rawLocalOrders ? JSON.parse(rawLocalOrders) : [];
    const cleanLookupPhone = phone ? phone.replace(/\D/g, '') : '';
    const userOrders = localOrders.filter(o => {
      const oPhone = (o.customerPhone || '').replace(/\D/g, '');
      return oPhone && (oPhone === cleanLookupPhone || cleanLookupPhone.endsWith(oPhone) || oPhone.endsWith(cleanLookupPhone));
    });
    const existingOrderNums = new Set(orders.map(o => o.orderNumber));
    userOrders.forEach(lo => {
      if (!existingOrderNums.has(lo.orderNumber)) orders.unshift(lo);
    });
  } catch (e) {
    console.warn('Failed to load local orders in portal:', e);
  }

  // Partition into Active vs Past Subscriptions
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'PAUSED');
  const pastSubs = subscriptions.filter(s => s.status === 'CANCELLED' || s.status === 'COMPLETED');

  if (countActiveEl) countActiveEl.textContent = activeSubs.length;
  if (countPastEl) countPastEl.textContent = pastSubs.length;
  if (countOrdersEl) countOrdersEl.textContent = orders.length;

  renderActiveSubscriptions(activeContainer, activeSubs);
  renderPastSubscriptions(pastContainer, pastSubs);
  renderCustomerOrders(ordersContainer, orders);
}

/**
 * Renders Active Subscriptions with Pause, Resume, and Cancel buttons
 */
function renderActiveSubscriptions(container, subs) {
  if (!container) return;

  if (subs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 16px; color: #64748b;">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🥛</div>
        <h4 style="color: #1e3a29; margin-bottom: 4px;">No Active Milk Subscriptions</h4>
        <p style="font-size: 0.92rem; margin-bottom: 16px;">You don't have any daily deliveries scheduled right now.</p>
        <button type="button" class="btn btn-milk btn-sm" onclick="document.getElementById('customerPortalModal').classList.remove('open'); document.getElementById('subscriptions').scrollIntoView({ behavior: 'smooth' });">
          + Start a New Milk Subscription
        </button>
      </div>
    `;
    return;
  }

  let html = '';
  subs.forEach(s => {
    const isPaused = s.status === 'PAUSED';
    const statusClass = isPaused ? 'status-paused' : 'status-active';
    const statusLabel = isPaused ? '⏸️ PAUSED' : '✓ ACTIVE';

    html += `
      <div class="sub-portal-card" id="subCard-${s.id}">
        <div class="sub-portal-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="sub-number-badge">${escapeSubHtml(s.subscriptionNumber)}</span>
            <span class="sub-status-pill ${statusClass}">${statusLabel}</span>
          </div>
          <span style="font-weight: 800; color: #165b33; font-size: 1.15rem;">₹${Number(s.totalAmount).toFixed(2)}</span>
        </div>

        <div class="sub-portal-details-grid">
          <div class="sub-detail-item">
            <span class="sub-detail-label">Milk Variety &amp; Quantity</span>
            <span class="sub-detail-val">${escapeSubHtml(s.milkType)} &bull; ${escapeSubHtml(s.dailyQuantity)}/day</span>
          </div>
          <div class="sub-detail-item">
            <span class="sub-detail-label">Duration Plan</span>
            <span class="sub-detail-val">${s.durationDays} Days (${escapeSubHtml(s.startDate)} to ${escapeSubHtml(s.endDate)})</span>
          </div>
          <div class="sub-detail-item">
            <span class="sub-detail-label">Preferred Time Slot</span>
            <span class="sub-detail-val">${escapeSubHtml(s.deliverySlot)}</span>
          </div>
          <div class="sub-detail-item">
            <span class="sub-detail-label">Delivery Address</span>
            <span class="sub-detail-val">${escapeSubHtml(s.deliveryAddress)}</span>
          </div>
        </div>

        <div class="sub-portal-actions">
          ${isPaused ? `
            <button type="button" class="btn-sub-resume" onclick="handleResumeSubscription(${s.id})">
              ▶️ Resume Deliveries
            </button>
          ` : `
            <button type="button" class="btn-sub-pause" onclick="handlePauseSubscription(${s.id})">
              ⏸️ Pause Deliveries
            </button>
          `}
          <button type="button" class="btn-sub-cancel" onclick="handleCancelSubscription(${s.id})">
            ✕ Cancel Subscription
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Renders Past (Completed / Cancelled) Subscriptions
 */
function renderPastSubscriptions(container, subs) {
  if (!container) return;

  if (subs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 16px; color: #64748b;">
        No completed or cancelled subscriptions found.
      </div>
    `;
    return;
  }

  let html = '';
  subs.forEach(s => {
    const isCancelled = s.status === 'CANCELLED';
    const statusClass = isCancelled ? 'status-cancelled' : 'status-completed';
    const statusLabel = isCancelled ? '✕ CANCELLED' : '✓ COMPLETED';

    html += `
      <div class="sub-portal-card" style="opacity: 0.85;">
        <div class="sub-portal-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="sub-number-badge">${escapeSubHtml(s.subscriptionNumber)}</span>
            <span class="sub-status-pill ${statusClass}">${statusLabel}</span>
          </div>
          <span style="font-weight: 700; color: #64748b;">₹${Number(s.totalAmount).toFixed(2)}</span>
        </div>

        <div class="sub-portal-details-grid">
          <div class="sub-detail-item">
            <span class="sub-detail-label">Milk Variety &amp; Qty</span>
            <span class="sub-detail-val">${escapeSubHtml(s.milkType)} &bull; ${escapeSubHtml(s.dailyQuantity)}/day</span>
          </div>
          <div class="sub-detail-item">
            <span class="sub-detail-label">Schedule</span>
            <span class="sub-detail-val">${escapeSubHtml(s.startDate)} to ${escapeSubHtml(s.endDate)}</span>
          </div>
          <div class="sub-detail-item">
            <span class="sub-detail-label">Delivery Shift</span>
            <span class="sub-detail-val">${escapeSubHtml(s.deliverySlot)}</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Renders Past Customer Store Orders
 */
function renderCustomerOrders(container, orders) {
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 16px; color: #64748b;">
        No store orders recorded for this mobile number yet.
      </div>
    `;
    return;
  }

  let html = '';
  orders.forEach(o => {
    const itemsText = (o.items || []).map(i => `${escapeSubHtml(i.productName)} (${i.quantity})`).join(', ');

    html += `
      <div class="sub-portal-card">
        <div class="sub-portal-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="sub-number-badge">${escapeSubHtml(o.orderNumber)}</span>
            <span class="sub-status-pill status-active">${escapeSubHtml(o.status)}</span>
          </div>
          <span style="font-weight: 800; color: #165b33; font-size: 1.15rem;">₹${Number(o.totalAmount).toFixed(2)}</span>
        </div>

        <div class="sub-portal-details-grid">
          <div class="sub-detail-item">
            <span class="sub-detail-label">Items</span>
            <span class="sub-detail-val">${itemsText || 'General Order'}</span>
          </div>
          <div class="sub-detail-item">
            <span class="sub-detail-label">Delivery Slot</span>
            <span class="sub-detail-val">${escapeSubHtml(o.deliverySlot || 'Standard')}</span>
          </div>
          <div class="sub-detail-item">
            <span class="sub-detail-label">Delivery Address</span>
            <span class="sub-detail-val">${escapeSubHtml(o.deliveryAddress)}</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Customer Action: Pause Subscription
 */
window.handlePauseSubscription = async function (id) {
  if (!confirm('Are you sure you want to pause your daily milk deliveries? You can resume deliveries anytime.')) {
    return;
  }

  try {
    if (typeof AmruthaAPI !== 'undefined' && AmruthaAPI.pauseSubscription) {
      await AmruthaAPI.pauseSubscription(id);
    }
  } catch (err) {
    console.warn('API pause call failed; updating locally:', err);
  }

  // Update locally
  const list = getLocalSubscriptions();
  const sub = list.find(s => s.id === id);
  if (sub) {
    sub.status = 'PAUSED';
    sub.pausedDate = new Date().toISOString().split('T')[0];
    localStorage.setItem('amrutha_local_subscriptions', JSON.stringify(list));
  }

  const phone = localStorage.getItem('amrutha_customer_phone');
  if (phone) loadCustomerPortalData(phone);
  alert('⏸️ Your subscription deliveries have been paused. You can resume anytime.');
};

/**
 * Customer Action: Resume Subscription
 */
window.handleResumeSubscription = async function (id) {
  try {
    if (typeof AmruthaAPI !== 'undefined' && AmruthaAPI.resumeSubscription) {
      await AmruthaAPI.resumeSubscription(id);
    }
  } catch (err) {
    console.warn('API resume call failed; updating locally:', err);
  }

  // Update locally
  const list = getLocalSubscriptions();
  const sub = list.find(s => s.id === id);
  if (sub) {
    sub.status = 'ACTIVE';
    sub.pausedDate = null;
    localStorage.setItem('amrutha_local_subscriptions', JSON.stringify(list));
  }

  const phone = localStorage.getItem('amrutha_customer_phone');
  if (phone) loadCustomerPortalData(phone);
  alert('▶️ Deliveries resumed! Your daily fresh milk will arrive in your scheduled slot.');
};

/**
 * Customer Action: Cancel Subscription
 */
window.handleCancelSubscription = async function (id) {
  if (!confirm('Are you sure you want to cancel this subscription?')) {
    return;
  }

  try {
    if (typeof AmruthaAPI !== 'undefined' && AmruthaAPI.cancelSubscription) {
      await AmruthaAPI.cancelSubscription(id);
    }
  } catch (err) {
    console.warn('API cancel call failed; updating locally:', err);
  }

  // Update locally
  const list = getLocalSubscriptions();
  const sub = list.find(s => s.id === id);
  if (sub) {
    sub.status = 'CANCELLED';
    localStorage.setItem('amrutha_local_subscriptions', JSON.stringify(list));
  }

  const phone = localStorage.getItem('amrutha_customer_phone');
  if (phone) loadCustomerPortalData(phone);
  alert('✕ Your subscription has been cancelled.');
};

function escapeSubHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
