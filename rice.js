/**
 * AMRUTHA PREMIUM RICE - PAGE SCRIPT (rice.js)
 * 
 * Loads rice products dynamically from the Spring Boot RICE REST API.
 * Handles loading & error states while maintaining the royal gold visual design.
 * Connects directly to the unified AmruthaCart system.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadRiceProducts();

  // Mobile Floating Bar Trigger
  const btnFloatingRiceCart = document.getElementById('btnFloatingRiceCart');
  if (btnFloatingRiceCart) {
    btnFloatingRiceCart.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof AmruthaCart !== 'undefined') {
        AmruthaCart.open();
      }
    });
  }
});

// Card state: { [productId]: { size: '25kg', price: 1450, qty: 1 } }
const riceCardState = {};

/**
 * Loads rice products from Spring Boot RICE API
 */
async function loadRiceProducts() {
  const container = document.getElementById('riceCatalogGrid');
  if (!container) return;

  // 1. Show Loading State
  container.innerHTML = `
    <div class="api-state-container api-loading-state rice-theme">
      <div class="api-spinner"></div>
      <p>Loading aged paddy &amp; premium rice varieties from Amrutha backend...</p>
    </div>
  `;

  // 2. Fetch from Backend RICE API
  if (typeof AmruthaAPI === 'undefined') {
    renderRiceError(container, 'REST API client module (api.js) not found.');
    return;
  }

  const response = await AmruthaAPI.getProductsByUnit('RICE');

  if (response && response.success && response.data && response.data.length > 0) {
    // 3. Render Live Backend Rice Products
    renderRiceGrid(container, response.data);
  } else if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.ricePage && SITE_CONFIG.ricePage.products) {
    // 3. Seamless Fallback for Static GitHub Pages / Offline Showcase
    const fallbackProducts = SITE_CONFIG.ricePage.products.map(p => {
      const defaultSize = (p.sizes && p.sizes[0]) || { examplePrice: 1450, size: '25kg' };
      return {
        id: p.id,
        name: p.name,
        localName: p.localName,
        price: defaultSize.examplePrice,
        unit: '25kg Bag',
        badge: p.badge,
        imageUrl: p.image,
        description: p.description,
        active: true
      };
    });
    renderRiceGrid(container, fallbackProducts);
  } else {
    renderRiceError(container, (response && response.error) || 'No active rice products found.');
  }
}

/**
 * Renders error message with retry button
 */
function renderRiceError(container, message) {
  container.innerHTML = `
    <div class="api-state-container api-error-state">
      <h4>Unable to Connect to Amrutha Backend</h4>
      <p>${escapeHtml(message)}</p>
      <button type="button" class="api-btn-retry" id="btnRetryRice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
        Retry Connection
      </button>
    </div>
  `;

  const btnRetry = document.getElementById('btnRetryRice');
  if (btnRetry) {
    btnRetry.addEventListener('click', () => loadRiceProducts());
  }
}

/**
 * Generates and binds DOM cards for rice products
 */
