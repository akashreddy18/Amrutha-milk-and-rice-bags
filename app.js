/**
 * AMRUTHA - MAIN APPLICATION SCRIPT
 * 
 * Reads settings from config.js and binds them to the DOM.
 * To change brand names, taglines, or products, edit config.js.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure config is loaded
  if (typeof SITE_CONFIG === 'undefined') {
    console.error('SITE_CONFIG not found. Please ensure config.js is loaded before app.js.');
    return;
  }

  // 1. Hydrate Brand Texts & Taglines Across Homepage
  hydrateBrandData();

  // 2. Render Product Catalogs from Config
  renderProductCatalogs();

  // 3. Setup Button Event Handlers
  setupActionButtons();

  // 4. Setup Contact Form Handler
  setupContactForm();
});

/**
 * Hydrates all placeholders with values from SITE_CONFIG
 */
function hydrateBrandData() {
  // Brand Name
  document.querySelectorAll('[data-bind="brandName"]').forEach(el => {
    el.textContent = SITE_CONFIG.brandName;
  });

  // Tagline ("Pure Quality, Every Day.")
  document.querySelectorAll('[data-bind="tagline"]').forEach(el => {
    el.textContent = SITE_CONFIG.tagline;
  });

  // Short Description
  document.querySelectorAll('[data-bind="shortDescription"]').forEach(el => {
    el.textContent = SITE_CONFIG.shortDescription;
  });

  // Milk Card Information
  const milk = SITE_CONFIG.divisions.milk;
  document.querySelectorAll('[data-bind="milkBrandName"]').forEach(el => {
    el.textContent = milk.brandName;
  });
  document.querySelectorAll('[data-bind="milkTagline"]').forEach(el => {
    el.textContent = milk.tagline;
  });
  document.querySelectorAll('[data-bind="milkBadge"]').forEach(el => {
    el.textContent = milk.badge;
  });
  document.querySelectorAll('[data-bind="btnExploreMilk"]').forEach(el => {
    el.textContent = SITE_CONFIG.buttons.exploreMilk;
  });

  // Rice Card Information
  const rice = SITE_CONFIG.divisions.rice;
  document.querySelectorAll('[data-bind="riceBrandName"]').forEach(el => {
    el.textContent = rice.brandName;
  });
  document.querySelectorAll('[data-bind="riceTagline"]').forEach(el => {
    el.textContent = rice.tagline;
  });
  document.querySelectorAll('[data-bind="riceBadge"]').forEach(el => {
    el.textContent = rice.badge;
  });
  document.querySelectorAll('[data-bind="btnExploreRice"]').forEach(el => {
    el.textContent = SITE_CONFIG.buttons.exploreRice;
  });

  // Contact Us Button Text
  document.querySelectorAll('[data-bind="btnContactUs"]').forEach(el => {
    el.textContent = SITE_CONFIG.buttons.contactUs;
  });

  // Contact Details
  document.querySelectorAll('[data-bind="contactPhone"]').forEach(el => {
    el.textContent = SITE_CONFIG.contact.phone;
    if (el.tagName === 'A') el.href = SITE_CONFIG.contact.phoneHref;
  });
  document.querySelectorAll('[data-bind="contactWhatsapp"]').forEach(el => {
    el.textContent = SITE_CONFIG.contact.whatsapp;
    if (el.tagName === 'A') el.href = SITE_CONFIG.contact.whatsappHref;
  });
  document.querySelectorAll('[data-bind="contactAddress"]').forEach(el => {
    el.textContent = SITE_CONFIG.contact.address;
  });
  document.querySelectorAll('[data-bind="milkTimings"]').forEach(el => {
    el.textContent = SITE_CONFIG.contact.timings.milk;
  });
  document.querySelectorAll('[data-bind="depotTimings"]').forEach(el => {
    el.textContent = SITE_CONFIG.contact.timings.depot;
  });

  // Footer Copyright & Tagline
  document.querySelectorAll('[data-bind="footerTagline"]').forEach(el => {
    el.textContent = `${SITE_CONFIG.brandName} — ${SITE_CONFIG.tagline}`;
  });
  document.querySelectorAll('[data-bind="copyrightText"]').forEach(el => {
    el.textContent = SITE_CONFIG.footer.copyrightText;
  });
}

/**
 * Renders product grids dynamically from Spring Boot REST API
 */
async function renderProductCatalogs() {
  const milkGrid = document.getElementById('milkProductsGrid');
  const riceGrid = document.getElementById('riceProductsGrid');

  // Load DAIRY products
  if (milkGrid) {
    loadHomepageCategory(milkGrid, 'DAIRY', 'milk-border');
  }

  // Load RICE products
  if (riceGrid) {
    loadHomepageCategory(riceGrid, 'RICE', 'rice-border');
  }
}

