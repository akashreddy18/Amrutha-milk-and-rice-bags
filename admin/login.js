/**
 * AMRUTHA Admin Private Portal - Login Logic
 * Strictly handles administrator authentication and redirection to /admin/dashboard.
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

  const loginForm = document.getElementById('adminLoginForm');
  const loginUsernameInput = document.getElementById('loginUsername');
  const loginPasswordInput = document.getElementById('loginPassword');
  const togglePwBtn = document.getElementById('togglePwBtn');
  const loginAlert = document.getElementById('loginAlert');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');

  document.addEventListener('DOMContentLoaded', () => {
    handleUrlParams();
    checkIfAlreadyAuthenticated();
    initListeners();
  });

  function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const msg = params.get('msg');

    if (error === 'auth_required') {
      showAlert('🔒 Access restricted: Please sign in with administrator credentials to view the dashboard.', 'error');
    } else if (error === 'session_expired') {
      showAlert('⏳ Your session has expired or is invalid. Please sign in again.', 'info');
    } else if (msg === 'logged_out') {
      showAlert('✓ You have been securely signed out.', 'success');
    }
  }

  function checkIfAlreadyAuthenticated() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return;

    // Verify token validity with backend
    fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Token expired or invalid');
      })
      .then(json => {
        if (json.success && json.data) {
          // Already logged in, immediately redirect to dashboard
          window.location.replace('/admin/dashboard');
        } else {
          sessionStorage.clear();
        }
      })
      .catch(() => {
        // Clear invalid token
        sessionStorage.clear();
      });
  }

  function initListeners() {
    if (togglePwBtn && loginPasswordInput) {
      togglePwBtn.addEventListener('click', () => {
        const isPassword = loginPasswordInput.type === 'password';
        loginPasswordInput.type = isPassword ? 'text' : 'password';
        togglePwBtn.textContent = isPassword ? '🔒' : '👁️';
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', handleLoginSubmit);
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();

    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value;

    if (!username || !password) {
      showAlert('Please enter both username and password.', 'error');
      return;
    }

    setLoading(true);
    hideAlert();

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
        // Save session in sessionStorage
        sessionStorage.setItem(TOKEN_KEY, result.data.token);
        sessionStorage.setItem(USER_KEY, result.data.username);
        sessionStorage.setItem(ROLE_KEY, result.data.role);
        sessionStorage.setItem(NAME_KEY, result.data.fullName);

        showAlert('✓ Authentication successful. Redirecting to admin dashboard...', 'success');

        // Redirect directly to /admin/dashboard
        setTimeout(() => {
          window.location.replace('/admin/dashboard');
        }, 300);
      } else {
        showAlert(result.message || 'Invalid username or password. Please verify your administrator credentials.', 'error');
      }
    } catch (err) {
      showAlert('Unable to reach the backend authentication server (port 8080). Please ensure Spring Boot is running.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showAlert(message, type = 'error') {
    if (!loginAlert) return;
    loginAlert.textContent = message;
    loginAlert.className = `portal-alert ${type}`;
    loginAlert.style.display = 'block';
  }

  function hideAlert() {
    if (!loginAlert) return;
    loginAlert.style.display = 'none';
  }

  function setLoading(isLoading) {
    if (!loginSubmitBtn) return;
    const text = loginSubmitBtn.querySelector('.btn-text');
    const spinner = loginSubmitBtn.querySelector('.btn-spinner');
    if (text) text.style.display = isLoading ? 'none' : 'inline';
    if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
    loginSubmitBtn.disabled = isLoading;
  }
})();
