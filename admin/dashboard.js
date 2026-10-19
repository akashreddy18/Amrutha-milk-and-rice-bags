/**
 * AMRUTHA Admin Command Center JavaScript (/admin/dashboard)
 * Strictly requires active administrative authentication.
 * Handles dashboard metrics, order fulfillment lifecycle, stock adjustments,
 * catalog management, and division financial reports (Dairy vs. Rice).
 */

(function () {
  'use strict';

  const API_BASE = (window.AMRUTHA_CONFIG && window.AMRUTHA_CONFIG.API_BASE_URL)
    ? window.AMRUTHA_CONFIG.API_BASE_URL
    : 'http://localhost:8080/api';

  const TOKEN_KEY = 'amrutha_admin_token';
  const USER_KEY = 'amrutha_admin_user';
  const ROLE_KEY = 'amrutha_admin_role';
  const NAME_KEY = 'amrutha_admin_name';

  // DOM Elements
  const adminUserName = document.getElementById('adminUserName');
  const adminUserRole = document.getElementById('adminUserRole');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  // Modal elements
  const productModalBackdrop = document.getElementById('productModalBackdrop');
  const productForm = document.getElementById('productForm');
  const productModalTitle = document.getElementById('productModalTitle');
  const stockModalBackdrop = document.getElementById('stockModalBackdrop');
  const stockForm = document.getElementById('stockForm');

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAuthListeners();
    verifyAdminSession();
  });

  // =========================================================================
  // 1. AUTHENTICATION & SESSION MANAGEMENT
  // =========================================================================

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(NAME_KEY);
  }

  function verifyAdminSession() {
    const token = getToken();
    if (!token) {
      window.location.replace('/admin/login?error=auth_required');
      return;
    }

    // Verify token validity with backend
    fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Unauthorized or expired token');
        }
        return res.json();
      })
      .then(json => {
        if (json.success && json.data) {
          if (adminUserName) adminUserName.textContent = json.data.fullName || json.data.username;
          if (adminUserRole) adminUserRole.textContent = json.data.role;

          // Apply role permissions
          applyRolePermissions(json.data.role);

          // Initial data loading
          loadCombinedOverview();
          loadOrders();
          loadCatalogProducts();
          loadDairyDashboard();
          loadRiceDashboard();
          loadFinancialReport();
        } else {
          clearSession();
          window.location.replace('/admin/login?error=session_expired');
        }
      })
      .catch(() => {
        clearSession();
        window.location.replace('/admin/login?error=session_expired');
      });
  }

  function applyRolePermissions(role) {
    if (role === 'ROLE_DAIRY_ADMIN') {
      switchTab('tab-dairy');
    } else if (role === 'ROLE_RICE_ADMIN') {
      switchTab('tab-rice');
    } else {
      switchTab('tab-overview');
    }
  }

  function initAuthListeners() {
    // Logout
    if (adminLogoutBtn) {
      adminLogoutBtn.addEventListener('click', handleLogout);
    }

    // Product Modal form
    if (productForm) {
      productForm.addEventListener('submit', handleProductFormSubmit);
    }

    // Stock Modal form
    if (stockForm) {
      stockForm.addEventListener('submit', handleStockFormSubmit);
    }
  }

  function handleLogout() {
    clearSession();
    window.location.replace('/admin/login?msg=logged_out');
  }

  // Authenticated fetch wrapper
  window.authFetch = async function (url, options = {}) {
    const token = getToken();
    if (!token) {
      window.location.replace('/admin/login?error=auth_required');
      throw new Error('Authentication required');
    }

    const headers = options.headers ? { ...options.headers } : {};
    headers['Authorization'] = `Bearer ${token}`;
    headers['Accept'] = 'application/json';

    const finalOptions = {
      ...options,
      headers
    };

    const response = await fetch(url, finalOptions);

    if (response.status === 401) {
      clearSession();
      window.location.replace('/admin/login?error=session_expired');
      throw new Error('Unauthorized');
    }

    if (response.status === 403) {
      showToast('Access Denied: Your account role lacks permission for this action.', 'error');
      throw new Error('Forbidden');
    }

    return response;
  };

  // =========================================================================
  // 2. TAB NAVIGATION
  // =========================================================================

  function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-tab');
        switchTab(targetId);
      });
    });
  }

  window.switchTab = function (tabId) {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    contents.forEach(c => {
      if (c.id === tabId) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    // Refresh data on tab selection
    if (tabId === 'tab-overview') loadCombinedOverview();
    else if (tabId === 'tab-dairy') loadDairyDashboard();
    else if (tabId === 'tab-rice') loadRiceDashboard();
    else if (tabId === 'tab-orders') loadOrders();
    else if (tabId === 'tab-products') loadCatalogProducts();
    else if (tabId === 'tab-finance') loadFinancialReport();
  };

  // =========================================================================
  // 3. COMBINED OWNER OVERVIEW
  // =========================================================================

  window.loadCombinedOverview = async function () {
    try {
      const res = await authFetch(`${API_BASE}/admin/dashboard/overview`);
      const json = await res.json();

      if (json.success && json.data) {
        const data = json.data;

        // KPI values
        document.getElementById('kpiTotalRevenue').textContent = formatCurrency(data.totalRevenue);
        document.getElementById('kpiTotalOrders').textContent = data.totalOrders;
        document.getElementById('kpiDairyRevenue').textContent = formatCurrency(data.dairyRevenue);
        document.getElementById('kpiDairyOrdersCount').textContent = `${data.dairyOrdersCount} orders`;
        document.getElementById('kpiRiceRevenue').textContent = formatCurrency(data.riceRevenue);
        document.getElementById('kpiRiceOrdersCount').textContent = `${data.riceOrdersCount} orders`;

        // Status pipeline
        renderStatusPipeline(data.ordersByStatus);

        // Inventory alerts
        renderInventoryAlerts(data.dairyLowStockCount, data.riceLowStockCount);

        // Recent orders table
        renderRecentOrdersTable(data.recentOrders);
      }
    } catch (err) {
      console.error('Failed to load combined overview:', err);
    }
  };

  function renderStatusPipeline(statusMap) {
    const container = document.getElementById('orderStatusPipeline');
    if (!container || !statusMap) return;

    const statuses = [
      { key: 'CONFIRMED', label: 'Confirmed', color: 'badge-confirmed' },
      { key: 'PACKED', label: 'Packed', color: 'badge-packed' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'badge-delivery' },
      { key: 'DELIVERED', label: 'Delivered', color: 'badge-delivered' },
      { key: 'PENDING', label: 'Pending', color: 'badge-pending' },
      { key: 'CANCELLED', label: 'Cancelled', color: 'badge-cancelled' }
    ];

    container.innerHTML = statuses.map(s => {
      const count = statusMap[s.key] || 0;
      return `
        <div class="pipeline-item">
          <div class="pipeline-header">
            <span class="status-badge ${s.color}">${s.label}</span>
            <strong class="pipeline-count">${count}</strong>
          </div>
          <div class="pipeline-bar-wrapper">
            <div class="pipeline-bar ${s.color}" style="width: ${Math.min(count * 20, 100)}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderInventoryAlerts(dairyLow, riceLow) {
    const container = document.getElementById('inventoryAlerts');
    if (!container) return;

    let html = '';
    if (dairyLow > 0) {
      html += `
        <div class="alert-box alert-warning">
          <span class="alert-icon">⚠️</span>
          <div class="alert-text">
            <strong>${dairyLow} Dairy Item(s) with Low Stock (&lt; 25 units)</strong>
            <p>Cow Milk, Buffalo Milk, or Paneer require replenishment soon.</p>
          </div>
          <button type="button" class="btn btn-outline btn-xs" onclick="switchTab('tab-dairy')">Inspect Dairy</button>
        </div>
      `;
    }
    if (riceLow > 0) {
      html += `
        <div class="alert-box alert-warning">
          <span class="alert-icon">⚠️</span>
          <div class="alert-text">
            <strong>${riceLow} Rice Bag Variety(ies) with Low Stock (&lt; 15 bags)</strong>
            <p>Ensure warehouse reserves are ordered for upcoming family deliveries.</p>
          </div>
          <button type="button" class="btn btn-outline btn-xs" onclick="switchTab('tab-rice')">Inspect Rice</button>
        </div>
      `;
    }

    if (dairyLow === 0 && riceLow === 0) {
      html = `
        <div class="alert-box alert-success">
          <span class="alert-icon">✅</span>
          <div class="alert-text">
            <strong>Optimal Inventory Levels</strong>
            <p>All dairy and rice inventory are well-stocked above alert thresholds.</p>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function renderRecentOrdersTable(orders) {
    const tbody = document.getElementById('recentOrdersTableBody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No orders placed yet. Place an order via the customer storefront.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>${escapeHtml(o.orderNumber)}</strong></td>
        <td>
          <div class="customer-info-cell">
            <span>${escapeHtml(o.customerName)}</span>
            <small class="text-muted">${escapeHtml(o.customerPhone)}</small>
          </div>
        </td>
        <td><span class="bu-badge bu-${(o.businessUnit || 'MIXED').toLowerCase()}">${o.businessUnit}</span></td>
        <td><strong>${formatCurrency(o.totalAmount)}</strong></td>
        <td><span class="status-badge badge-${(o.status || 'PENDING').toLowerCase()}">${o.status}</span></td>
        <td><small>${escapeHtml(o.deliverySlot || 'Standard')}</small></td>
        <td><small class="text-muted">${formatDate(o.createdAt)}</small></td>
      </tr>
    `).join('');
  }

  // =========================================================================
  // 4. DAIRY DIVISION DASHBOARD
  // =========================================================================

  window.loadDairyDashboard = async function () {
    try {
      const res = await authFetch(`${API_BASE}/admin/dashboard/dairy`);
      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        document.getElementById('dairyKpiRevenue').textContent = formatCurrency(d.dairyRevenue);
        document.getElementById('dairyKpiOrders').textContent = d.totalDairyOrders;
        document.getElementById('dairyKpiMorning').textContent = d.morningDeliveries;
        document.getElementById('dairyKpiEvening').textContent = d.eveningDeliveries;

        renderDairyStockTable(d.products);
      }
    } catch (err) {
      console.error('Failed to load dairy dashboard:', err);
    }
  };

  function renderDairyStockTable(products) {
    const tbody = document.getElementById('dairyStockTableBody');
    if (!tbody) return;

    if (!products || products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No dairy products registered.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div class="product-cell">
            <img src="${p.imageUrl || '/assets/images/brand_milk_pouch.jpg'}" alt="" class="table-prod-img" onerror="this.src='/assets/images/brand_milk_pouch.jpg'">
            <div>
              <strong>${escapeHtml(p.name)}</strong>
              ${p.localName ? `<small class="text-muted d-block">${escapeHtml(p.localName)}</small>` : ''}
            </div>
          </div>
        </td>
        <td><span class="tag-badge">${escapeHtml(p.category || 'Dairy')}</span></td>
        <td>${formatCurrency(p.price)}</td>
        <td>${escapeHtml(p.unit)}</td>
        <td>
          <strong class="${(p.stockQuantity || 0) < 25 ? 'text-danger' : 'text-success'}">
            ${p.stockQuantity || 0} ${escapeHtml(p.unit)}s
          </strong>
        </td>
        <td>
          <span class="status-pill ${p.active ? 'pill-active' : 'pill-inactive'}">
            ${p.active ? 'Active' : 'Deactivated'}
          </span>
        </td>
        <td>
          <button type="button" class="btn btn-outline btn-xs" onclick="openStockModal(${p.id}, '${escapeHtml(p.name)}', ${p.stockQuantity || 0})">
            Adjust Stock
          </button>
        </td>
      </tr>
    `).join('');
  }

  // =========================================================================
  // 5. RICE DIVISION DASHBOARD
  // =========================================================================

  window.loadRiceDashboard = async function () {
    try {
      const res = await authFetch(`${API_BASE}/admin/dashboard/rice`);
      const json = await res.json();

      if (json.success && json.data) {
        const r = json.data;
        document.getElementById('riceKpiRevenue').textContent = formatCurrency(r.riceRevenue);
        document.getElementById('riceKpiOrders').textContent = r.totalRiceOrders;
        document.getElementById('riceKpiActiveProducts').textContent = r.activeRiceProducts;
        document.getElementById('riceKpiTotalBags').textContent = r.totalRiceStockBags;

        renderRiceStockTable(r.products);
      }
    } catch (err) {
      console.error('Failed to load rice dashboard:', err);
    }
  };

  function renderRiceStockTable(products) {
    const tbody = document.getElementById('riceStockTableBody');
    if (!tbody) return;

    if (!products || products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No rice products registered.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div class="product-cell">
            <img src="${p.imageUrl || '/assets/images/brand_rice_bag.jpg'}" alt="" class="table-prod-img" onerror="this.src='/assets/images/brand_rice_bag.jpg'">
            <div>
              <strong>${escapeHtml(p.name)}</strong>
              ${p.localName ? `<small class="text-muted d-block">${escapeHtml(p.localName)}</small>` : ''}
            </div>
          </div>
        </td>
        <td><span class="tag-badge">${escapeHtml(p.unit || '25kg Bag')}</span></td>
        <td><strong>${formatCurrency(p.price)}</strong></td>
        <td>
          <strong class="${(p.stockQuantity || 0) < 15 ? 'text-danger' : 'text-success'}">
            ${p.stockQuantity || 0} Bags
          </strong>
        </td>
        <td>
          <span class="status-pill ${p.active ? 'pill-active' : 'pill-inactive'}">
            ${p.active ? 'Available' : 'Deactivated'}
          </span>
        </td>
        <td>
          <button type="button" class="btn btn-outline btn-xs" onclick="openStockModal(${p.id}, '${escapeHtml(p.name)}', ${p.stockQuantity || 0})">
            Adjust Stock
          </button>
        </td>
      </tr>
    `).join('');
  }

  // =========================================================================
  // 6. ORDER MANAGEMENT & STATUS UPDATES
  // =========================================================================

  window.loadOrders = async function () {
    const buFilter = document.getElementById('ordersBuFilter')?.value || '';
    const statusFilter = document.getElementById('ordersStatusFilter')?.value || '';

    let url = `${API_BASE}/admin/orders?`;
    if (buFilter) url += `businessUnit=${encodeURIComponent(buFilter)}&`;
    if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;

    try {
      const res = await authFetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        renderAllOrdersTable(json.data);
        const badge = document.getElementById('tabOrdersBadge');
        if (badge) badge.textContent = json.data.length;
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  function renderAllOrdersTable(orders) {
    const tbody = document.getElementById('allOrdersTableBody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No orders matching current filter criteria.</td></tr>`;
      return;
    }

    const statuses = ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

    tbody.innerHTML = orders.map(o => {
      const itemsList = (o.items || []).map(i =>
        `<div>• ${escapeHtml(i.productName)} × <strong>${i.quantity}</strong> (${formatCurrency(i.subtotal)})</div>`
      ).join('');

      const options = statuses.map(s =>
        `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
      ).join('');

      return `
        <tr>
          <td>
            <strong>${escapeHtml(o.orderNumber)}</strong>
            <small class="text-muted d-block">${formatDate(o.createdAt)}</small>
          </td>
          <td>
            <strong>${escapeHtml(o.customerName)}</strong>
            <small class="text-muted d-block">${escapeHtml(o.customerPhone)}</small>
          </td>
          <td><small>${escapeHtml(o.deliveryAddress || 'Standard Delivery')}</small></td>
          <td><small class="slot-badge">${escapeHtml(o.deliverySlot || 'Morning')}</small></td>
          <td class="items-cell"><div class="line-items-box">${itemsList}</div></td>
          <td><strong>${formatCurrency(o.totalAmount)}</strong></td>
          <td>
            <span class="status-badge badge-${(o.status || 'PENDING').toLowerCase()}">${o.status}</span>
          </td>
          <td>
            <div class="status-update-control">
              <select class="form-select form-select-xs" id="statusSelect_${o.id}">
                ${options}
              </select>
              <button type="button" class="btn btn-primary btn-xs" onclick="handleStatusUpdateClick(${o.id})">
                Update
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.handleStatusUpdateClick = async function (orderId) {
    const select = document.getElementById(`statusSelect_${orderId}`);
    if (!select) return;

    const newStatus = select.value;

    try {
      const res = await authFetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        loadOrders();
        loadCombinedOverview();
      } else {
        showToast(json.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error updating order status: ' + err.message, 'error');
    }
  };

  // =========================================================================
  // 7. PRODUCT CATALOG & STOCK ADJUSTMENT
  // =========================================================================

  window.loadCatalogProducts = async function () {
    const buFilter = document.getElementById('catalogBuFilter')?.value || '';
    let url = `${API_BASE}/admin/products?activeOnly=false`;
    if (buFilter) url += `&businessUnit=${encodeURIComponent(buFilter)}`;

    try {
      const res = await authFetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        renderCatalogProductsTable(json.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  function renderCatalogProductsTable(products) {
    const tbody = document.getElementById('catalogProductsTableBody');
    if (!tbody) return;

    if (!products || products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4">No products in catalog.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <img src="${p.imageUrl || '/assets/images/brand_logo_master.svg'}" alt="" class="table-prod-img" onerror="this.src='/assets/images/brand_logo_master.svg'">
        </td>
        <td>
          <strong>${escapeHtml(p.name)}</strong>
          ${p.localName ? `<small class="text-muted d-block">${escapeHtml(p.localName)}</small>` : ''}
          ${p.badge ? `<span class="badge-tag">${escapeHtml(p.badge)}</span>` : ''}
        </td>
        <td><span class="bu-badge bu-${p.businessUnit.toLowerCase()}">${p.businessUnit}</span></td>
        <td><strong>${formatCurrency(p.price)}</strong></td>
        <td>${escapeHtml(p.unit)}</td>
        <td>
          <div class="inline-stock-control">
            <span class="stock-badge ${(p.stockQuantity || 0) < 20 ? 'stock-low' : 'stock-ok'}">
              ${p.stockQuantity || 0}
            </span>
            <button type="button" class="btn btn-outline btn-xs" onclick="openStockModal(${p.id}, '${escapeHtml(p.name)}', ${p.stockQuantity || 0})">
              ✏️ Adjust
            </button>
          </div>
        </td>
        <td>
          <span class="status-pill ${p.active ? 'pill-active' : 'pill-inactive'}">
            ${p.active ? 'Active' : 'Deactivated'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn btn-outline btn-xs" onclick='openEditProductModal(${JSON.stringify(p)})'>
              Edit
            </button>
            ${p.active
              ? `<button type="button" class="btn btn-outline btn-xs text-danger" onclick="toggleProductActive(${p.id}, false)">Deactivate</button>`
              : `<button type="button" class="btn btn-outline btn-xs text-success" onclick="toggleProductActive(${p.id}, true)">Activate</button>`
            }
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.toggleProductActive = async function (id, activate) {
    const endpoint = activate ? 'activate' : 'deactivate';
    try {
      const res = await authFetch(`${API_BASE}/admin/products/${id}/${endpoint}`, {
        method: 'PATCH'
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Product ${activate ? 'activated' : 'deactivated'} successfully.`, 'success');
        loadCatalogProducts();
      } else {
        showToast(json.message || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Error modifying product status', 'error');
    }
  };

  // Product Add / Edit Modal
  window.openAddProductModal = function () {
    if (productForm) productForm.reset();
    document.getElementById('prodEditId').value = '';
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    productModalBackdrop.style.display = 'flex';
  };

  window.openEditProductModal = function (p) {
    document.getElementById('prodEditId').value = p.id;
    document.getElementById('prodName').value = p.name || '';
    document.getElementById('prodLocalName').value = p.localName || '';
    document.getElementById('prodBusinessUnit').value = p.businessUnit || 'DAIRY';
    document.getElementById('prodCategory').value = p.category || '';
    document.getElementById('prodPrice').value = p.price || '';
    document.getElementById('prodUnit').value = p.unit || '';
    document.getElementById('prodStock').value = p.stockQuantity || 100;
    document.getElementById('prodBadge').value = p.badge || '';
    document.getElementById('prodImageUrl').value = p.imageUrl || '';
    document.getElementById('prodDescription').value = p.description || '';

    document.getElementById('productModalTitle').textContent = `Edit Product: ${p.name}`;
    productModalBackdrop.style.display = 'flex';
  };

  window.closeProductModal = function () {
    if (productModalBackdrop) productModalBackdrop.style.display = 'none';
  };

  async function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('prodEditId').value;
    const isEdit = Boolean(id);

    const payload = {
      name: document.getElementById('prodName').value.trim(),
      localName: document.getElementById('prodLocalName').value.trim() || null,
      businessUnit: document.getElementById('prodBusinessUnit').value,
      category: document.getElementById('prodCategory').value.trim() || null,
      price: parseFloat(document.getElementById('prodPrice').value),
      unit: document.getElementById('prodUnit').value.trim(),
      stockQuantity: parseInt(document.getElementById('prodStock').value, 10),
      badge: document.getElementById('prodBadge').value.trim() || null,
      imageUrl: document.getElementById('prodImageUrl').value.trim() || null,
      description: document.getElementById('prodDescription').value.trim() || null,
      active: true
    };

    const url = isEdit ? `${API_BASE}/admin/products/${id}` : `${API_BASE}/admin/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(isEdit ? 'Product updated successfully.' : 'Product created successfully.', 'success');
        closeProductModal();
        loadCatalogProducts();
      } else {
        showToast(json.message || 'Failed to save product.', 'error');
      }
    } catch (err) {
      showToast('Error saving product: ' + err.message, 'error');
    }
  }

  // Stock Adjustment Modal
  window.openStockModal = function (id, name, currentQty) {
    document.getElementById('stockProdId').value = id;
    document.getElementById('stockProdName').textContent = name;
    document.getElementById('stockNewQty').value = currentQty;
    stockModalBackdrop.style.display = 'flex';
  };

  window.closeStockModal = function () {
    if (stockModalBackdrop) stockModalBackdrop.style.display = 'none';
  };

  async function handleStockFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('stockProdId').value;
    const qty = parseInt(document.getElementById('stockNewQty').value, 10);

    if (isNaN(qty) || qty < 0) {
      showToast('Stock quantity must be a positive number.', 'error');
      return;
    }

    try {
      const res = await authFetch(`${API_BASE}/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: qty })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Stock level updated to ' + qty, 'success');
        closeStockModal();
        loadCatalogProducts();
        loadDairyDashboard();
        loadRiceDashboard();
        loadCombinedOverview();
      } else {
        showToast(json.message || 'Failed to adjust stock', 'error');
      }
    } catch (err) {
      showToast('Error updating stock', 'error');
    }
  }

  // =========================================================================
  // 7.5. FINANCIAL MANAGEMENT & P&L REPORTING
  // =========================================================================

  const DAIRY_EXPENSE_CATEGORIES = [
    'Cattle feed',
    'Animal care',
    'Milk procurement',
    'Labour',
    'Transport',
    'Electricity',
    'Equipment'
  ];

  const RICE_EXPENSE_CATEGORIES = [
    'Paddy procurement',
    'Milling',
    'Packaging',
    'Labour',
    'Transport',
    'Storage',
    'Electricity'
  ];

  let currentFinanceMode = 'DAILY';
  let activeLedgerView = 'EXPENSES';

  function getTodayIsoString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  window.setFinanceFilterMode = function (mode) {
    currentFinanceMode = mode;
    ['btnFilterDaily', 'btnFilterMonthly', 'btnFilterRange'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    const activeBtn = document.getElementById(
      mode === 'DAILY' ? 'btnFilterDaily' : mode === 'MONTHLY' ? 'btnFilterMonthly' : 'btnFilterRange'
    );
    if (activeBtn) activeBtn.classList.add('active');

    const groupDaily = document.getElementById('filterGroupDaily');
    const groupMonthly = document.getElementById('filterGroupMonthly');
    const groupRange = document.getElementById('filterGroupRange');

    if (groupDaily) groupDaily.style.display = mode === 'DAILY' ? 'flex' : 'none';
    if (groupMonthly) groupMonthly.style.display = mode === 'MONTHLY' ? 'flex' : 'none';
    if (groupRange) groupRange.style.display = mode === 'RANGE' ? 'flex' : 'none';

    loadFinancialReport();
  };

  window.applyFinanceFilter = function () {
    loadFinancialReport();
  };

  window.loadFinancialReport = async function () {
    try {
      const finReportDateEl = document.getElementById('finReportDate');
      const finReportYearEl = document.getElementById('finReportYear');
      const finReportMonthEl = document.getElementById('finReportMonth');
      const finStartDateEl = document.getElementById('finStartDate');
      const finEndDateEl = document.getElementById('finEndDate');

      if (finReportDateEl && !finReportDateEl.value) {
        finReportDateEl.value = getTodayIsoString();
      }

      let url = `${API_BASE}/admin/finance/daily`;
      if (currentFinanceMode === 'DAILY') {
        const d = finReportDateEl && finReportDateEl.value ? finReportDateEl.value : getTodayIsoString();
        url = `${API_BASE}/admin/finance/daily?date=${encodeURIComponent(d)}`;
      } else if (currentFinanceMode === 'MONTHLY') {
        const y = finReportYearEl ? finReportYearEl.value : new Date().getFullYear();
        const m = finReportMonthEl ? finReportMonthEl.value : (new Date().getMonth() + 1);
        url = `${API_BASE}/admin/finance/monthly?year=${encodeURIComponent(y)}&month=${encodeURIComponent(m)}`;
      } else if (currentFinanceMode === 'RANGE') {
        const start = finStartDateEl ? finStartDateEl.value : '';
        const end = finEndDateEl ? finEndDateEl.value : '';
        url = `${API_BASE}/admin/finance/report?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
      }

      const res = await authFetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        renderFinancialReport(json.data);
      } else {
        showToast(json.message || 'Unable to retrieve financial report', 'error');
      }

      loadExpensesLedger();
      loadPurchasesLedger();
    } catch (err) {
      if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
        showToast('Error loading financial statement', 'error');
      }
    }
  };

  function renderFinancialReport(report) {
    const badgeEl = document.getElementById('finPeriodBadge');
    const textEl = document.getElementById('finPeriodText');
    if (badgeEl) badgeEl.textContent = report.periodType || 'STATEMENT';
    if (textEl) {
      if (report.periodType === 'DAILY') {
        textEl.textContent = `Daily Statement for ${report.startDate}`;
      } else if (report.periodType === 'MONTHLY') {
        textEl.textContent = `Monthly Statement for Period ${report.startDate} to ${report.endDate}`;
      } else {
        textEl.textContent = `Custom Period from ${report.startDate} to ${report.endDate}`;
      }
    }

    renderDivisionalCard('dairy', report.dairyFinance || report.dairy);
    renderDivisionalCard('rice', report.riceFinance || report.rice);
    renderDivisionalCard('comb', report.combinedFinance || report.combined);

    const combinedData = report.combinedFinance || report.combined;
    if (combinedData) {
      const ordersCountEl = document.getElementById('combOrdersCount');
      const purchasesCountEl = document.getElementById('combPurchasesCount');
      const expensesCountEl = document.getElementById('combExpensesCount');
      if (ordersCountEl) ordersCountEl.textContent = combinedData.completedOrdersCount || 0;
      if (purchasesCountEl) purchasesCountEl.textContent = combinedData.purchasesCount || 0;
      if (expensesCountEl) expensesCountEl.textContent = combinedData.expensesCount || 0;
    }
  }

  function renderDivisionalCard(prefix, data) {
    if (!data) return;

    const revEl = document.getElementById(`${prefix}Rev`);
    if (revEl) revEl.textContent = formatCurrency(data.revenue);

    const cogsEl = document.getElementById(`${prefix}Cogs`);
    if (cogsEl) {
      const cogsVal = Number(data.cogsPurchases) || 0;
      cogsEl.textContent = cogsVal > 0 ? `-${formatCurrency(cogsVal)}` : formatCurrency(0);
    }

    const gpEl = document.getElementById(`${prefix}GrossProfit`);
    if (gpEl) {
      const gp = Number(data.grossProfit) || 0;
      gpEl.textContent = formatCurrency(gp);
      gpEl.style.color = gp >= 0 ? '#16a34a' : '#dc2626';
    }

    const gmBadge = document.getElementById(`${prefix}GrossMargin`);
    if (gmBadge) {
      if (data.isCalculationComplete && data.grossMarginPercent != null) {
        gmBadge.textContent = `${data.grossMarginPercent}% margin`;
        gmBadge.className = 'margin-badge' + (Number(data.grossMarginPercent) >= 0 ? '' : ' margin-negative');
      } else {
        gmBadge.textContent = 'Margin N/A (Zero Rev)';
        gmBadge.className = 'margin-badge margin-na';
      }
    }

    const opexEl = document.getElementById(`${prefix}Opex`);
    if (opexEl) {
      const opexVal = Number(data.operatingExpenses) || 0;
      opexEl.textContent = opexVal > 0 ? `-${formatCurrency(opexVal)}` : formatCurrency(0);
    }

    const npEl = document.getElementById(`${prefix}NetProfit`);
    if (npEl) {
      const np = Number(data.netProfit) || 0;
      npEl.textContent = formatCurrency(np);
      npEl.style.color = np >= 0 ? '#16a34a' : '#dc2626';
    }

    const nmBadge = document.getElementById(`${prefix}NetMargin`);
    if (nmBadge) {
      if (data.isCalculationComplete && data.netMarginPercent != null) {
        nmBadge.textContent = `${data.netMarginPercent}% net`;
        nmBadge.className = 'margin-badge' + (Number(data.netMarginPercent) >= 0 ? '' : ' margin-negative');
      } else {
        nmBadge.textContent = 'Margin N/A';
        nmBadge.className = 'margin-badge margin-na';
      }
    }

    const statusContainer = document.getElementById(`${prefix}Status`);
    if (statusContainer) {
      const statusText = statusContainer.querySelector('.status-text');
      if (data.isCalculationComplete) {
        statusContainer.classList.remove('status-incomplete');
        if (statusText) statusText.textContent = data.statusMessage || 'Complete financial statement calculated.';
      } else {
        statusContainer.classList.add('status-incomplete');
        if (statusText) statusText.textContent = data.statusMessage || 'Incomplete calculation: zero revenue recorded.';
      }
    }

    renderCategoryPills(prefix, data.expensesByCategory);
  }

  function renderCategoryPills(prefix, categories) {
    const container = document.getElementById(`${prefix}CategoryPills`);
    if (!container) return;

    if (!categories || Object.keys(categories).length === 0) {
      container.innerHTML = `<span class="pill-empty">No category expenses in selected period</span>`;
      return;
    }

    container.innerHTML = Object.entries(categories).map(([cat, amt]) => `
      <div class="category-pill">
        <span class="cat-name">${escapeHtml(cat)}</span>
        <span class="cat-amt">${formatCurrency(amt)}</span>
      </div>
    `).join('');
  }

  // Ledger Views & Operations
  window.switchLedgerView = function (view) {
    activeLedgerView = view;
    const btnExp = document.getElementById('btnLedgerExpenses');
    const btnPur = document.getElementById('btnLedgerPurchases');
    const viewExp = document.getElementById('ledgerExpensesView');
    const viewPur = document.getElementById('ledgerPurchasesView');

    if (btnExp) btnExp.classList.toggle('active', view === 'EXPENSES');
    if (btnPur) btnPur.classList.toggle('active', view === 'PURCHASES');
    if (viewExp) viewExp.style.display = view === 'EXPENSES' ? 'block' : 'none';
    if (viewPur) viewPur.style.display = view === 'PURCHASES' ? 'block' : 'none';
  };

  async function loadExpensesLedger() {
    try {
      const res = await authFetch(`${API_BASE}/admin/expenses?limit=50`);
      const json = await res.json();
      if (json.success && json.data) {
        renderExpensesTable(json.data);
        const countBadge = document.getElementById('ledgerExpensesCount');
        if (countBadge) countBadge.textContent = json.data.length;
      }
    } catch (err) {
      console.error('Failed to load expenses ledger:', err);
    }
  }

  function renderExpensesTable(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;

    if (!expenses || expenses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No expense records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = expenses.map(e => `
      <tr>
        <td><strong>${escapeHtml(e.expenseDate)}</strong></td>
        <td><span class="category-tag">${escapeHtml(e.category)}</span></td>
        <td><span class="bu-badge bu-${e.businessUnit.toLowerCase()}">${e.businessUnit}</span></td>
        <td>${escapeHtml(e.description)}</td>
        <td><strong class="text-danger">${formatCurrency(e.amount)}</strong></td>
        <td><small class="text-muted">${escapeHtml(e.notes || '-')}</small></td>
        <td>
          <button type="button" class="btn btn-outline btn-xs text-danger" onclick="deleteExpense(${e.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  async function loadPurchasesLedger() {
    try {
      const res = await authFetch(`${API_BASE}/admin/purchases?limit=50`);
      const json = await res.json();
      if (json.success && json.data) {
        renderPurchasesTable(json.data);
        const countBadge = document.getElementById('ledgerPurchasesCount');
        if (countBadge) countBadge.textContent = json.data.length;
      }
    } catch (err) {
      console.error('Failed to load purchases ledger:', err);
    }
  }

  function renderPurchasesTable(purchases) {
    const tbody = document.getElementById('purchasesTableBody');
    if (!tbody) return;

    if (!purchases || purchases.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No raw material purchases recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = purchases.map(p => `
      <tr>
        <td><strong>${escapeHtml(p.purchaseDate)}</strong></td>
        <td><small class="text-muted">${escapeHtml(p.purchaseNumber || 'PUR-' + p.id)}</small></td>
        <td><strong>${escapeHtml(p.supplierName)}</strong></td>
        <td><span class="bu-badge bu-${p.businessUnit.toLowerCase()}">${p.businessUnit}</span></td>
        <td>${escapeHtml(p.itemDescription)}</td>
        <td>${p.quantity} ${escapeHtml(p.unit)}</td>
        <td>${formatCurrency(p.unitRate)}</td>
        <td><strong class="text-cogs">${formatCurrency(p.totalAmount)}</strong></td>
        <td>
          <button type="button" class="btn btn-outline btn-xs text-danger" onclick="deletePurchase(${p.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Modals for Expense and Purchase
  window.openRecordExpenseModal = function () {
    const modal = document.getElementById('expenseModalBackdrop');
    const dateInput = document.getElementById('expDate');
    const buSelect = document.getElementById('expBusinessUnit');
    const amountInput = document.getElementById('expAmount');
    const descInput = document.getElementById('expDescription');
    const notesInput = document.getElementById('expNotes');

    if (dateInput) dateInput.value = getTodayIsoString();
    if (buSelect) buSelect.value = 'DAIRY';
    if (amountInput) amountInput.value = '';
    if (descInput) descInput.value = '';
    if (notesInput) notesInput.value = '';

    onExpenseBuChanged();
    if (modal) modal.style.display = 'flex';
  };

  window.closeExpenseModal = function () {
    const modal = document.getElementById('expenseModalBackdrop');
    if (modal) modal.style.display = 'none';
  };

  window.onExpenseBuChanged = function () {
    const buSelect = document.getElementById('expBusinessUnit');
    const catSelect = document.getElementById('expCategory');
    if (!buSelect || !catSelect) return;

    const categories = buSelect.value === 'DAIRY' ? DAIRY_EXPENSE_CATEGORIES : RICE_EXPENSE_CATEGORIES;
    catSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
  };

  window.handleExpenseFormSubmit = async function (e) {
    e.preventDefault();
    const bu = document.getElementById('expBusinessUnit').value;
    const expenseDate = document.getElementById('expDate').value;
    const category = document.getElementById('expCategory').value;
    const amount = parseFloat(document.getElementById('expAmount').value);
    const description = document.getElementById('expDescription').value.trim();
    const notes = document.getElementById('expNotes').value.trim();

    if (!amount || amount <= 0) {
      showToast('Please enter a valid expense amount.', 'error');
      return;
    }

    try {
      const payload = {
        businessUnit: bu,
        expenseDate,
        category,
        description,
        amount,
        notes: notes || null
      };

      const res = await authFetch(`${API_BASE}/admin/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Expense voucher recorded successfully!', 'success');
        closeExpenseModal();
        loadFinancialReport();
      } else {
        showToast(json.message || 'Failed to record expense', 'error');
      }
    } catch (err) {
      showToast('Error recording expense', 'error');
    }
  };

  window.openRecordPurchaseModal = function () {
    const modal = document.getElementById('purchaseModalBackdrop');
    const dateInput = document.getElementById('purDate');
    const buSelect = document.getElementById('purBusinessUnit');
    const supplierInput = document.getElementById('purSupplierName');
    const itemInput = document.getElementById('purItemDescription');
    const qtyInput = document.getElementById('purQuantity');
    const rateInput = document.getElementById('purUnitRate');
    const notesInput = document.getElementById('purNotes');

    if (dateInput) dateInput.value = getTodayIsoString();
    if (buSelect) buSelect.value = 'DAIRY';
    if (supplierInput) supplierInput.value = '';
    if (itemInput) itemInput.value = '';
    if (qtyInput) qtyInput.value = '';
    if (rateInput) rateInput.value = '';
    if (notesInput) notesInput.value = '';

    onPurchaseBuChanged();
    calculatePurchaseTotal();
    if (modal) modal.style.display = 'flex';
  };

  window.closePurchaseModal = function () {
    const modal = document.getElementById('purchaseModalBackdrop');
    if (modal) modal.style.display = 'none';
  };

  window.onPurchaseBuChanged = function () {
    const buSelect = document.getElementById('purBusinessUnit');
    const unitSelect = document.getElementById('purUnit');
    const itemInput = document.getElementById('purItemDescription');

    const isDairy = buSelect && buSelect.value === 'DAIRY';
    if (unitSelect) {
      unitSelect.value = isDairy ? 'Litre' : '75kg Bag';
    }
    if (itemInput && !itemInput.value) {
      itemInput.placeholder = isDairy
        ? 'e.g. Farm Fresh Pure Cow Milk (4.2% Fat)'
        : 'e.g. Raw Paddy 75kg bags (BPT 5204)';
    }
  };

  window.calculatePurchaseTotal = function () {
    const qty = parseFloat(document.getElementById('purQuantity')?.value) || 0;
    const rate = parseFloat(document.getElementById('purUnitRate')?.value) || 0;
    const total = qty * rate;
    const displayEl = document.getElementById('purTotalDisplay');
    if (displayEl) {
      displayEl.textContent = formatCurrency(total);
    }
  };

  window.handlePurchaseFormSubmit = async function (e) {
    e.preventDefault();
    const bu = document.getElementById('purBusinessUnit').value;
    const purchaseDate = document.getElementById('purDate').value;
    const supplierName = document.getElementById('purSupplierName').value.trim();
    const itemDescription = document.getElementById('purItemDescription').value.trim();
    const quantity = parseFloat(document.getElementById('purQuantity').value);
    const unit = document.getElementById('purUnit').value;
    const unitRate = parseFloat(document.getElementById('purUnitRate').value);
    const notes = document.getElementById('purNotes').value.trim();

    if (!quantity || quantity <= 0 || !unitRate || unitRate <= 0) {
      showToast('Please enter valid quantity and unit rate.', 'error');
      return;
    }

    try {
      const payload = {
        businessUnit: bu,
        purchaseDate,
        supplierName,
        itemDescription,
        quantity,
        unit,
        unitRate,
        notes: notes || null
      };

      const res = await authFetch(`${API_BASE}/admin/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Raw material purchase recorded successfully!', 'success');
        closePurchaseModal();
        loadFinancialReport();
      } else {
        showToast(json.message || 'Failed to record purchase', 'error');
      }
    } catch (err) {
      showToast('Error recording purchase', 'error');
    }
  };

  window.deleteExpense = async function (id) {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await authFetch(`${API_BASE}/admin/expenses/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Expense record deleted', 'info');
        loadFinancialReport();
      } else {
        showToast(json.message || 'Failed to delete expense', 'error');
      }
    } catch (err) {
      showToast('Error deleting expense', 'error');
    }
  };

  window.deletePurchase = async function (id) {
    if (!confirm('Are you sure you want to delete this raw material purchase record?')) return;
    try {
      const res = await authFetch(`${API_BASE}/admin/purchases/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Purchase record deleted', 'info');
        loadFinancialReport();
      } else {
        showToast(json.message || 'Failed to delete purchase', 'error');
      }
    } catch (err) {
      showToast('Error deleting purchase', 'error');
    }
  };

  // =========================================================================
  // 8. UTILITIES & TOASTS
  // =========================================================================

  function showToast(message, type = 'info') {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-msg">${escapeHtml(message)}</span>
      <button type="button" class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  function formatCurrency(val) {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(isoStr) {
    if (!isoStr) return 'Just now';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
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

})();