function renderRiceGrid(container, products) {
  container.innerHTML = products.map(product => {
    const basePrice = Number(product.price);
    const defaultUnit = product.unit || '25kg Bag';
    const isStandard25kg = defaultUnit.toLowerCase().includes('25kg');

    // Default state: 25kg pack (or single unit if other)
    riceCardState[product.id] = {
      size: isStandard25kg ? '25kg' : defaultUnit,
      base25kgPrice: basePrice,
      price: basePrice,
      qty: 1
    };

    const imgSrc = product.imageUrl || 'assets/images/premium_rice.jpg';
    const badgeText = product.badge || 'Aged 12-18 Months';

    // Calculate approximate size pricing for convenient 50kg, 10kg & 5kg options if 25kg bag
    const price50kg = Math.round((basePrice * 1.95) / 10) * 10;
    const price10kg = Math.round((basePrice * 0.42) / 10) * 10;
    const price5kg = Math.round((basePrice * 0.22) / 10) * 10;

    return `
      <article class="rice-product-card" id="cardRice-${product.id}">
        <div class="rice-card-img-wrap">
          <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.name)}" width="400" height="250" loading="eager">
          <span class="rice-card-badge">${escapeHtml(badgeText)}</span>
        </div>

        <div class="rice-card-details">
          <div>
            <h2 class="rice-product-name" data-i18n-prod-name="${product.id}">${escapeHtml(product.name)}</h2>
            <span class="rice-local-name" data-i18n-sub="${product.id}" style="${product.localName ? '' : 'display: none;'}">${escapeHtml(product.localName || '')}</span>

            <p class="rice-product-desc">${escapeHtml(product.description || '')}</p>

            <div class="rice-highlights-list">
              <span class="rice-highlight-tag">100% Destoned</span>
              <span class="rice-highlight-tag">Aged Naturally</span>
              <span class="rice-highlight-tag">Fluffy &amp; Non-Sticky</span>
            </div>
          </div>

          ${isStandard25kg ? `
            <!-- Bag Size Selector -->
            <div class="bag-size-selector-block">
              <div class="bag-size-label-row">
                <span>Select Bag Size:</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Standard Pack</span>
              </div>
              <div class="rice-size-buttons-group">
                <button type="button" class="rice-size-btn" data-product-id="${product.id}" data-size="50kg" data-price="${price50kg}">
                  50 kg Bag
                </button>
                <button type="button" class="rice-size-btn active" data-product-id="${product.id}" data-size="25kg" data-price="${basePrice}">
                  25 kg Bag
                </button>
                <button type="button" class="rice-size-btn" data-product-id="${product.id}" data-size="10kg" data-price="${price10kg}">
                  10 kg Bag
                </button>
                <button type="button" class="rice-size-btn" data-product-id="${product.id}" data-size="5kg" data-price="${price5kg}">
                  5 kg Bag
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Price Display -->
          <div class="rice-price-box">
            <div class="price-main-wrap">
              <span class="price-big-gold" id="priceVal-${product.id}">₹${basePrice.toLocaleString('en-IN')}</span>
              <span class="price-per-unit" id="priceUnit-${product.id}">/ ${escapeHtml(defaultUnit)}</span>
            </div>
            <span class="backend-indicator-tag" style="background-color: #fffbeb; color: #92400e; border-color: #fde68a;">
              <span class="backend-indicator-dot" style="background-color: #d97706;"></span> Live API
            </span>
          </div>

          <!-- Quantity Selector -->
          <div class="rice-qty-container">
            <div class="rice-qty-label-row">
              <span>Order Quantity:</span>
              <span style="font-size: 0.82rem; color: var(--text-muted);">1 to 50 Bags</span>
            </div>
            <div class="rice-qty-control-box">
              <button type="button" class="rice-qty-btn" data-product-id="${product.id}" data-action="decrease" aria-label="Decrease quantity">−</button>
              <span class="rice-qty-display" id="qtyDisplay-${product.id}">1 Bag</span>
              <button type="button" class="rice-qty-btn" data-product-id="${product.id}" data-action="increase" aria-label="Increase quantity">+</button>
            </div>
            <div class="item-subtotal-hint" id="riceSubtotal-${product.id}">
              Total: ₹${basePrice.toLocaleString('en-IN')}
            </div>
          </div>

          <!-- Add to Cart Button -->
          <div class="card-btn-area">
            <button type="button" class="btn btn-rice btn-lg btn-add-rice" data-product-id="${product.id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Setup event listeners for the generated cards
  setupRiceCardListeners(products);
}

/**
 * Attaches size selection, quantity changes, and Add-to-Cart handlers
 */
function setupRiceCardListeners(products) {
  const productMap = {};
  products.forEach(p => productMap[p.id] = p);

  // Bag Size buttons (25kg, 10kg, 5kg)
  document.querySelectorAll('.rice-size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = btn.getAttribute('data-product-id');
      const size = btn.getAttribute('data-size');
      const price = parseInt(btn.getAttribute('data-price'), 10);
      const card = btn.closest('.rice-product-card');

      if (!pid || !riceCardState[pid]) return;

      if (card) {
        card.querySelectorAll('.rice-size-btn').forEach(b => b.classList.remove('active'));
      }
      btn.classList.add('active');

      riceCardState[pid].size = size;
      riceCardState[pid].price = price;

      const priceEl = document.getElementById(`priceVal-${pid}`);
      const unitEl = document.getElementById(`priceUnit-${pid}`);
      const subtotalEl = document.getElementById(`riceSubtotal-${pid}`);

      if (priceEl) priceEl.textContent = `₹${price.toLocaleString('en-IN')}`;
      if (unitEl) unitEl.textContent = `/ ${size} Bag`;

      if (subtotalEl) {
        const total = riceCardState[pid].qty * price;
        subtotalEl.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
      }
    });
  });

  // Quantity - / + buttons
  document.querySelectorAll('.rice-qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = btn.getAttribute('data-product-id');
      const action = btn.getAttribute('data-action');
      const state = riceCardState[pid];
      if (!state) return;

      if (action === 'increase' && state.qty < 50) {
        state.qty += 1;
      } else if (action === 'decrease' && state.qty > 1) {
        state.qty -= 1;
      }

      const valEl = document.getElementById(`qtyDisplay-${pid}`);
      const subtotalEl = document.getElementById(`riceSubtotal-${pid}`);

      if (valEl) valEl.textContent = `${state.qty} Bag${state.qty > 1 ? 's' : ''}`;
      if (subtotalEl) {
        const total = state.qty * state.price;
        subtotalEl.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
      }
    });
  });

  // Add to Cart buttons
  document.querySelectorAll('.btn-add-rice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = btn.getAttribute('data-product-id');
      const product = productMap[pid];
      const state = riceCardState[pid];
      if (!product || !state) return;

      if (typeof AmruthaCart !== 'undefined') {
        AmruthaCart.add({
          id: `rice-${product.id}`,
          productId: product.id,
          name: product.name,
          category: 'rice',
          size: `${state.size} Bag`,
          price: state.price,
          qty: state.qty,
          unit: 'Bag',
          image: product.imageUrl || 'assets/images/premium_rice.jpg'
        });
      }

      // Visual button feedback
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `✓ Added ${state.qty} Bag${state.qty > 1 ? 's' : ''}!`;
      btn.classList.add('btn-added-state');

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove('btn-added-state');
      }, 1400);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
