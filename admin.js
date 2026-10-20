/**
 * AMRUTHA Admin Command Center JavaScript
 * Handles authentication, role-based tabs, dashboard metrics,
 * stock adjustments, order fulfillment lifecycle, and product catalog management.
 */

(function () {
  'use strict';

  // API base URL configuration from config.js or fallback to localhost:8080
  const API_BASE = (window.AMRUTHA_CONFIG && window.AMRUTHA_CONFIG.API_BASE_URL)
    ? window.AMRUTHA_CONFIG.API_BASE_URL
    : 'http://localhost:8080/api';

  // Token storage keys
  const TOKEN_KEY = 'amrutha_admin_token';
  const USER_KEY = 'amrutha_admin_user';
  const ROLE_KEY = 'amrutha_admin_role';
  const NAME_KEY = 'amrutha_admin_name';

  // DOM Elements
  const adminLoginSection = document.getElementById('adminLoginSection');
  const adminDashboardSection = document.getElementById('adminDashboardSection');
  const adminUserNav = document.getElementById('adminUserNav');
  const adminPublicNav = document.getElementById('adminPublicNav');
  const adminUserName = document.getElementById('adminUserName');
  const adminUserRole = document.getElementById('adminUserRole');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const loginUsernameInput = document.getElementById('loginUsername');
  const loginPasswordInput = document.getElementById('loginPassword');
  const togglePwBtn = document.getElementById('togglePwBtn');
  const loginAlert = document.getElementById('loginAlert');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
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
    checkExistingAuth();
  });

  // =========================================================================
  // 1. AUTHENTICATION & SESSION MANAGEMENT
  // =========================================================================

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function saveSession(token, user, role, name) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, user);
    sessionStorage.setItem(ROLE_KEY, role);
    sessionStorage.setItem(NAME_KEY, name);
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(NAME_KEY);
  }

  function checkExistingAuth() {
    const token = getToken();
    if (!token) {
      showLoginScreen();
      return;
    }

    // Verify token with backend /api/auth/me
    authFetch(`${API_BASE}/auth/me`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          showDashboard(json.data.username, json.data.role, json.data.fullName);
        } else {
          clearSession();
          showLoginScreen('Your session has expired. Please sign in again.');
        }
      })
      .catch(() => {
        // If server is unreachable or token invalid, show login
        clearSession();
        showLoginScreen();
      });
  }

  function showLoginScreen(alertMsg) {
    adminLoginSection.style.display = 'block';
    adminDashboardSection.style.display = 'none';
    adminUserNav.style.display = 'none';
    adminPublicNav.style.display = 'block';

    if (alertMsg) {
      loginAlert.textContent = alertMsg;
      loginAlert.style.display = 'block';
    } else {
      loginAlert.style.display = 'none';
    }
  }

  function showDashboard(username, role, fullName) {
    adminLoginSection.style.display = 'none';
    adminDashboardSection.style.display = 'block';
    adminUserNav.style.display = 'flex';
    adminPublicNav.style.display = 'none';

    adminUserName.textContent = fullName || username;
    adminUserRole.textContent = role || 'ROLE_ADMIN';

    // Apply role-based visibility if required
    applyRolePermissions(role);

    // Initial load of overview metrics
    loadCombinedOverview();
    loadOrders();
    loadCatalogProducts();
  }

  function applyRolePermissions(role) {
    // If DAIRY_ADMIN, switch directly to dairy tab
    if (role === 'ROLE_DAIRY_ADMIN') {
      switchTab('tab-dairy');
    } else if (role === 'ROLE_RICE_ADMIN') {
      switchTab('tab-rice');
    } else {
      switchTab('tab-overview');
    }
  }

  function initAuthListeners() {
    // Toggle password visibility
    if (togglePwBtn) {
      togglePwBtn.addEventListener('click', () => {
        const type = loginPasswordInput.type === 'password' ? 'text' : 'password';
        loginPasswordInput.type = type;
        togglePwBtn.textContent = type === 'password' ? '👁️' : '🔒';
      });
    }

    // Form submission
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', handleLoginSubmit);
    }

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

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value;

    if (!username || !password) {
      showLoginAlert('Please enter both username and password.');
      return;
    }

    setLoginLoading(true);
    loginAlert.style.display = 'none';

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        saveSession(
          result.data.token,
          result.data.username,
          result.data.role,
          result.data.fullName
        );
        showDashboard(result.data.username, result.data.role, result.data.fullName);
        showToast('Authentication successful. Welcome, ' + result.data.fullName, 'success');
      } else {
        showLoginAlert(result.message || 'Invalid username or password.');
      }
    } catch (err) {
      // If backend is offline (e.g. static GitHub Pages), verify standard credentials for preview session
      const defaultUsers = {
        'admin': { pass: 'AmruthaAdmin@2026', role: 'ROLE_ADMIN', name: 'Amrutha Head Administrator' },
        'owner': { pass: 'AmruthaOwner@2026', role: 'ROLE_OWNER', name: 'Amrutha Business Owner' },
        'dairy_manager': { pass: 'DairyAdmin@2026', role: 'ROLE_DAIRY_ADMIN', name: 'Dairy Operations Manager' },
        'rice_manager': { pass: 'RiceAdmin@2026', role: 'ROLE_RICE_ADMIN', name: 'Rice Division Manager' }
      };

      if (defaultUsers[username] && defaultUsers[username].pass === password) {
        const u = defaultUsers[username];
        saveSession('demo_preview_token_2026', username, u.role, u.name);
        showDashboard(username, u.role, u.name);
        showToast(`Signed in as ${u.name} (Preview Session)`, 'success');
      } else {
        showLoginAlert('Backend server is offline. For preview mode, click a Quick Sign-In button below or "Explore Dashboard in Preview Mode".');
      }
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    showLoginScreen('You have signed out securely.');
    showToast('Signed out successfully.', 'info');
  }

  function setLoginLoading(isLoading) {
    if (loginSubmitBtn) {
      const text = loginSubmitBtn.querySelector('.btn-text');
      const spinner = loginSubmitBtn.querySelector('.btn-spinner');
      if (text) text.style.display = isLoading ? 'none' : 'inline';
      if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
      loginSubmitBtn.disabled = isLoading;
    }
  }

  function showLoginAlert(msg) {
    if (loginAlert) {
      loginAlert.textContent = msg;
      loginAlert.style.display = 'block';
    }
  }

  // Authenticated fetch wrapper
  window.authFetch = async function (url, options = {}) {
    const token = getToken();
    const headers = options.headers ? { ...options.headers } : {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    headers['Accept'] = 'application/json';

    const finalOptions = {
      ...options,
      headers
    };

    const response = await fetch(url, finalOptions);

    if (response.status === 401) {
      clearSession();
      showLoginScreen('Your session has expired. Please log in again.');
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

  function switchTab(tabId) {
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
    else if (tabId === 'tab-subscriptions') loadSubscriptionsDashboard();
    else if (tabId === 'tab-orders') loadOrders();
    else if (tabId === 'tab-products') loadCatalogProducts();
    else if (tabId === 'tab-finance') loadFinancialReport();
  }

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
      console.warn('Backend unavailable, rendering preview demo data for overview:', err);
      const demoData = {
        totalRevenue: 248650,
        totalOrders: 142,
        dairyRevenue: 98400,
        dairyOrdersCount: 96,
        riceRevenue: 150250,
        riceOrdersCount: 46,
        dairyLowStockCount: 1,
        riceLowStockCount: 0,
        ordersByStatus: {
          CONFIRMED: 14,
          PACKED: 8,
          OUT_FOR_DELIVERY: 12,
          DELIVERED: 104,
          PENDING: 3,
          CANCELLED: 1
        },
        recentOrders: [
          { id: 1, orderNumber: 'ORD-20261019-00142', customerName: 'Venkata Rao', customerPhone: '+91 63044 95282', totalAmount: 2850, status: 'CONFIRMED', businessUnit: 'RICE', createdAt: '2026-10-19T18:30:00' },
          { id: 2, orderNumber: 'ORD-20261019-00141', customerName: 'Suresh Kumar', customerPhone: '+91 94401 56789', totalAmount: 360, status: 'PACKED', businessUnit: 'DAIRY', createdAt: '2026-10-19T17:45:00' },
          { id: 3, orderNumber: 'ORD-20261019-00140', customerName: 'Anitha Reddy', customerPhone: '+91 99890 23456', totalAmount: 4700, status: 'DELIVERED', businessUnit: 'RICE', createdAt: '2026-10-19T16:15:00' },
          { id: 4, orderNumber: 'ORD-20261019-00139', customerName: 'Mallesh Goud', customerPhone: '+91 97010 34567', totalAmount: 520, status: 'DELIVERED', businessUnit: 'DAIRY', createdAt: '2026-10-19T15:20:00' }
        ]
      };
      const totalRevEl = document.getElementById('kpiTotalRevenue');
      if (totalRevEl) totalRevEl.textContent = formatCurrency(demoData.totalRevenue);
      const totalOrdersEl = document.getElementById('kpiTotalOrders');
      if (totalOrdersEl) totalOrdersEl.textContent = demoData.totalOrders;
      const dairyRevEl = document.getElementById('kpiDairyRevenue');
      if (dairyRevEl) dairyRevEl.textContent = formatCurrency(demoData.dairyRevenue);
      const dairyOrdersEl = document.getElementById('kpiDairyOrdersCount');
      if (dairyOrdersEl) dairyOrdersEl.textContent = `${demoData.dairyOrdersCount} orders`;
      const riceRevEl = document.getElementById('kpiRiceRevenue');
      if (riceRevEl) riceRevEl.textContent = formatCurrency(demoData.riceRevenue);
      const riceOrdersEl = document.getElementById('kpiRiceOrdersCount');
      if (riceOrdersEl) riceOrdersEl.textContent = `${demoData.riceOrdersCount} orders`;

      renderStatusPipeline(demoData.ordersByStatus);
      renderInventoryAlerts(demoData.dairyLowStockCount, demoData.riceLowStockCount);
      renderRecentOrdersTable(demoData.recentOrders);
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
            <img src="${p.imageUrl || 'assets/images/brand_milk_pouch.jpg'}" alt="" class="table-prod-img" onerror="this.src='assets/images/brand_milk_pouch.jpg'">
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
            <img src="${p.imageUrl || 'assets/images/brand_rice_bag.jpg'}" alt="" class="table-prod-img" onerror="this.src='assets/images/brand_rice_bag.jpg'">
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

  let localCatalogProducts = [
    { id: 1, name: "Pure Cow Milk", localName: "(ఆవు పాలు / गाय का दूध)", businessUnit: "DAIRY", price: 60.00, unit: "Litre", stockQuantity: 95, category: "Milk", badge: "Daily Fresh", imageUrl: "assets/images/brand_milk_pouch.jpg", description: "100% natural, pure farm cow milk. Light, wholesome, and easy to digest.", active: true },
    { id: 2, name: "Pure Buffalo Milk", localName: "(గేదె పాలు / भैंस का दूध)", businessUnit: "DAIRY", price: 75.00, unit: "Litre", stockQuantity: 110, category: "Milk", badge: "Thick & Creamy", imageUrl: "assets/images/buffalo_milk.jpg", description: "Thick, high-fat natural buffalo milk (7%+ fat). Produces thick malai, excellent for tea, coffee, homemade dahi, and ghee.", active: true },
    { id: 3, name: "Fresh Malai Paneer (200g)", localName: "(తాజా మలై పనీర్ / ताजा पनीर)", businessUnit: "DAIRY", price: 90.00, unit: "200g", stockQuantity: 80, category: "Paneer", badge: "Farm Fresh", imageUrl: "assets/images/fresh_paneer.jpg", description: "Soft, melt-in-mouth cottage cheese crafted from 100% whole milk. High protein, spongy texture. 200g vacuum pack.", active: true },
    { id: 4, name: "Fresh Malai Paneer (500g)", localName: "(తాజా మలై పనీర్ / ताजा पनीर)", businessUnit: "DAIRY", price: 220.00, unit: "500g", stockQuantity: 60, category: "Paneer", badge: "Farm Fresh", imageUrl: "assets/images/fresh_paneer.jpg", description: "Soft, melt-in-mouth cottage cheese crafted from 100% whole milk. High protein, spongy texture. 500g vacuum pack.", active: true },
    { id: 5, name: "Fresh Malai Paneer (1kg)", localName: "(తాజా మలై పనీర్ / ताजा पनीर)", businessUnit: "DAIRY", price: 430.00, unit: "1kg", stockQuantity: 40, category: "Paneer", badge: "Farm Fresh", imageUrl: "assets/images/fresh_paneer.jpg", description: "Soft, melt-in-mouth cottage cheese crafted from 100% whole milk. High protein, spongy texture. 1kg vacuum pack.", active: true },
    { id: 6, name: "Pure Desi Ghee (250ml)", localName: "(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)", businessUnit: "DAIRY", price: 210.00, unit: "250ml", stockQuantity: 75, category: "Ghee", badge: "Traditional Danedar", imageUrl: "assets/images/fresh_ghee.jpg", description: "Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 250ml glass jar.", active: true },
    { id: 7, name: "Pure Desi Ghee (500ml)", localName: "(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)", businessUnit: "DAIRY", price: 410.00, unit: "500ml", stockQuantity: 50, category: "Ghee", badge: "Traditional Danedar", imageUrl: "assets/images/fresh_ghee.jpg", description: "Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 500ml glass jar.", active: true },
    { id: 8, name: "Pure Desi Ghee (1 Litre)", localName: "(స్వచ్ఛమైన దేశీ నెయ్యి / शुद्ध देसी घी)", businessUnit: "DAIRY", price: 800.00, unit: "1 Litre", stockQuantity: 30, category: "Ghee", badge: "Traditional Danedar", imageUrl: "assets/images/fresh_ghee.jpg", description: "Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma. 1 Litre jar.", active: true },
    { id: 9, name: "Amrutha Sona Masoori Rice (25kg)", localName: "(సోనా మసూరి బియ్యం / सोना मसूरी चावल)", businessUnit: "RICE", price: 1450.00, unit: "25kg Bag", stockQuantity: 120, category: "Rice", badge: "Aged 12-18 Months", imageUrl: "assets/images/brand_rice_bag.jpg", description: "Finest medium-slender grain rice aged naturally for 12 to 18 months. Non-sticky, fluffy, and aromatic cooking for daily meals.", active: true },
    { id: 10, name: "Amrutha Sona Masoori Rice (50kg)", localName: "(సోనా మసూరి బియ్యం / सोना मसूरी चावल)", businessUnit: "RICE", price: 2850.00, unit: "50kg Bag", stockQuantity: 50, category: "Rice", badge: "Aged 12-18 Months", imageUrl: "assets/images/brand_rice_bag.jpg", description: "Finest medium-slender grain rice aged naturally for 12 to 18 months. Bulk family & catering standard pack.", active: true },
    { id: 11, name: "Amrutha Royal Basmati Rice (25kg)", localName: "(రాయల్ బాస్మతి బియ్యం / रॉयल बासमती चावल)", businessUnit: "RICE", price: 2400.00, unit: "25kg Bag", stockQuantity: 80, category: "Rice", badge: "Extra Long Grain", imageUrl: "assets/images/basmati_rice_bag.jpg", description: "Exquisite Himalayan aged long-grain basmati rice. Each grain doubles in length without breaking. Perfect for Biryani and Pulao.", active: true },
    { id: 12, name: "Amrutha Deluxe BPT / Kolam Rice (25kg)", localName: "(డీలక్స్ బియ్యం / डीलक्स बीपीटी चावल)", businessUnit: "RICE", price: 1580.00, unit: "25kg Bag", stockQuantity: 65, category: "Rice", badge: "Silky & Aromatic", imageUrl: "assets/images/kolam_rice_bag.jpg", description: "Silky white fine grain with tender bite. Cleaned, destoned, and naturally aged for delicious everyday meals.", active: true }
  ];

  window.loadCatalogProducts = async function () {
    const buFilter = document.getElementById('catalogBuFilter')?.value || '';
    let url = `${API_BASE}/admin/products?activeOnly=false`;
    if (buFilter) url += `&businessUnit=${encodeURIComponent(buFilter)}`;

    try {
      const res = await authFetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        renderCatalogProductsTable(json.data);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, rendering preview catalog data:', err);
    }

    // Offline / Preview Fallback
    let filtered = localCatalogProducts;
    if (buFilter) {
      filtered = localCatalogProducts.filter(p => p.businessUnit === buFilter);
    }
    renderCatalogProductsTable(filtered);
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
          <img src="${p.imageUrl || 'assets/images/brand_logo_master.svg'}" alt="" class="table-prod-img" onerror="this.src='assets/images/brand_logo_master.svg'">
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
        return;
      }
    } catch (err) {
      // Offline fallback
      const found = localCatalogProducts.find(p => p.id == id);
      if (found) {
        found.active = activate;
        showToast(`Product ${activate ? 'activated' : 'deactivated'} (Preview Mode).`, 'success');
        loadCatalogProducts();
        return;
      }
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
        return;
      }
    } catch (err) {
      // Offline / Preview fallback
      if (isEdit) {
        const idx = localCatalogProducts.findIndex(p => p.id == id);
        if (idx !== -1) {
          localCatalogProducts[idx] = { ...localCatalogProducts[idx], ...payload, id: parseInt(id, 10) };
          showToast('Product updated successfully (Preview Mode).', 'success');
          closeProductModal();
          loadCatalogProducts();
          return;
        }
      } else {
        const newId = localCatalogProducts.length ? Math.max(...localCatalogProducts.map(p => p.id)) + 1 : 1;
        localCatalogProducts.push({ ...payload, id: newId });
        showToast('Product created successfully (Preview Mode).', 'success');
        closeProductModal();
        loadCatalogProducts();
        return;
      }
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
        return;
      }
    } catch (err) {
      // Offline fallback
      const found = localCatalogProducts.find(p => p.id == id);
      if (found) {
        found.stockQuantity = qty;
        showToast('Stock level updated to ' + qty + ' (Preview Mode)', 'success');
        closeStockModal();
        loadCatalogProducts();
        return;
      }
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

  // Initialize today's date for inputs
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

    // Auto-refresh with newly selected mode
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

      // Always refresh ledgers
      loadExpensesLedger();
      loadPurchasesLedger();
    } catch (err) {
      if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
        showToast('Error loading financial statement', 'error');
      }
    }
  };

  function renderFinancialReport(report) {
    // 1. Update period banner
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

    // 2. Render Dairy Statement
    renderDivisionalCard('dairy', report.dairyFinance || report.dairy);

    // 3. Render Rice Statement
    renderDivisionalCard('rice', report.riceFinance || report.rice);

    // 4. Render Combined Statement
    renderDivisionalCard('comb', report.combinedFinance || report.combined);

    // 5. Volume stats
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

    // Revenue
    const revEl = document.getElementById(`${prefix}Rev`);
    if (revEl) revEl.textContent = formatCurrency(data.revenue);

    // COGS
    const cogsEl = document.getElementById(`${prefix}Cogs`);
    if (cogsEl) {
      const cogsVal = Number(data.cogsPurchases) || 0;
      cogsEl.textContent = cogsVal > 0 ? `-${formatCurrency(cogsVal)}` : formatCurrency(0);
    }

    // Gross Profit
    const gpEl = document.getElementById(`${prefix}GrossProfit`);
    if (gpEl) {
      const gp = Number(data.grossProfit) || 0;
      gpEl.textContent = formatCurrency(gp);
      gpEl.style.color = gp >= 0 ? '#16a34a' : '#dc2626';
    }

    // Gross Margin Badge
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

    // Operating Expenses (OPEX)
    const opexEl = document.getElementById(`${prefix}Opex`);
    if (opexEl) {
      const opexVal = Number(data.operatingExpenses) || 0;
      opexEl.textContent = opexVal > 0 ? `-${formatCurrency(opexVal)}` : formatCurrency(0);
    }

    // Net Operating Profit
    const npEl = document.getElementById(`${prefix}NetProfit`);
    if (npEl) {
      const np = Number(data.netProfit) || 0;
      npEl.textContent = formatCurrency(np);
      npEl.style.color = np >= 0 ? '#16a34a' : '#dc2626';
    }

    // Net Margin Badge
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

    // Status Message / Completeness
    const statusContainer = document.getElementById(`${prefix}Status`);
    if (statusContainer) {
      const statusText = statusContainer.querySelector('.status-text');
      if (data.isCalculationComplete) {
        statusContainer.classList.remove('status-incomplete');
        if (statusText) statusText.textContent = data.statusMessage || 'Complete financial statement calculated.';
      } else {
        statusContainer.classList.add('status-incomplete');
        if (statusText) statusText.textContent = data.statusMessage || 'Incomplete calculation: No revenue in period.';
      }
    }

    // Category breakdown pills
    const pillsContainer = document.getElementById(`${prefix}CategoryPills`);
    if (pillsContainer) {
      pillsContainer.innerHTML = '';
      const catMap = data.expensesByCategory || {};
      const catKeys = Object.keys(catMap);
      if (catKeys.length === 0) {
        pillsContainer.innerHTML = '<small class="text-muted">No operating expenses incurred in this period.</small>';
      } else {
        catKeys.forEach(cat => {
          const amt = catMap[cat];
          const pill = document.createElement('div');
          pill.className = 'cat-pill';
          pill.innerHTML = `
            <span class="cat-pill-name">${escapeHtml(cat)}</span>
            <span class="cat-pill-amt">${formatCurrency(amt)}</span>
          `;
          pillsContainer.appendChild(pill);
        });
      }
    }
  }

  // =========================================================================
  // LEDGER VIEWS (EXPENSES & PURCHASES)
  // =========================================================================

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
    const tbody = document.getElementById('expensesTableBody');
    const countEl = document.getElementById('ledgerExpensesCount');
    if (!tbody) return;

    try {
      const res = await authFetch(`${API_BASE}/admin/expenses`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const list = json.data;
        if (countEl) countEl.textContent = list.length;

        if (list.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No operational expenses recorded.</td></tr>';
          return;
        }

        tbody.innerHTML = list.map(exp => `
          <tr>
            <td><strong>${escapeHtml(exp.expenseDate || '')}</strong></td>
            <td><span class="catalog-badge">${escapeHtml(exp.category || '')}</span></td>
            <td>
              <span class="bu-badge ${exp.businessUnit === 'DAIRY' ? 'bu-dairy' : 'bu-rice'}">
                ${exp.businessUnit === 'DAIRY' ? '🥛 DAIRY' : '🌾 RICE'}
              </span>
            </td>
            <td>${escapeHtml(exp.description || exp.title || '')}</td>
            <td class="font-bold val-opex">${formatCurrency(exp.amount)}</td>
            <td><small class="text-muted">${escapeHtml(exp.notes || '—')}</small></td>
            <td>
              <button type="button" class="btn btn-outline btn-sm btn-icon" onclick="deleteExpense(${exp.id})" title="Delete Expense">
                🗑️
              </button>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Error loading expenses</td></tr>';
    }
  }

  async function loadPurchasesLedger() {
    const tbody = document.getElementById('purchasesTableBody');
    const countEl = document.getElementById('ledgerPurchasesCount');
    if (!tbody) return;

    try {
      const res = await authFetch(`${API_BASE}/admin/purchases`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const list = json.data;
        if (countEl) countEl.textContent = list.length;

        if (list.length === 0) {
          tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">No raw material purchases recorded.</td></tr>';
          return;
        }

        tbody.innerHTML = list.map(pur => `
          <tr>
            <td><strong>${escapeHtml(pur.purchaseDate || '')}</strong></td>
            <td><code>${escapeHtml(pur.purchaseNumber || '')}</code></td>
            <td><strong>${escapeHtml(pur.supplierName || '')}</strong></td>
            <td>
              <span class="bu-badge ${pur.businessUnit === 'DAIRY' ? 'bu-dairy' : 'bu-rice'}">
                ${pur.businessUnit === 'DAIRY' ? '🥛 DAIRY' : '🌾 RICE'}
              </span>
            </td>
            <td>${escapeHtml(pur.itemDescription || '')}</td>
            <td>${pur.quantity} ${escapeHtml(pur.unit || '')}</td>
            <td>${formatCurrency(pur.unitRate)}</td>
            <td class="font-bold val-cogs">${formatCurrency(pur.totalCost)}</td>
            <td>
              <button type="button" class="btn btn-outline btn-sm btn-icon" onclick="deletePurchase(${pur.id})" title="Delete Purchase">
                🗑️
              </button>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-4">Error loading purchases</td></tr>';
    }
  }

  // =========================================================================
  // MODALS & MUTATIONS (RECORD EXPENSE & PURCHASE)
  // =========================================================================

  window.openRecordExpenseModal = function () {
    const modal = document.getElementById('expenseModalBackdrop');
    const dateInput = document.getElementById('expDate');
    const buSelect = document.getElementById('expBusinessUnit');
    const descInput = document.getElementById('expDescription');
    const amtInput = document.getElementById('expAmount');
    const notesInput = document.getElementById('expNotes');

    if (dateInput) dateInput.value = getTodayIsoString();
    if (buSelect) buSelect.value = 'DAIRY';
    if (descInput) descInput.value = '';
    if (amtInput) amtInput.value = '';
    if (notesInput) notesInput.value = '';

    updateExpenseCategoryOptions('DAIRY');
    if (modal) modal.style.display = 'flex';
  };

  window.closeExpenseModal = function () {
    const modal = document.getElementById('expenseModalBackdrop');
    if (modal) modal.style.display = 'none';
  };

  window.onExpenseBuChanged = function () {
    const buSelect = document.getElementById('expBusinessUnit');
    const bu = buSelect ? buSelect.value : 'DAIRY';
    updateExpenseCategoryOptions(bu);
  };

  function updateExpenseCategoryOptions(bu) {
    const catSelect = document.getElementById('expCategory');
    if (!catSelect) return;

    const list = bu === 'DAIRY' ? DAIRY_EXPENSE_CATEGORIES : RICE_EXPENSE_CATEGORIES;
    catSelect.innerHTML = list.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }

  window.handleExpenseFormSubmit = async function (e) {
    e.preventDefault();
    const bu = document.getElementById('expBusinessUnit').value;
    const expenseDate = document.getElementById('expDate').value;
    const category = document.getElementById('expCategory').value;
    const description = document.getElementById('expDescription').value.trim();
    const amount = parseFloat(document.getElementById('expAmount').value);
    const notes = document.getElementById('expNotes').value.trim();

    if (!amount || amount <= 0) {
      showToast('Please enter a valid expense amount greater than zero.', 'error');
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

  // =========================================================================
  // 8. MILK SUBSCRIPTION & DAILY DELIVERY DEMAND MANAGEMENT
  // =========================================================================

  let adminSubscriptionsMaster = [];
  let currentAdminSubFilter = 'ALL';
  let currentAdminSubSearch = '';

  const defaultAdminSeedSubs = [
    {
      id: 1,
      subscriptionNumber: 'SUB-20261020-001',
      customerName: 'Ramesh Sharma',
      customerPhone: '9876543210',
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
      status: 'ACTIVE',
      createdAt: '2026-10-20T08:00:00'
    },
    {
      id: 2,
      subscriptionNumber: 'SUB-20261020-002',
      customerName: 'Priya Patel',
      customerPhone: '9876543211',
      deliveryAddress: 'Flat 204, Sri Sai Enclave, Kodad town 508206',
      milkType: 'Buffalo Milk',
      dailyQuantity: '1 Litre',
      dailyQuantityLitres: 1.0,
      durationDays: 30,
      startDate: '2026-10-21',
      endDate: '2026-11-19',
      deliverySlot: 'Morning Delivery (5:30 AM – 7:30 AM)',
      dailyRate: 75.00,
      totalAmount: 2250.00,
      paymentStatus: 'PAID',
      status: 'ACTIVE',
      createdAt: '2026-10-20T08:15:00'
    },
    {
      id: 3,
      subscriptionNumber: 'SUB-20261020-003',
      customerName: 'Suresh Kumar',
      customerPhone: '9876543212',
      deliveryAddress: 'Near Bus Stand, Mellacheruvu Road, Kodad',
      milkType: 'Buffalo Milk',
      dailyQuantity: '2 Litres',
      dailyQuantityLitres: 2.0,
      durationDays: 7,
      startDate: '2026-10-21',
      endDate: '2026-10-27',
      deliverySlot: 'Evening Delivery (5:00 PM – 7:00 PM)',
      dailyRate: 150.00,
      totalAmount: 1050.00,
      paymentStatus: 'PENDING',
      status: 'ACTIVE',
      createdAt: '2026-10-20T09:00:00'
    },
    {
      id: 4,
      subscriptionNumber: 'SUB-20261020-004',
      customerName: 'Ananya Rao',
      customerPhone: '9876543213',
      deliveryAddress: 'H.No 1-12, Temple Street, Kodad town 508206',
      milkType: 'Cow Milk',
      dailyQuantity: '500 ml',
      dailyQuantityLitres: 0.5,
      durationDays: 30,
      startDate: '2026-10-15',
      endDate: '2026-11-13',
      deliverySlot: 'Morning Delivery (5:30 AM – 7:30 AM)',
      dailyRate: 30.00,
      totalAmount: 900.00,
      paymentStatus: 'PAID',
      status: 'PAUSED',
      createdAt: '2026-10-14T10:00:00'
    }
  ];

  /**
   * Loads the Subscriptions Dashboard (Demand + Subscriptions list)
   */
  window.loadSubscriptionsDashboard = async function () {
    const datePicker = document.getElementById('demandDatePicker');
    if (datePicker && !datePicker.value) {
      // Default to tomorrow or today
      const todayStr = new Date().toISOString().split('T')[0];
      datePicker.value = todayStr;
    }

    await loadSubscriptionsList();
    loadDemandForSelectedDate();
  };

  /**
   * Loads and calculates Daily Delivery Demand for the selected date
   */
  window.loadDemandForSelectedDate = async function () {
    const datePicker = document.getElementById('demandDatePicker');
    const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];

    let demand = null;

    // Try fetching from backend API
    try {
      const res = await authFetch(`${API_BASE}/admin/subscriptions/daily-demand?date=${selectedDate}`);
      const json = await res.json();
      if (json && json.success && json.data) {
        demand = json.data;
      }
    } catch (e) {
      console.warn('API daily demand unavailable, computing locally:', e);
    }

    // Fallback: Compute demand directly from adminSubscriptionsMaster
    if (!demand) {
      let morningCow = 0;
      let morningBuffalo = 0;
      let eveningCow = 0;
      let eveningBuffalo = 0;
      let activeCount = 0;

      adminSubscriptionsMaster.forEach(s => {
        if (s.status === 'ACTIVE' && s.startDate && s.endDate) {
          if (s.startDate <= selectedDate && selectedDate <= s.endDate) {
            activeCount++;
            const litres = Number(s.dailyQuantityLitres) || (s.dailyQuantity && s.dailyQuantity.includes('500') ? 0.5 : (s.dailyQuantity && s.dailyQuantity.includes('2') ? 2.0 : 1.0));
            const isCow = (s.milkType || '').toLowerCase().includes('cow');
            const isMorning = (s.deliverySlot || '').toLowerCase().includes('morning');

            if (isMorning) {
              if (isCow) morningCow += litres;
              else morningBuffalo += litres;
            } else {
              if (isCow) eveningCow += litres;
              else eveningBuffalo += litres;
            }
          }
        }
      });

      const morningTotal = morningCow + morningBuffalo;
      const eveningTotal = eveningCow + eveningBuffalo;
      const totalRequired = morningTotal + eveningTotal;

      demand = {
        date: selectedDate,
        totalRequiredLitres: totalRequired,
        morningCowMilkLitres: morningCow,
        morningBuffaloMilkLitres: morningBuffalo,
        morningTotalLitres: morningTotal,
        eveningCowMilkLitres: eveningCow,
        eveningBuffaloMilkLitres: eveningBuffalo,
        eveningTotalLitres: eveningTotal,
        activeSubscribersCount: activeCount
      };
    }

    // Render Demand to UI
    const totalEl = document.getElementById('adminTotalDemandLitres');
    const morningEl = document.getElementById('adminMorningDemandLitres');
    const eveningEl = document.getElementById('adminEveningDemandLitres');
    const activeEl = document.getElementById('adminActiveSubscribersCount');

    const mCowEl = document.getElementById('adminMorningCowLitres');
    const mBufEl = document.getElementById('adminMorningBuffaloLitres');
    const mTotEl = document.getElementById('adminMorningTotalLitres');

    const eCowEl = document.getElementById('adminEveningCowLitres');
    const eBufEl = document.getElementById('adminEveningBuffaloLitres');
    const eTotEl = document.getElementById('adminEveningTotalLitres');

    if (totalEl) totalEl.textContent = `${Number(demand.totalRequiredLitres).toFixed(1)} L`;
    if (morningEl) morningEl.textContent = `${Number(demand.morningTotalLitres).toFixed(1)} L`;
    if (eveningEl) eveningEl.textContent = `${Number(demand.eveningTotalLitres).toFixed(1)} L`;
    if (activeEl) activeEl.textContent = `${demand.activeSubscribersCount || 0}`;

    if (mCowEl) mCowEl.textContent = `${Number(demand.morningCowMilkLitres).toFixed(1)} L`;
    if (mBufEl) mBufEl.textContent = `${Number(demand.morningBuffaloMilkLitres).toFixed(1)} L`;
    if (mTotEl) mTotEl.textContent = `${Number(demand.morningTotalLitres).toFixed(1)} L`;

    if (eCowEl) eCowEl.textContent = `${Number(demand.eveningCowMilkLitres).toFixed(1)} L`;
    if (eBufEl) eBufEl.textContent = `${Number(demand.eveningBuffaloMilkLitres).toFixed(1)} L`;
    if (eTotEl) eTotEl.textContent = `${Number(demand.eveningTotalLitres).toFixed(1)} L`;
  };

  /**
   * Loads all subscriptions and calculates revenue
   */
  async function loadSubscriptionsList() {
    const tableBody = document.getElementById('subscriptionsTableBody');
    if (!tableBody) return;

    let subscriptions = [];

    // 1. Try fetching from backend API
    try {
      const res = await authFetch(`${API_BASE}/admin/subscriptions`);
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        subscriptions = json.data;
      }
    } catch (e) {
      console.warn('Backend subscriptions API unavailable, using local and seed data:', e);
    }

    // 2. Merge local storage subscriptions
    try {
      const localRaw = localStorage.getItem('amrutha_local_subscriptions');
      if (localRaw) {
        const localList = JSON.parse(localRaw);
        const existingIds = new Set(subscriptions.map(s => s.id));
        localList.forEach(ls => {
          if (!existingIds.has(ls.id)) subscriptions.push(ls);
        });
      }
    } catch (e) {
      console.error('Failed to read local subscriptions', e);
    }

    // 3. Fallback to seed data if empty
    if (subscriptions.length === 0) {
      subscriptions = [...defaultAdminSeedSubs];
    }

    adminSubscriptionsMaster = subscriptions;

    // Update tab badge
    const badge = document.getElementById('tabSubCountBadge');
    if (badge) badge.textContent = subscriptions.length;

    // Calculate subscription revenue strictly from recorded payments
    calculateSubscriptionRevenue(subscriptions);

    // Update filter counts and render table
    updateAdminSubFilterCounts();
    renderAdminSubscriptionsTable();
  }

  /**
   * Calculates subscription revenue from actual recorded payments and orders
   */
  function calculateSubscriptionRevenue(subs) {
    let grossTotal = 0;
    let paidTotal = 0;
    let pendingTotal = 0;

    subs.forEach(s => {
      const amt = Number(s.totalAmount) || 0;
      grossTotal += amt;

      if (s.paymentStatus === 'PAID') {
        paidTotal += amt;
      } else {
        pendingTotal += amt;
      }
    });

    const grossEl = document.getElementById('adminSubGrossRevenue');
    const paidEl = document.getElementById('adminSubPaidRevenue');
    const pendingEl = document.getElementById('adminSubPendingRevenue');

    if (grossEl) grossEl.textContent = formatCurrency(grossTotal);
    if (paidEl) paidEl.textContent = formatCurrency(paidTotal);
    if (pendingEl) pendingEl.textContent = formatCurrency(pendingTotal);
  }

  /**
   * Updates filter button count numbers
   */
  function updateAdminSubFilterCounts() {
    const allCount = adminSubscriptionsMaster.length;
    const activeCount = adminSubscriptionsMaster.filter(s => s.status === 'ACTIVE').length;
    const pausedCount = adminSubscriptionsMaster.filter(s => s.status === 'PAUSED').length;
    const cancelledCount = adminSubscriptionsMaster.filter(s => s.status === 'CANCELLED').length;
    const completedCount = adminSubscriptionsMaster.filter(s => s.status === 'COMPLETED').length;

    const elAll = document.getElementById('countSubAll');
    const elAct = document.getElementById('countSubActive');
    const elPau = document.getElementById('countSubPaused');
    const elCan = document.getElementById('countSubCancelled');
    const elCom = document.getElementById('countSubCompleted');

    if (elAll) elAll.textContent = allCount;
    if (elAct) elAct.textContent = activeCount;
    if (elPau) elPau.textContent = pausedCount;
    if (elCan) elCan.textContent = cancelledCount;
    if (elCom) elCom.textContent = completedCount;
  }

  /**
   * Filter subscriptions by status button
   */
  window.filterAdminSubscriptions = function (filter) {
    currentAdminSubFilter = filter;
    const buttons = document.querySelectorAll('#adminSubStatusFilters .btn-sub-filter');
    buttons.forEach(b => {
      if (b.getAttribute('data-sub-filter') === filter) b.classList.add('active');
      else b.classList.remove('active');
    });
    renderAdminSubscriptionsTable();
  };

  /**
   * Search filter for subscriptions table
   */
  window.handleAdminSubSearch = function () {
    const input = document.getElementById('adminSubSearchInput');
    currentAdminSubSearch = input ? input.value.trim().toLowerCase() : '';
    renderAdminSubscriptionsTable();
  };

  /**
   * Renders the subscriptions table rows
   */
  function renderAdminSubscriptionsTable() {
    const tbody = document.getElementById('subscriptionsTableBody');
    if (!tbody) return;

    let filtered = adminSubscriptionsMaster;

    // Apply status filter
    if (currentAdminSubFilter !== 'ALL') {
      filtered = filtered.filter(s => s.status === currentAdminSubFilter);
    }

    // Apply search filter
    if (currentAdminSubSearch) {
      filtered = filtered.filter(s => {
        const text = `${s.subscriptionNumber || ''} ${s.customerName || ''} ${s.customerPhone || ''} ${s.deliveryAddress || ''} ${s.milkType || ''}`.toLowerCase();
        return text.includes(currentAdminSubSearch);
      });
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4">No subscriptions matching filter.</td></tr>`;
      return;
    }

    let html = '';
    filtered.forEach(s => {
      const isPaid = s.paymentStatus === 'PAID';
      const paymentBadgeClass = isPaid ? 'badge-success' : 'badge-warning';
      const statusPillClass = s.status === 'ACTIVE' ? 'status-active' : (s.status === 'PAUSED' ? 'status-paused' : (s.status === 'CANCELLED' ? 'status-cancelled' : 'status-completed'));

      html += `
        <tr>
          <td>
            <strong>${escapeHtml(s.subscriptionNumber)}</strong>
            <br><small class="text-muted">${formatDate(s.createdAt)}</small>
          </td>
          <td>
            <strong>${escapeHtml(s.customerName)}</strong>
          </td>
          <td>
            <a href="tel:${escapeHtml(s.customerPhone)}" style="color: #165b33; font-weight: 700;">${escapeHtml(s.customerPhone)}</a>
            <br><small class="text-muted" style="max-width: 200px; display: inline-block;">${escapeHtml(s.deliveryAddress)}</small>
          </td>
          <td>
            <span class="bu-badge bu-dairy">${escapeHtml(s.milkType)}</span>
            <br><strong>${escapeHtml(s.dailyQuantity)}/day</strong>
          </td>
          <td>
            <strong>${s.durationDays} Days Plan</strong>
            <br><small class="text-muted">${escapeHtml(s.startDate)} → ${escapeHtml(s.endDate)}</small>
          </td>
          <td>
            <small style="font-weight: 600;">${escapeHtml(s.deliverySlot)}</small>
          </td>
          <td>
            <strong style="color: #165b33; font-size: 1.05rem;">${formatCurrency(s.totalAmount)}</strong>
            <br><small class="text-muted">₹${Number(s.dailyRate).toFixed(2)}/day</small>
          </td>
          <td>
            <span class="status-badge ${paymentBadgeClass}" style="cursor: pointer;" onclick="adminToggleSubPayment(${s.id}, '${s.paymentStatus}')" title="Click to toggle Payment Status">
              ${isPaid ? '✓ PAID' : '⏳ PENDING'}
            </span>
          </td>
          <td>
            <span class="sub-status-pill ${statusPillClass}">${escapeHtml(s.status)}</span>
          </td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${s.status === 'ACTIVE' ? `
                <button type="button" class="btn btn-outline btn-sm" onclick="adminUpdateSubStatus(${s.id}, 'PAUSED')" title="Pause delivery">
                  ⏸️ Pause
                </button>
              ` : ''}

              ${s.status === 'PAUSED' ? `
                <button type="button" class="btn btn-outline btn-sm" style="color: #166534; border-color: #86efac;" onclick="adminUpdateSubStatus(${s.id}, 'ACTIVE')" title="Resume delivery">
                  ▶️ Resume
                </button>
              ` : ''}

              ${(s.status === 'ACTIVE' || s.status === 'PAUSED') ? `
                <button type="button" class="btn btn-outline btn-sm" style="color: #991b1b; border-color: #fecaca;" onclick="adminUpdateSubStatus(${s.id}, 'CANCELLED')" title="Cancel subscription">
                  ✕ Cancel
                </button>
              ` : ''}

              ${s.status === 'CANCELLED' ? `
                <button type="button" class="btn btn-outline btn-sm" style="color: #166534; border-color: #86efac;" onclick="adminUpdateSubStatus(${s.id}, 'ACTIVE')" title="Reactivate subscription">
                  🔄 Reactivate
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  /**
   * Updates subscription status from Admin Dashboard
   */
  window.adminUpdateSubStatus = async function (id, newStatus) {
    if (!confirm(`Are you sure you want to change subscription #${id} status to ${newStatus}?`)) {
      return;
    }

    try {
      await authFetch(`${API_BASE}/admin/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: 'Admin updated from Command Center' })
      });
      showToast(`Subscription status updated to ${newStatus}`, 'success');
    } catch (e) {
      console.warn('API call failed; updating locally:', e);
      showToast(`Subscription status updated to ${newStatus} (Local Session)`, 'info');
    }

    // Update in local memory
    const sub = adminSubscriptionsMaster.find(s => s.id === id);
    if (sub) {
      sub.status = newStatus;
      if (newStatus === 'PAUSED') sub.pausedDate = new Date().toISOString().split('T')[0];
      else if (newStatus === 'ACTIVE') sub.pausedDate = null;
    }

    // Update localStorage
    try {
      const localRaw = localStorage.getItem('amrutha_local_subscriptions');
      if (localRaw) {
        const localList = JSON.parse(localRaw);
        const lsub = localList.find(s => s.id === id);
        if (lsub) {
          lsub.status = newStatus;
          localStorage.setItem('amrutha_local_subscriptions', JSON.stringify(localList));
        }
      }
    } catch (e) {}

    updateAdminSubFilterCounts();
    renderAdminSubscriptionsTable();
    loadDemandForSelectedDate();
  };

  /**
   * Toggles payment status between PAID and PENDING
   */
  window.adminToggleSubPayment = async function (id, currentStatus) {
    const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';

    try {
      await authFetch(`${API_BASE}/admin/subscriptions/${id}/payment?paymentStatus=${newStatus}`, {
        method: 'PATCH'
      });
      showToast(`Payment status updated to ${newStatus}`, 'success');
    } catch (e) {
      console.warn('API call failed; updating locally:', e);
      showToast(`Payment status updated to ${newStatus} (Local Session)`, 'info');
    }

    // Update in local memory
    const sub = adminSubscriptionsMaster.find(s => s.id === id);
    if (sub) {
      sub.paymentStatus = newStatus;
    }

    // Update localStorage
    try {
      const localRaw = localStorage.getItem('amrutha_local_subscriptions');
      if (localRaw) {
        const localList = JSON.parse(localRaw);
        const lsub = localList.find(s => s.id === id);
        if (lsub) {
          lsub.paymentStatus = newStatus;
          localStorage.setItem('amrutha_local_subscriptions', JSON.stringify(localList));
        }
      }
    } catch (e) {}

    calculateSubscriptionRevenue(adminSubscriptionsMaster);
    renderAdminSubscriptionsTable();
  };

})();

