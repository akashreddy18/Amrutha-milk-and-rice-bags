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
