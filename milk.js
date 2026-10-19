/**
 * AMRUTHA FRESH MILK - PAGE SCRIPT (milk.js)
 * 
 * Loads dairy products dynamically from the Spring Boot DAIRY REST API.
 * Handles loading & error states while maintaining the clean visual design.
 * Connects directly to the unified AmruthaCart system.
 */

document.addEventListener('DOMContentLoaded', () => {
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

// Quantity state keyed by product ID
const dairyCardQty = {};

/**
 * Loads dairy products from Spring Boot DAIRY API
 */
async function loadDairyProducts() {
  const container = document.getElementById('milkCatalogGrid');
  if (!container) return;

  // 1. Show Loading State
  container.innerHTML = `
    <div class="api-state-container api-loading-state">
      <div class="api-spinner"></div>
      <p>Loading farm-fresh dairy products from Amrutha backend...</p>
    </div>
  `;

  // 2. Fetch from Backend DAIRY API
  if (typeof AmruthaAPI === 'undefined') {
    renderError(container, 'REST API client module (api.js) not found.');
    return;
  }

  const response = await AmruthaAPI.getProductsByUnit('DAIRY');

  if (response && response.success && response.data && response.data.length > 0) {
    // 3. Render Live Backend Products
    renderDairyGrid(container, response.data);
  } else if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.milkPage && SITE_CONFIG.milkPage.products) {
    // 3. Seamless Fallback for Static GitHub Pages / Offline Showcase
    const fallbackProducts = SITE_CONFIG.milkPage.products.map(p => ({
      id: p.id,
      name: p.name,
      localName: p.localName,
      price: p.price,
      unit: p.unit,
      badge: p.badge,
      imageUrl: p.image,
      description: p.description,
      active: p.status !== 'coming_soon'
    }));
    renderDairyGrid(container, fallbackProducts);
  } else {
    renderError(container, (response && response.error) || 'No active dairy products found.');
  }
}

/**
 * Renders error message with retry button
 */
function renderError(container, message) {
  container.innerHTML = `
    <div class="api-state-container api-error-state">
      <h4>Unable to Connect to Amrutha Backend</h4>
      <p>${escapeHtml(message)}</p>
      <button type="button" class="api-btn-retry" id="btnRetryDairy">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
        Retry Connection
      </button>
    </div>
  `;

  const btnRetry = document.getElementById('btnRetryDairy');
  if (btnRetry) {
    btnRetry.addEventListener('click', () => loadDairyProducts());
  }
}

/**
 * Generates and binds DOM cards for backend products
 */
function renderDairyGrid(container, products) {
  container.innerHTML = products.map(product => {
    dairyCardQty[product.id] = 1;

    const isComingSoon = (product.badge && product.badge.toLowerCase().includes('coming soon'))
      || (product.name && product.name.toLowerCase().includes('paneer') && !product.active);

    const imgSrc = product.imageUrl || 'assets/images/fresh_milk.jpg';
    const badgeText = product.badge || '100% Farm Fresh';
    const formattedPrice = Number(product.price).toFixed(2).replace(/\.00$/, '');

    if (isComingSoon) {
      return `
        <article class="milk-product-card card-coming-soon" id="cardProduct-${product.id}">
          <div class="milk-card-img-wrap">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.name)}" width="400" height="240" loading="lazy">
            <span class="milk-card-badge badge-coming-soon">${escapeHtml(badgeText)}</span>
          </div>

          <div class="milk-card-details">
            <div class="milk-product-header">
              <h2 class="milk-product-name">${escapeHtml(product.name)}</h2>
              ${product.localName ? `<span class="milk-local-name" style="color: #b45309;">${escapeHtml(product.localName)}</span>` : ''}
            </div>

            <p class="milk-product-desc">${escapeHtml(product.description || '')}</p>

            <div class="milk-price-box" style="opacity: 0.9;">
              <div class="price-main-wrap">
                <span class="price-big-number" style="color: #64748b;">₹${formattedPrice}</span>
                <span class="price-per-unit">/ ${escapeHtml(product.unit)}</span>
              </div>
              <span class="sample-tag-badge">Reference Price</span>
            </div>

            <div class="coming-soon-notice-box">
              <strong>⏳ Coming Soon!</strong><br>
              Production is being prepared for your village doorstep delivery soon.
            </div>

            <div class="card-btn-area">
              <button type="button" class="btn btn-outline btn-lg btn-notify-wa" data-name="${escapeHtml(product.name)}" style="width: 100%; border-color: #cbd5e1; color: #475569;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                Notify Me on WhatsApp
              </button>
            </div>
          </div>
        </article>
      `;
    }

    return `
      <article class="milk-product-card" id="cardProduct-${product.id}">
        <div class="milk-card-img-wrap">
          <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.name)}" width="400" height="240" loading="eager">
          <span class="milk-card-badge">${escapeHtml(badgeText)}</span>
        </div>

        <div class="milk-card-details">
          <div class="milk-product-header">
            <h2 class="milk-product-name">${escapeHtml(product.name)}</h2>
            ${product.localName ? `<span class="milk-local-name">${escapeHtml(product.localName)}</span>` : ''}
          </div>

          <p class="milk-product-desc">${escapeHtml(product.description || '')}</p>

          <div class="milk-benefits-list">
            <span class="benefit-tag">Zero Water Added</span>
            <span class="benefit-tag">Tested Fat &amp; SNF</span>
            <span class="benefit-tag">Daily Fresh Milking</span>
          </div>

          <div class="milk-price-box">
            <div class="price-main-wrap">
              <span class="price-big-number">₹${formattedPrice}</span>
              <span class="price-per-unit">/ ${escapeHtml(product.unit)}</span>
            </div>
            <span class="backend-indicator-tag"><span class="backend-indicator-dot"></span> Live API</span>
          </div>

          <!-- Quantity Selector -->
          <div class="qty-selector-container">
            <div class="qty-label-row">
              <span>Select Quantity (${escapeHtml(product.unit)}s):</span>
              <span style="color: var(--text-muted); font-size: 0.82rem;">1 to 25 ${escapeHtml(product.unit)}s</span>
            </div>
            <div class="qty-control-box">
              <button type="button" class="qty-btn" data-product-id="${product.id}" data-action="decrease" aria-label="Decrease quantity">−</button>
              <span class="qty-display-value" id="qtyVal-${product.id}">1 ${escapeHtml(product.unit)}</span>
              <button type="button" class="qty-btn" data-product-id="${product.id}" data-action="increase" aria-label="Increase quantity">+</button>
            </div>
            <div class="item-subtotal-hint" id="itemSubtotal-${product.id}">
              Total: ₹${formattedPrice}
            </div>
          </div>

          <!-- Add to Cart Button -->
          <div class="card-btn-area">
            <button type="button" class="btn btn-milk btn-lg btn-add-dairy" data-product-id="${product.id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Setup event listeners for the dynamically generated cards
  setupDairyCardListeners(products);
}

/**
 * Attaches quantity controls and Add-to-Cart handlers
 */
function setupDairyCardListeners(products) {
  const productMap = {};
  products.forEach(p => productMap[p.id] = p);

  // Quantity - / + buttons
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = btn.getAttribute('data-product-id');
      const action = btn.getAttribute('data-action');
      const product = productMap[pid];
      if (!product) return;

      let currentQty = dairyCardQty[pid] || 1;
      if (action === 'increase' && currentQty < 25) {
        currentQty++;
      } else if (action === 'decrease' && currentQty > 1) {
        currentQty--;
      }
      dairyCardQty[pid] = currentQty;

      // Update card display
      const valEl = document.getElementById(`qtyVal-${pid}`);
      const subtotalEl = document.getElementById(`itemSubtotal-${pid}`);
      if (valEl) {
        valEl.textContent = `${currentQty} ${product.unit}${currentQty > 1 ? 's' : ''}`;
      }
      if (subtotalEl) {
        const subtotal = (currentQty * Number(product.price)).toFixed(2).replace(/\.00$/, '');
        subtotalEl.textContent = `Total: ₹${subtotal}`;
      }
    });
  });

  // Add to Cart buttons
  document.querySelectorAll('.btn-add-dairy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = btn.getAttribute('data-product-id');
      const product = productMap[pid];
      if (!product) return;

      const qty = dairyCardQty[pid] || 1;

      if (typeof AmruthaCart !== 'undefined') {
        AmruthaCart.add({
          id: `dairy-${product.id}`,
          productId: product.id,
          name: product.name,
          category: 'milk',
          size: `1 ${product.unit}`,
          price: Number(product.price),
          qty: qty,
          unit: product.unit,
          image: product.imageUrl || 'assets/images/fresh_milk.jpg'
        });
      }

      // Visual button feedback
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `✓ Added ${qty} to Cart!`;
      btn.classList.add('btn-added-state');

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove('btn-added-state');
      }, 1400);
    });
  });

  // WhatsApp notify for coming soon items
  document.querySelectorAll('.btn-notify-wa').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name') || 'Product';
      const waPhone = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.contact && SITE_CONFIG.contact.whatsapp)
        ? SITE_CONFIG.contact.whatsapp.replace(/\D/g, '')
        : '916304495282';
      window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
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
