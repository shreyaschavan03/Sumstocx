const API_BASE_URL = "http://localhost:5000/api";

// Helper function that accepts token as parameter
export const apiRequestWithToken = async (endpoint, token, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Public API calls (no token required)
export const authAPI = {
  register: (userData) => apiRequestWithToken('/auth/register', null, {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  login: (credentials) => apiRequestWithToken('/auth/login', null, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
};

// Protected API calls (token required)
export const productAPI = (token) => ({
  getAll: () => apiRequestWithToken('/products', token),
  getById: (id) => apiRequestWithToken(`/products/${id}`, token),
  create: (productData) => apiRequestWithToken('/products', token, {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  update: (id, productData) => apiRequestWithToken(`/products/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  updateStock: (id, stockData) => apiRequestWithToken(`/products/${id}/stock`, token, {
    method: 'PUT',
    body: JSON.stringify(stockData),
  }),
  delete: (id) => apiRequestWithToken(`/products/${id}`, token, {
    method: 'DELETE',
  }),
});

export const dashboardAPI = (token) => ({
  getStats: () => apiRequestWithToken('/dashboard/stats', token),
  getRecentProducts: () => apiRequestWithToken('/dashboard/recent-products', token),
});

export const supplierAPI = (token) => ({
  getAll: () => apiRequestWithToken('/suppliers', token),
  create: (supplierData) => apiRequestWithToken('/suppliers', token, {
    method: 'POST',
    body: JSON.stringify(supplierData),
  }),
});

// For components that need to use the API
export const getAPIWithToken = async (getSession) => {
  const { data: { session } } = await getSession();
  const token = session?.access_token;
  
  return {
    products: productAPI(token),
    dashboard: dashboardAPI(token),
    suppliers: supplierAPI(token),
    auth: {
      getProfile: () => apiRequestWithToken('/auth/profile', token),
      updateProfile: (profileData) => apiRequestWithToken('/auth/profile', token, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    }
  };
};