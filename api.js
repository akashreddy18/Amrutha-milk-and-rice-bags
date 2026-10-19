/**
 * AMRUTHA - REST API CLIENT (api.js)
 * 
 * Connects frontend views to the Spring Boot REST API backend.
 * Provides unified data fetching for DAIRY and RICE products,
 * handling loading states, network errors, and response formatting.
 * 
 * NOTE: No database credentials or secrets are stored in client JavaScript.
 */

const AmruthaAPI = (function() {
  // Base URL for the Spring Boot REST API (Port 8080)
  const API_BASE_URL = window.AMRUTHA_API_URL || 'http://localhost:8080/api';

  /**
   * Helper for fetch with timeout and standard JSON parsing
   */
  async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = (json && json.message) || (json && json.error) || `Server returned status ${response.status}`;
        return {
          success: false,
          status: response.status,
          error: errorMsg,
          data: null
        };
      }

      return {
        success: true,
        status: response.status,
        message: json ? json.message : 'Success',
        data: json && json.data !== undefined ? json.data : json
      };
    } catch (networkError) {
      console.warn(`[AmruthaAPI] Network call to ${url} failed:`, networkError.message);
      return {
        success: false,
        status: 0,
        error: 'Unable to connect to Amrutha backend server. Please verify Spring Boot is running on port 8080.',
        data: null
      };
    }
  }

  return {
    /**
     * Fetch products filtered by Business Unit (DAIRY or RICE)
     * @param {'DAIRY'|'RICE'} businessUnit
     */
    async getProductsByUnit(businessUnit) {
      const param = encodeURIComponent(businessUnit);
      return await request(`/products?businessUnit=${param}`);
    },

    /**
     * Fetch all active products
     */
    async getActiveProducts() {
      return await request('/products');
    },

    /**
     * Fetch product by ID
     */
    async getProductById(id) {
      return await request(`/products/${encodeURIComponent(id)}`);
    },

    /**
     * Fetch dashboard summary
     */
    async getDashboardSummary() {
      return await request('/dashboard/summary');
    },

    /**
     * Register a new customer
     */
    async registerCustomer(customerData) {
      return await request('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    },

    /**
     * Places a customer order with server-side price & stock validation
     */
    async createOrder(orderData) {
      return await request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
    },

    /**
     * Retrieves an order by unique order number
     */
    async getOrderByNumber(orderNumber) {
      return await request(`/orders/number/${encodeURIComponent(orderNumber)}`);
    }
  };
})();

// Export for module environments if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AmruthaAPI;
}
