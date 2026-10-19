/**
 * AMRUTHA - UNIFIED SHOPPING CART SYSTEM (cart.js)
 * 
 * Manages shared cart state across all pages (Homepage, Milk Page, Rice Page).
 * Connects directly to Spring Boot POST /api/orders for real order creation
 * with server-side product and price validation, stock deduction, and unique order numbers.
 */

const AmruthaCart = (function() {
  const STORAGE_KEY = 'amrutha_unified_cart';

  // Read cart from localStorage
  function loadCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
      return {};
    }
  }

  // Save cart to localStorage
  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
    notifyListeners();
  }

  // Event listeners for UI synchronization
  const listeners = [];
  function subscribe(fn) {
    listeners.push(fn);
  }
  function notifyListeners() {
    const summary = getSummary();
    listeners.forEach(fn => fn(summary));
    updateCartDOM();
  }

  /**
   * Add a product to the unified cart
   * @param {Object} item - { id, productId, name, category ('milk'|'rice'), size, price, qty, unit, image }
   */
  function addItem(item) {
    const cart = loadCart();
    const key = `${item.id}_${item.size || 'default'}`;

    // Extract numeric product ID for backend JPA lookup
    const rawId = item.productId !== undefined ? item.productId : item.id;
    const numericId = typeof rawId === 'number' ? rawId : parseInt(String(rawId).replace(/\D/g, ''), 10) || 1;

    if (cart[key]) {
      cart[key].qty += (item.qty || 1);
    } else {
      cart[key] = {
        key: key,
        id: item.id,
        productId: numericId,
        name: item.name,
        category: item.category || 'dairy',
        size: item.size || '',
        price: Number(item.price),
        qty: Number(item.qty || 1),
        unit: item.unit || 'Unit',
        image: item.image || ''
      };
    }

    saveCart(cart);
    showToast(`Added ${item.qty || 1} ${item.unit || ''} of ${item.name} to your cart!`);
    return cart[key];
  }

  /**
   * Update quantity of an item in the cart
   */
  function updateQty(key, newQty) {
    const cart = loadCart();
    if (!cart[key]) return;

    if (newQty <= 0) {
      delete cart[key];
      showToast('Item removed from cart.');
    } else {
      cart[key].qty = Number(newQty);
    }

    saveCart(cart);
  }

  /**
   * Remove an item from the cart
   */
  function removeItem(key) {
    const cart = loadCart();
    if (cart[key]) {
      const name = cart[key].name;
      delete cart[key];
      saveCart(cart);
      showToast(`Removed ${name} from your cart.`);
    }
  }

  /**
   * Clear the entire cart
   */
  function clearCart() {
    saveCart({});
  }

  /**
   * Get calculated summary of all items in the cart
   */
  function getSummary() {
    const cart = loadCart();
    let totalItems = 0;
    let milkTotal = 0;
    let riceTotal = 0;
    let grandTotal = 0;

    const items = Object.values(cart).map(item => {
      const subtotal = item.price * item.qty;
      totalItems += item.qty;
      grandTotal += subtotal;

      if (item.category === 'milk') {
        milkTotal += subtotal;
      } else {
        riceTotal += subtotal;
      }

      return {
        ...item,
        subtotal: subtotal,
        subtotalFormatted: `₹${subtotal.toLocaleString('en-IN')}`
      };
    });

    return {
      items: items,
      totalItems: totalItems,
      milkTotal: milkTotal,
      riceTotal: riceTotal,
      grandTotal: grandTotal,
      grandTotalFormatted: `₹${grandTotal.toLocaleString('en-IN')}`
    };
  }

  /**
   * Initialize Cart Drawer UI Elements
   */
  function initCartUI() {
    let backdrop = document.getElementById('unifiedCartBackdrop');
    let drawer = document.getElementById('unifiedCartDrawer');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'unifiedCartBackdrop';
      backdrop.className = 'unified-cart-backdrop';
      document.body.appendChild(backdrop);
    }

    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = 'unifiedCartDrawer';
      drawer.className = 'unified-cart-drawer';
      drawer.setAttribute('aria-label', 'Shopping Cart');
      drawer.innerHTML = `
        <div class="cart-drawer-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="assets/images/brand_logo_master.svg" alt="AMRUTHA" style="height: 32px; width: auto;">
            <h3 class="cart-drawer-title" style="font-size: 1.05rem; margin: 0; font-weight: 700;">Cart</h3>
          </div>
          <button type="button" class="btn-close-drawer" id="btnCloseUnifiedCart" aria-label="Close Cart">&times;</button>
        </div>

        <div class="cart-drawer-body" id="unifiedCartBody">
          <!-- Dynamic Cart Items / Empty State / Confirmation -->
        </div>

        <div class="cart-drawer-footer" id="unifiedCartFooter">
          <div class="cart-total-line">
            <span class="cart-total-label">Estimated Cart Total:</span>
            <span class="cart-total-amount" id="unifiedGrandTotal">₹0</span>
          </div>

          <!-- Customer Delivery Form -->
          <div class="cart-form-container">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">
              Delivery &amp; Customer Details
            </h4>
            <div class="village-order-form">
              <input type="text" id="unifiedCustName" class="village-form-input" placeholder="Your Full Name (పేరు) *">
              <input type="tel" id="unifiedCustPhone" class="village-form-input" placeholder="Phone Number (ఫోన్ నంబర్) *">
              <input type="text" id="unifiedCustAddress" class="village-form-input" placeholder="Delivery Address / Village (గ్రామం / చిరునామా) *">
              <select id="unifiedDeliverySlot" class="village-form-input">
                <option value="Morning (5:30 AM – 7:30 AM)">Morning Delivery (5:30 AM – 7:30 AM)</option>
                <option value="Evening (5:00 PM – 7:00 PM)">Evening Delivery (5:00 PM – 7:00 PM)</option>
                <option value="Standard Daytime Delivery">Standard Daytime Delivery (For Rice Bags)</option>
              </select>
            </div>
          </div>

          <!-- Checkout Feedback Alert Box -->
          <div id="unifiedCheckoutError" class="checkout-error-banner" style="display: none;"></div>

          <!-- Real Order Submission Button -->
          <button type="button" class="btn btn-order-submit" id="btnPlaceRealOrder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Place Order (Pay on Delivery)
          </button>

          <!-- Secondary WhatsApp Option -->
          <button type="button" class="btn btn-whatsapp btn-sm" style="width: 100%; margin-top: 8px;" id="btnUnifiedCheckout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.972.531 1.77.817 2.781.817 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.771-5.767-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.115-.527-1.815-.752-2.99-2.595-3.08-2.716-.091-.121-.734-.977-.734-1.861s.462-1.319.626-1.485c.165-.166.36-.208.481-.208.12 0 .241.002.346.007.11.005.258-.042.403.308.149.362.511 1.246.556 1.338.045.091.076.198.016.318-.061.121-.091.196-.181.303-.09.106-.189.237-.27.318-.09.091-.184.19-.079.371.105.182.468.772 1.004 1.25.688.613 1.269.803 1.45.894.181.091.286.076.392-.045.105-.122.451-.527.572-.708.12-.182.241-.151.406-.091.165.061 1.045.493 1.226.583.181.091.301.136.346.212.045.076.045.438-.099.843z"></path>
            </svg>
            Send Order via WhatsApp
          </button>

          <div style="text-align: center; margin-top: 8px; font-size: 0.82rem; color: #64748b;">
            Pay upon doorstep delivery with Cash, UPI, or PhonePe. No online prepayment required.
          </div>
        </div>
      `;
      document.body.appendChild(drawer);
    }

    // Bind Close events
    const closeBtn = document.getElementById('btnCloseUnifiedCart');
    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (backdrop) backdrop.onclick = closeDrawer;

    // Bind Real Order placement button
    const placeOrderBtn = document.getElementById('btnPlaceRealOrder');
    if (placeOrderBtn) placeOrderBtn.onclick = handleRealOrderCheckout;

    // Bind WhatsApp checkout button
    const checkoutBtn = document.getElementById('btnUnifiedCheckout');
    if (checkoutBtn) checkoutBtn.onclick = handleWhatsAppCheckout;

    // Hook up trigger buttons on the page
    document.querySelectorAll('[data-action="open-cart"], #btnOpenCart, #btnOpenRiceCart, #navOrderBtn').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
      });
    });

    updateCartDOM();
  }

  function openDrawer() {
    const backdrop = document.getElementById('unifiedCartBackdrop');
    const drawer = document.getElementById('unifiedCartDrawer');
    if (backdrop && drawer) {
      updateCartDOM();
      backdrop.classList.add('open');
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    const backdrop = document.getElementById('unifiedCartBackdrop');
    const drawer = document.getElementById('unifiedCartDrawer');
    if (backdrop && drawer) {
      backdrop.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Render cart items into the drawer
   */
  function updateCartDOM() {
    const summary = getSummary();
    const bodyEl = document.getElementById('unifiedCartBody');
    const footerEl = document.getElementById('unifiedCartFooter');
    const grandTotalEl = document.getElementById('unifiedGrandTotal');

    // Update Header Badges across pages
    document.querySelectorAll('.cart-count-badge, .rice-cart-count-badge').forEach(badge => {
      badge.textContent = summary.totalItems;
      badge.style.display = summary.totalItems > 0 ? 'inline-flex' : 'none';
    });

    // Update Mobile Sticky Bars if present
    const mobileBars = document.querySelectorAll('.mobile-cart-bar, .mobile-rice-cart-bar');
    mobileBars.forEach(bar => {
      if (summary.totalItems > 0) {
        bar.classList.add('visible');
      } else {
        bar.classList.remove('visible');
      }
    });

    const mobileTotals = document.querySelectorAll('#mobileCartTotal, #mobileRiceCartTotal');
    mobileTotals.forEach(el => {
      el.textContent = summary.grandTotalFormatted;
    });

    const mobileCounts = document.querySelectorAll('#mobileCartCount, #mobileRiceCartCount');
    mobileCounts.forEach(el => {
      el.textContent = `${summary.totalItems} item${summary.totalItems === 1 ? '' : 's'}`;
    });

    if (!bodyEl) return;

    // Render Empty State or Items List
    if (summary.totalItems === 0) {
      if (footerEl) footerEl.style.display = 'none';

      bodyEl.innerHTML = `
        <div class="empty-cart-view">
          <div class="empty-cart-icon">🛒</div>
          <h4 class="empty-cart-title">Your Cart is Currently Empty</h4>
          <p class="empty-cart-desc">
            You haven't added any milk or rice products yet. Choose pure farm fresh milk or premium aged rice bags to get started!
          </p>
          <div class="empty-cart-actions">
            <a href="milk.html" class="btn btn-milk btn-sm" onclick="AmruthaCart.close();">
              🥛 Explore Fresh Milk
            </a>
            <a href="rice.html" class="btn btn-rice btn-sm" onclick="AmruthaCart.close();">
              🌾 Explore Premium Rice
            </a>
          </div>
        </div>
      `;
    } else {
      if (footerEl) footerEl.style.display = 'block';
      if (grandTotalEl) grandTotalEl.textContent = summary.grandTotalFormatted;

      let html = '<div class="cart-items-wrapper">';

      summary.items.forEach(item => {
        const isMilk = item.category === 'milk';
        const badgeColor = isMilk ? 'var(--milk-green)' : 'var(--rice-gold)';
        const badgeBg = isMilk ? 'var(--milk-green-light)' : 'var(--rice-gold-light)';
        const categoryLabel = isMilk ? '🥛 Fresh Milk' : '🌾 Premium Rice';

        html += `
          <div class="cart-product-row">
            <div class="cart-row-left">
              ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-thumb-img">` : ''}
              <div class="cart-row-details">
                <div class="cart-category-tag" style="background-color: ${badgeBg}; color: ${badgeColor};">
                  ${categoryLabel}
                </div>
                <h5 class="cart-item-title">${escapeHtml(item.name)}</h5>
                <div class="cart-item-price-info">
                  ${item.size ? `<span>Pack: <strong>${escapeHtml(item.size)}</strong></span> &bull; ` : ''}
                  <span>Price: ₹${item.price.toLocaleString('en-IN')} / ${escapeHtml(item.unit)}</span>
                </div>
              </div>
            </div>

            <div class="cart-row-right">
              <!-- Quantity Controls -->
              <div class="cart-qty-pill">
                <button type="button" class="cart-qty-btn-action" data-cart-key="${item.key}" data-action="minus" aria-label="Decrease quantity">−</button>
                <span class="cart-qty-text-display">${item.qty}</span>
                <button type="button" class="cart-qty-btn-action" data-cart-key="${item.key}" data-action="plus" aria-label="Increase quantity">+</button>
              </div>

              <!-- Subtotal -->
              <div class="cart-subtotal-display">
                <div class="cart-subtotal-label">Subtotal</div>
                <div class="cart-subtotal-val">₹${item.subtotal.toLocaleString('en-IN')}</div>
              </div>

              <!-- Remove Item Button -->
              <button type="button" class="btn-remove-item" data-cart-key="${item.key}" title="Remove item from cart" aria-label="Remove ${escapeHtml(item.name)}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Remove</span>
              </button>
            </div>
          </div>
        `;
      });

      html += '</div>';
      bodyEl.innerHTML = html;

      // Bind quantity + / - buttons inside cart
      bodyEl.querySelectorAll('.cart-qty-btn-action').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-cart-key');
          const action = btn.getAttribute('data-action');
          const cart = loadCart();
          if (cart[key]) {
            if (action === 'plus') {
              updateQty(key, cart[key].qty + 1);
            } else if (action === 'minus') {
              updateQty(key, cart[key].qty - 1);
            }
          }
        });
      });

      // Bind Remove item buttons
      bodyEl.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-cart-key');
          removeItem(key);
        });
      });
    }
  }

  /**
   * Handle Real Order Placement via Spring Boot REST API
   * (Submits to POST /api/orders with server-side validation & calculation)
   */
  async function handleRealOrderCheckout(e) {
    if (e) e.preventDefault();
    const summary = getSummary();
    const errorBox = document.getElementById('unifiedCheckoutError');
    const submitBtn = document.getElementById('btnPlaceRealOrder');

    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.innerHTML = '';
    }

    if (summary.totalItems === 0) {
      showCheckoutError('Your cart is empty! Please add products before placing an order.');
      return;
    }

    const name = document.getElementById('unifiedCustName')?.value.trim();
    const phone = document.getElementById('unifiedCustPhone')?.value.trim();
    const address = document.getElementById('unifiedCustAddress')?.value.trim();
    const slot = document.getElementById('unifiedDeliverySlot')?.value || 'Morning (5:30 AM – 7:30 AM)';

    if (!name || name.length < 2) {
      showCheckoutError('Please enter your full name.');
      document.getElementById('unifiedCustName')?.focus();
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      showCheckoutError('Please enter a valid phone number (at least 10 digits).');
      document.getElementById('unifiedCustPhone')?.focus();
      return;
    }

    if (!address || address.length < 5) {
      showCheckoutError('Please enter your complete delivery address / village.');
      document.getElementById('unifiedCustAddress')?.focus();
      return;
    }

    if (typeof AmruthaAPI === 'undefined') {
      showCheckoutError('Order service connection unavailable. Please ensure Spring Boot is running on port 8080.');
      return;
    }

    // Set loading state on button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="api-spinner" style="width: 18px; height: 18px; border-width: 2px; border-top-color: #ffffff;"></div>
        Placing Order...
      `;
    }

    const orderPayload = {
      customerName: name,
      customerPhone: phone,
      deliveryAddress: address,
      deliverySlot: slot,
      notes: "Online order via Amrutha website",
      items: summary.items.map(item => ({
        productId: item.productId || parseInt(String(item.id).replace(/\D/g, ''), 10) || 1,
        quantity: item.qty
      }))
    };

    const res = await AmruthaAPI.createOrder(orderPayload);

    // Reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Place Order (Pay on Delivery)
      `;
    }

    if (!res.success || !res.data) {
      showCheckoutError(res.error || 'Failed to place order. Please try again.');
      return;
    }

    // SUCCESS: Clear the local cart and render the confirmation screen
    clearCart();
    renderOrderConfirmation(res.data);
  }

  function showCheckoutError(msg) {
    const errorBox = document.getElementById('unifiedCheckoutError');
    if (errorBox) {
      errorBox.style.display = 'flex';
      errorBox.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink: 0; margin-top: 1px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>${escapeHtml(msg)}</span>
      `;
    } else {
      alert(msg);
    }
  }

  /**
   * Render Order Confirmation View inside the drawer
   */
  function renderOrderConfirmation(order) {
    const bodyEl = document.getElementById('unifiedCartBody');
    const footerEl = document.getElementById('unifiedCartFooter');
    if (footerEl) footerEl.style.display = 'none';

    if (!bodyEl) return;

    const formattedTotal = Number(order.totalAmount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const itemsSummary = (order.items || []).map(i => `
      <div class="order-meta-line">
        <span>${escapeHtml(i.productName)} (${i.quantity} × ₹${Number(i.unitPrice).toFixed(2)})</span>
        <strong>₹${Number(i.subtotal).toFixed(2)}</strong>
      </div>
    `).join('');

    bodyEl.innerHTML = `
      <div class="order-confirmation-box">
        <img src="assets/images/brand_logo_master.svg" alt="AMRUTHA" style="height: 40px; width: auto; margin-bottom: 4px;">
        <div class="order-conf-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h3 class="order-conf-title">Order Confirmed!</h3>

        <div class="order-conf-num-box">
          <div class="order-conf-label">Your Order Number</div>
          <div class="order-conf-number">${escapeHtml(order.orderNumber)}</div>
        </div>

        <div class="order-conf-meta-grid">
          <div class="order-meta-line">
            <span>Status:</span>
            <strong style="color: var(--milk-green); text-transform: uppercase;">${escapeHtml(order.status)}</strong>
          </div>
          <div class="order-meta-line">
            <span>Customer:</span>
            <strong>${escapeHtml(order.customerName)} (${escapeHtml(order.customerPhone)})</strong>
          </div>
          <div class="order-meta-line">
            <span>Delivery To:</span>
            <span style="text-align: right; max-width: 60%;">${escapeHtml(order.deliveryAddress)}</span>
          </div>
          <div class="order-meta-line">
            <span>Timing Slot:</span>
            <strong>${escapeHtml(order.deliverySlot || 'Standard')}</strong>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 4px 0;">
          ${itemsSummary}
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 4px 0;">
          <div class="order-meta-line" style="font-size: 1.05rem;">
            <strong>Server Verified Total:</strong>
            <strong style="color: #15803d;">₹${formattedTotal}</strong>
          </div>
        </div>

        <p class="order-conf-notice">
          Thank you! Your order has been placed successfully in our system.
          Our delivery team is preparing your package.
          <strong>Payment will be collected at your doorstep (Cash / UPI / PhonePe).</strong>
        </p>

        <button type="button" class="btn btn-milk btn-lg" style="width: 100%; max-width: 320px;" id="btnDoneShopping">
          ✓ Continue Shopping
        </button>
      </div>
    `;

    const doneBtn = document.getElementById('btnDoneShopping');
    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        closeDrawer();
        updateCartDOM();
      });
    }
  }

  /**
   * Handle WhatsApp Order Dispatch
   */
  function handleWhatsAppCheckout(e) {
    if (e) e.preventDefault();
    const summary = getSummary();

    if (summary.totalItems === 0) {
      showCheckoutError('Your cart is empty! Please add items before sending on WhatsApp.');
      return;
    }

    const custName = document.getElementById('unifiedCustName')?.value.trim() || 'Customer';
    const custPhone = document.getElementById('unifiedCustPhone')?.value.trim() || 'Not specified';
    const custAddress = document.getElementById('unifiedCustAddress')?.value.trim() || 'Not specified';
    const deliverySlot = document.getElementById('unifiedDeliverySlot')?.value || 'Morning Delivery (5:30 AM – 7:30 AM)';

    const milkItems = summary.items.filter(i => i.category === 'milk');
    const riceItems = summary.items.filter(i => i.category === 'rice');

    let itemsText = '';

    if (milkItems.length > 0) {
      itemsText += `\n*🥛 AMRUTHA FRESH MILK ITEMS:*\n`;
      milkItems.forEach(i => {
        itemsText += `• ${i.name} (${i.size || '1L'}): ${i.qty} ${i.unit} × ₹${i.price} = ₹${i.subtotal.toLocaleString('en-IN')}\n`;
      });
    }

    if (riceItems.length > 0) {
      itemsText += `\n*🌾 AMRUTHA PREMIUM RICE ITEMS:*\n`;
      riceItems.forEach(i => {
        itemsText += `• ${i.name} (${i.size} Bag): ${i.qty} Bag${i.qty > 1 ? 's' : ''} × ₹${i.price.toLocaleString('en-IN')} = ₹${i.subtotal.toLocaleString('en-IN')}\n`;
      });
    }

    const message = 
`*NEW ORDER - AMRUTHA DAIRY & RICE*
----------------------------------------
*Customer Name:* ${custName}
*Phone Number:* ${custPhone}
*Delivery Address:* ${custAddress}
*Preferred Timing:* ${deliverySlot}
----------------------------------------
*ORDER DETAILS:*
${itemsText}
----------------------------------------
*FINAL CART TOTAL:* ${summary.grandTotalFormatted}
*(Payment upon Doorstep Delivery)*
----------------------------------------
Please confirm my order delivery. Thank you!`;

    const phone = '919876543210';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showToast('Opening WhatsApp to place your order...');
  }

  // Toast Notification
  function showToast(msg) {
    let toast = document.getElementById('amruthaSiteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'amruthaSiteToast';
      toast.className = 'toast toast-cart';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
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

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartUI);
  } else {
    initCartUI();
  }

  return {
    add: addItem,
    update: updateQty,
    remove: removeItem,
    clear: clearCart,
    getSummary: getSummary,
    open: openDrawer,
    close: closeDrawer,
    subscribe: subscribe
  };
})();

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AmruthaCart;
}