async function loadHomepageCategory(container, businessUnit, borderClass) {
  // 1. Loading State
  container.innerHTML = `
    <div class="api-state-container api-loading-state ${businessUnit === 'RICE' ? 'rice-theme' : ''}">
      <div class="api-spinner"></div>
      <p>Loading ${businessUnit.toLowerCase()} products from Amrutha backend...</p>
    </div>
  `;

  let productsToRender = [];

  if (typeof AmruthaAPI !== 'undefined') {
    const res = await AmruthaAPI.getProductsByUnit(businessUnit);
    if (res && res.success && res.data && res.data.length > 0) {
      productsToRender = res.data;
    }
  }

  // Graceful fallback for static GitHub Pages / offline mode
  if (productsToRender.length === 0 && typeof SITE_CONFIG !== 'undefined') {
    if (businessUnit === 'DAIRY' && SITE_CONFIG.milkPage && SITE_CONFIG.milkPage.products) {
      productsToRender = SITE_CONFIG.milkPage.products.map(p => ({
        name: p.name,
        localName: p.localName,
        badge: p.badge,
        description: p.description,
        price: p.price,
        unit: p.unit
      }));
    } else if (businessUnit === 'RICE' && SITE_CONFIG.ricePage && SITE_CONFIG.ricePage.products) {
      productsToRender = SITE_CONFIG.ricePage.products.map(p => {
        const defSize = (p.sizes && p.sizes.find(s => s.size === '25kg')) || (p.sizes && p.sizes[0]);
        return {
          name: p.name,
          localName: p.localName,
          badge: p.badge,
          description: p.description,
          price: defSize ? defSize.examplePrice : 1450,
          unit: defSize ? `${defSize.size} Bag` : '25kg Bag'
        };
      });
    }
  }

  if (productsToRender.length === 0) {
    renderGridError(container, businessUnit, `No active ${businessUnit} products found`, borderClass);
    return;
  }

  // 2. Render Products
  container.innerHTML = productsToRender.map(p => `
    <div class="item-card ${borderClass}">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <h4 class="item-name">${escapeHtml(p.name)}</h4>
          ${p.badge ? `<span style="font-size: 0.72rem; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${escapeHtml(p.badge)}</span>` : ''}
        </div>
        ${p.localName ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">${escapeHtml(p.localName)}</div>` : ''}
        <p class="item-desc" style="margin-top: 6px;">${escapeHtml(p.description || '')}</p>
      </div>
      <div class="item-meta">
        <span class="item-price">₹${Number(p.price).toFixed(2).replace(/\.00$/, '')}</span>
        <span class="item-size">/ ${escapeHtml(p.unit)}</span>
      </div>
    </div>
  `).join('');
}

function renderGridError(container, businessUnit, errorMsg, borderClass) {
  container.innerHTML = `
    <div class="api-state-container api-error-state">
      <h4>Unable to load ${businessUnit.toLowerCase()} products</h4>
      <p>${escapeHtml(errorMsg)}</p>
      <button type="button" class="api-btn-retry" onclick="loadHomepageCategory(document.getElementById('${container.id}'), '${businessUnit}', '${borderClass}')">
        ↻ Retry
      </button>
    </div>
  `;
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

/**
 * Sets up button listeners for smooth section scrolling and action handlers
 */
function setupActionButtons() {
  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/**
 * Handles the contact inquiry form with chip selectors, validation, and confirmation state
 */
function setupContactForm() {
  const form = document.getElementById('quickInquiryForm');
  const successCard = document.getElementById('inquirySuccessCard');
  const btnReset = document.getElementById('btnResetInquiry');
  const productSelect = document.getElementById('inquiryProduct');
  const chips = document.querySelectorAll('.inquiry-chip');

  // Handle Quick Chips Selection
  if (chips && productSelect) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const val = chip.getAttribute('data-val');
        if (val) productSelect.value = val;
      });
    });

    productSelect.addEventListener('change', () => {
      const currentVal = productSelect.value;
      chips.forEach(chip => {
        if (chip.getAttribute('data-val') === currentVal) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    });
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inquiryName')?.value.trim();
      const phone = document.getElementById('inquiryPhone')?.value.trim();
      const product = document.getElementById('inquiryProduct')?.value || 'Amrutha Fresh Milk (Daily Subscription)';
      const message = document.getElementById('inquiryMessage')?.value.trim() || '';

      // Validate 10-digit phone
      const phoneDigits = (phone || '').replace(/\D/g, '');
      if (!name || phoneDigits.length !== 10) {
        showToast('Please enter your full name and a valid 10-digit mobile number.');
        return;
      }

      // Hide Form & Reveal Interactive Success Confirmation Card
      form.style.display = 'none';
      if (successCard) {
        const descEl = document.getElementById('inquirySuccessDesc');
        if (descEl) {
          descEl.textContent = `Thank you, ${name}! We have received your inquiry for ${product}. Our Amrutha customer care desk will call you at +91 ${phoneDigits} within 30 minutes.`;
        }

        const waLink = document.getElementById('inquiryWhatsappLink');
          const waPhone = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.contact && SITE_CONFIG.contact.whatsapp) ? SITE_CONFIG.contact.whatsapp.replace(/\D/g, '') : '916304495282';
          waLink.href = `https://wa.me/${waPhone}?text=${waText}`;

        successCard.style.display = 'flex';
      }

      showToast(`✓ Inquiry received from ${name}! We will call you shortly.`);
    });
  }

  // Handle Reset / Send Another Inquiry
  if (btnReset && form && successCard) {
    btnReset.addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      successCard.style.display = 'none';
      // Reset chips to default
      if (chips && chips.length > 0) {
        chips.forEach((c, idx) => c.classList.toggle('active', idx === 0));
      }
    });
  }
}

/**
 * Helper to display a lightweight toast notification
 */
function showToast(message) {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
