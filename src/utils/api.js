// SERVICES API
// Get all services for current branch with pagination support
export const getServices = async (filters = {}) => {
  const branchId = localStorage.getItem('branch_id');
  if (!branchId) {
    console.warn('No branch_id found in localStorage. Cannot fetch services.');
    return [];
  }
  
  const params = {
    branch_id: parseInt(branchId),
    skip: filters.skip || 0,
    limit: filters.limit || 100,
    ...filters
  };
  
  try {
    console.log('Fetching services with params:', params);
    const response = await api.get('/services/', { params });
    console.log('Services response:', response.data);
    
    // Handle both direct array and paginated response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.services || response.data?.results || response.data?.data || [];
  } catch (err) {
    console.error('Error fetching services:', err);
    throw err;
  }
};

// Get single service details
export const getServiceDetail = async (serviceId) => {
  const response = await api.get(`/services/${serviceId}`);
  return response.data;
};

// Create a new service
export const createService = async (serviceData) => {
  const branchId = localStorage.getItem('branch_id');
  const payload = {
    branch_id: parseInt(branchId),
    ...serviceData
  };
  console.log('Creating service with payload:', JSON.stringify(payload, null, 2));
  const response = await api.post('/services/', payload);
  return response.data;
};

// Update an existing service (name, description, field_schema, pricing_config, status)
export const updateService = async (serviceId, serviceData) => {
  const response = await api.patch(`/services/${serviceId}`, serviceData);
  return response.data;
};

// Delete a service
export const deleteService = async (serviceId) => {
  const response = await api.delete(`/services/${serviceId}`);
  return response.data;
};

// SERVICE ORDERS API
// Create a new service order
export const createServiceOrder = async (serviceId, orderData) => {
  const response = await api.post(`/services/${serviceId}/orders/`, orderData);
  return response.data;
};

// Get all service orders for current branch with filtering
export const getServiceOrders = async (filters = {}) => {
  const branchId = localStorage.getItem('branch_id');
  if (!branchId) return [];
  
  const params = {
    branch_id: parseInt(branchId),
    skip: filters.skip || 0,
    limit: filters.limit || 100,
    status: filters.status || undefined,
    ...filters
  };
  
  // Remove undefined params
  Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
  
  const response = await api.get('/services/orders/', { params });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.results || response.data?.data || [];
};

// Get service order details by ID
export const getServiceOrder = async (orderId) => {
  const response = await api.get(`/services/orders/${orderId}`);
  return response.data;
};

// Update service order (notes, deadline, etc.)
export const updateServiceOrder = async (orderId, orderData) => {
  const response = await api.patch(`/services/orders/${orderId}`, orderData);
  return response.data;
};

// Update service order status (pending → approved → processing → completed → delivered)
export const updateServiceOrderStatus = async (orderId, newStatus) => {
  const response = await api.patch(`/services/orders/${orderId}/status`, {}, { params: { new_status: newStatus } });
  return response.data;
};

// Calculate service price based on items/configuration
export const calculateServicePrice = async (serviceId, items) => {
  const response = await api.post(`/services/${serviceId}/calculate-price`, { items });
  return response.data;
};

// Generate quotation for service order
export const generateServiceQuotation = async (orderId) => {
  const response = await api.post(`/services/orders/${orderId}/quotation`);
  return response.data;
};
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const branchId = localStorage.getItem('branch_id');

    if (token) {
      // Always send Bearer token as per backend expectation
      config.headers.Authorization = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    }

    // Optional: send branch context header if present (backend may ignore if using JWT)
    if (branchId) {
      config.headers['X-Branch-ID'] = branchId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('Unauthorized (401). Clearing auth and redirecting to login.');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('branch_id');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      console.warn('Forbidden (403). Redirecting to /forbidden.');
      if (window.location.pathname !== '/forbidden') {
        window.location.href = '/forbidden';
      }
    }

    return Promise.reject(error);
  }
);

// API Endpoints
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const fetchQueue = async () => {
  const response = await api.get('/queue/');
  return response.data;
};

export const downloadJob = async (jobCode) => {
  const response = await api.get(`/queue/${jobCode}/download/`, {
    responseType: 'blob',
  });
  return response.data;
};
export const printJob = async (jobCode) => {
  const response = await api.get(`/queue/${jobCode}/print/`);
  return response.data;
}

export const scanProduct = async (barcode) => {
  const response = await api.get(`/scan/${barcode}`);
  return response.data;
};

// Handle mixed cart checkout (products + services)
export const checkoutMixed = async (cartItems, customerData) => {
  const products = cartItems.filter(item => item.type === 'PRODUCT');
  const services = cartItems.filter(item => item.type === 'SERVICE');
  
  const results = {
    products: null,
    services: [],
    totalAmount: 0
  };
  
  // Process products checkout if any
  if (products.length > 0) {
    const branchId = localStorage.getItem('branch_id');
    const productPayload = {
      payment_method: 'CASH',
      items: products.map(i => ({
        id: String(i.id),
        type: i.type,
        quantity: i.qty,
        price: i.price,
        name: i.name,
        product_id: String(i.id)
      })),
      ...(branchId ? { branch_id: parseInt(branchId) } : {})
    };
    results.products = await checkout(productPayload);
  }
  
  // Process each service as a separate order
  if (services.length > 0) {
    for (const service of services) {
      const orderData = {
        customer_name: customerData?.name || 'Customer',
        customer_phone: customerData?.phone || '',
        items_json: {
          service_name: service.name,
          quantity: service.qty,
          unit_price: service.price
        },
        deadline: customerData?.deadline || null,
        notes: customerData?.notes || ''
      };
      try {
        const serviceOrder = await createServiceOrder(service.id, orderData);
        results.services.push(serviceOrder);
      } catch (err) {
        console.error(`Error creating service order for ${service.name}:`, err);
        throw err;
      }
    }
  }
  
  return results;
};

export const checkout = async (payload) => {
  const branchId = localStorage.getItem('branch_id');
  const checkoutPayload = {
    ...payload,
    ...(branchId ? { branch_id: parseInt(branchId) } : {})
  };
  
  try {
    console.log('💳 POST /api/v1/checkout/ - Checkout Request:', checkoutPayload);
    const response = await api.post('/checkout/', checkoutPayload);
    const data = response.data;
    
    console.log('📋 RAW Response:', JSON.stringify(data, null, 2));
    
    // Extract order info - could be from products or services array
    let orderNumber = null;
    let orderId = null;
    let totalPrice = data.totalAmount || 0;
    let paymentStatus = 'unknown';
    let itemsList = [];
    
    // Check if products array has order data
    if (data.products && data.products.length > 0) {
      const firstProduct = data.products[0];
      orderNumber = firstProduct.order_number || null;
      orderId = firstProduct.id || null;
      totalPrice = firstProduct.total_price || data.totalAmount || 0;
      paymentStatus = firstProduct.payment_status || 'unknown';
      
      console.log('📦 Products in Order:');
      data.products.forEach((prod, idx) => {
        const itemName = prod.service_name || prod.name || 'Unknown';
        const qty = prod.quantity || 1;
        const price = prod.unit_price || 0;
        const total = prod.total_price || (qty * price);
        console.log(`  📦 ${idx + 1}. ${itemName} x${qty} @ Tzs ${price.toLocaleString()} = Tzs ${total.toLocaleString()}`);
        itemsList.push(`${itemName} (x${qty})`);
      });
    }
    
    // Check if services array has order data
    if (data.services && data.services.length > 0) {
      const firstService = data.services[0];
      orderNumber = firstService.order_number || orderNumber;
      orderId = firstService.id || orderId;
      totalPrice = firstService.total_price || totalPrice;
      paymentStatus = firstService.payment_status || paymentStatus;
      
      console.log('🎯 Services in Order:');
      data.services.forEach((svc, idx) => {
        const items = svc.items_json || {};
        const itemName = items.service_name || svc.service_name || 'Unknown Service';
        const qty = items.quantity || 1;
        const price = items.unit_price || svc.unit_price || 0;
        const total = svc.total_price || (qty * price);
        console.log(`  🎯 ${idx + 1}. ${itemName} x${qty} @ Tzs ${price.toLocaleString()} = Tzs ${total.toLocaleString()}`);
        itemsList.push(`${itemName} (x${qty})`);
      });
    }
    
    console.log('✅ Checkout Success:', {
      order_number: orderNumber,
      order_id: orderId,
      total_price: totalPrice,
      payment_status: paymentStatus,
      products_count: data.products?.length || 0,
      services_count: data.services?.length || 0
    });
    
    console.log('📊 Order Summary:', {
      order_number: orderNumber,
      total_items: (data.products?.length || 0) + (data.services?.length || 0),
      items: itemsList,
      total: `Tzs ${totalPrice.toLocaleString()}`,
      payment_status: paymentStatus
    });
    
    return data;
  } catch (err) {
    console.error('❌ Checkout Error:', err.response?.data || err.message);
    throw err;
  }
};

// Admin Settings API
export const getSettings = async () => {
  const response = await api.get('/admin/settings/');
  return response.data;
};

export const updateSettings = async (settings) => {
  const response = await api.put('/admin/settings/', settings);
  return response.data;
};

export const getPrinters = async () => {
  const response = await api.get('/admin/printers/');
  return response.data;
};

export const addPrinter = async (printer) => {
// Confirm a job printed successfully and deduct stock

  const response = await api.post('/admin/printers/', printer);
  return response.data;
};

export const deductStockForJob = async (jobCode, payload = {}) => {
  // Using POST for a state-changing operation; send optional details
  const response = await api.post(`/queue/${jobCode}/deduct-stock/`, payload);
  return response.data;
};
export const updatePrinter = async (id, printer) => {
  const response = await api.put(`/admin/printers/${id}/`, printer);
  return response.data;
};

export const deletePrinter = async (id) => {
  const response = await api.delete(`/admin/printers/${id}/`);
  return response.data;
};

export const controlPrinter = async (action) => {
  const response = await api.post('/admin/printer/control', { action });
  return response.data;
};

// Printer Logs API
// Fetch logs for a specific printer by id or name
// Usage: getPrinterLogs({ printerId: 1 }) or getPrinterLogs({ printerName: 'HP-Laser' })
export const getPrinterLogs = async ({ printerId, printerName, limit, from, to } = {}) => {
  const params = {};
  if (printerId) params.printer_id = printerId;
  if (printerName) params.printer = printerName;
  if (limit) params.limit = limit;
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await api.get('/admin/printer/logs', { params });
  return response.data;
};

export const getRecipes = async () => {
  const response = await api.get('/admin/recipes/');
  return response.data;
};

export const addRecipe = async (recipe) => {
  const response = await api.post('/admin/recipes/', recipe);
  return response.data;
};

export const updateRecipe = async (id, recipe) => {
  const response = await api.put(`/admin/recipes/${id}/`, recipe);
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await api.delete(`/admin/recipes/${id}/`);
  return response.data;
};

// Product/Inventory API
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/products/?${params}`);
  // Handle both direct array and paginated response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.results || response.data?.data || [];
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

export const createProduct = async (product) => {
  const response = await api.post('/products/', product);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`/products/${id}/`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}/`);
  return response.data;
};

// Dashboard API
export const getDashboardStats = async (dateParams = {}) => {
  const params = new URLSearchParams();
  
  if (dateParams.date_range) {
    params.append('date_range', dateParams.date_range);
  }
  if (dateParams.start_date) {
    params.append('start_date', dateParams.start_date);
  }
  if (dateParams.end_date) {
    params.append('end_date', dateParams.end_date);
  }
  
  try {
    console.log('📊 GET /api/v1/dashboard/stats - Fetching KPI summary', { dateParams });
    const response = await api.get(`/dashboard/stats?${params}`);
    console.log('✅ /dashboard/stats Full Response:', response.data);
    console.log('📊 KPI Summary:', {
      totalRevenue: response.data.totalRevenue,
      revenueChange: response.data.revenueChange,
      totalOrders: response.data.totalOrders,
      ordersChange: response.data.ordersChange,
      totalExpenses: response.data.totalExpenses,
      expensesChange: response.data.expensesChange,
      rentalIncome: response.data.rentalIncome,
      netMargin: response.data.netMargin,
      period: `${response.data.start_date} to ${response.data.end_date}`,
      timezone: response.data.timezone,
      system_status: response.data.system_status
    });
    return response.data;
  } catch (err) {
    console.error('/dashboard/stats Error:', err);
    throw err;
  }
};

export const getRevenueData = async (dateParams = {}) => {
  const params = new URLSearchParams();
  
  if (dateParams.date_range) {
    params.append('date_range', dateParams.date_range);
  }
  if (dateParams.start_date) {
    params.append('start_date', dateParams.start_date);
  }
  if (dateParams.end_date) {
    params.append('end_date', dateParams.end_date);
  }
  
  try {
    console.log('📈 GET /api/v1/dashboard/revenue - Fetching revenue time-series', { dateParams });
    const response = await api.get(`/dashboard/revenue?${params}`);
    console.log('✅ /dashboard/revenue Response:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ /dashboard/revenue Error:', err);
    throw err;
  }
};

export const getTopSellingProducts = async (dateParams = {}, limit = 5) => {
  const params = new URLSearchParams();
  
  if (dateParams.date_range) {
    params.append('date_range', dateParams.date_range);
  }
  if (dateParams.start_date) {
    params.append('start_date', dateParams.start_date);
  }
  if (dateParams.end_date) {
    params.append('end_date', dateParams.end_date);
  }
  params.append('limit', limit);
  
  try {
    console.log('🏆 GET /api/v1/dashboard/top-products - Fetching top selling items', { limit, dateParams });
    const response = await api.get(`/dashboard/top-products?${params}`);
    console.log(' /dashboard/top-products Full Response:', response.data);
    console.log('Products array:', response.data?.products);
    if (response.data?.products && Array.isArray(response.data.products)) {
      console.log(`🏆 Found ${response.data.products.length} products:`, response.data.products.map(p => ({
        productName: p.productName,
        quantitySold: p.quantitySold,
        revenue: p.revenue
      })));
    }
    return response.data;
  } catch (err) {
    console.error(' /dashboard/top-products Error:', err);
    throw err;
  }
};

export const getRecentOrders = async (limit = 10) => {
  try {
    console.log('📦 GET /api/v1/dashboard/recent-orders - Fetching real-time recent orders', { limit });
    const response = await api.get(`/dashboard/recent-orders?limit=${limit}`);
    console.log('✅ /dashboard/recent-orders Response:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ /dashboard/recent-orders Error:', err);
    throw err;
  }
};

// Rental Revenue API
export const getRentalIncome = async () => {
  try {
    console.log('🏠 GET /api/v1/dashboard/rental-income - Fetching rental analytics');
    const response = await api.get('/dashboard/rental-income');
    console.log('✅ /dashboard/rental-income Response:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ /dashboard/rental-income Error:', err);
    throw err;
  }
};

// Get top services
export const getTopServices = async (dateParams = {}, limit = 5) => {
  const params = new URLSearchParams();
  
  if (dateParams.date_range) {
    params.append('date_range', dateParams.date_range);
  }
  if (dateParams.start_date) {
    params.append('start_date', dateParams.start_date);
  }
  if (dateParams.end_date) {
    params.append('end_date', dateParams.end_date);
  }
  params.append('limit', limit);
  
  try {
    console.log('🛠️ GET /api/v1/dashboard/top-services - Fetching top services', { limit, dateParams });
    const response = await api.get(`/dashboard/top-services?${params}`);
    console.log('✅ /dashboard/top-services Response:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ /dashboard/top-services Error:', err);
    throw err;
  }
};

// Get expenses breakdown by category
export const getExpensesBreakdown = async (dateParams = {}) => {
  const params = new URLSearchParams();
  
  if (dateParams.date_range) {
    params.append('date_range', dateParams.date_range);
  }
  if (dateParams.start_date) {
    params.append('start_date', dateParams.start_date);
  }
  if (dateParams.end_date) {
    params.append('end_date', dateParams.end_date);
  }
  
  try {
    console.log('💰 GET /api/v1/dashboard/expenses-breakdown - Fetching expenses by category', { dateParams });
    const response = await api.get(`/dashboard/expenses-breakdown?${params}`);
    console.log('✅ /dashboard/expenses-breakdown Response:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ /dashboard/expenses-breakdown Error:', err);
    throw err;
  }
};

// Get recent expenses
export const getRecentExpenses = async (limit = 10) => {
  try {
    console.log('📊 GET /api/v1/dashboard/recent-expenses - Fetching real-time expenses', { limit });
    const response = await api.get(`/dashboard/recent-expenses?limit=${limit}`);
    console.log('✅ /dashboard/recent-expenses Response:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ /dashboard/recent-expenses Error:', err);
    throw err;
  }
};

// Get revenue vs expenses comparison
export const getRevenueVsExpenses = async (dateParams = {}) => {
  const params = new URLSearchParams();
  
  if (dateParams.date_range) {
    params.append('date_range', dateParams.date_range);
  }
  if (dateParams.start_date) {
    params.append('start_date', dateParams.start_date);
  }
  if (dateParams.end_date) {
    params.append('end_date', dateParams.end_date);
  }
  
  try {
    console.log('⚖️ GET /api/v1/dashboard/comparison/revenue-vs-expenses - Fetching revenue vs expenses', { dateParams });
    const response = await api.get(`/dashboard/comparison/revenue-vs-expenses?${params}`);
    console.log('✅ /dashboard/comparison/revenue-vs-expenses Response:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ /dashboard/comparison/revenue-vs-expenses Error:', err);
    throw err;
  }
};

export const getCacheHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getCacheStats = async () => {
  const response = await api.get('/dashboard/cache/stats');
  return response.data;
};

export const invalidateCache = async () => {
  const response = await api.post('/dashboard/cache/invalidate');
  return response.data;
};

// Auth API
// Use trailing slashes to match DRF-style endpoints and avoid 301/405/401 issues
export const login = async (credentials) => {
  const response = await api.post('/auth/login/', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout/');
  return response.data;
};

// Branch API
export const getBranches = async () => {
  const response = await api.get('/branches/');
  // Handle both direct array and paginated response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.results || response.data?.data || [];
};

export const getBranch = async (id) => {
  const response = await api.get(`/branches/${id}/`);
  return response.data;
};

export const createBranch = async (branch) => {
  const response = await api.post('/branches/', branch);
  return response.data;
};

export const updateBranch = async (id, branch) => {
  const response = await api.put(`/branches/${id}/`, branch);
  return response.data;
};

export const deleteBranch = async (id) => {
  const response = await api.delete(`/branches/${id}/`);
  return response.data;
};

// Staff API
export const getStaff = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/staff/?${params}`);
  // Handle both direct array and paginated response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  const result = response.data?.results || response.data?.data || [];
  return result;
};

export const getStaffMember = async (id) => {
  const response = await api.get(`/staff/${id}/`);
  return response.data;
};

export const createStaff = async (staff) => {
  const response = await api.post('/staff/', staff);
  return response.data;
};

export const updateStaff = async (id, staff) => {
  const response = await api.put(`/staff/${id}/`, staff);
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await api.delete(`/staff/${id}/`);
  return response.data;
};

// Authentication Helper Functions
export const isAuthenticated = () => {
  // Owner accounts may not have branch_id; authentication should rely on token (and user presence)
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const roleRaw = user.role || user.role_name || user.user_type;
  return typeof roleRaw === 'string' ? roleRaw.toLowerCase() : roleRaw;
};

export const hasRole = (allowedRoles = []) => {
  const role = getUserRole();
  if (!role) return false;
  
  const normalized = allowedRoles.map(r => r.toLowerCase());
  return normalized.includes(role);
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('branch_id');
  localStorage.removeItem('role');
};

// ============================================
// LAND MANAGEMENT API
// ============================================

// Create a new land listing
export const createLandListing = async (listingData) => {
  console.log('[API] Creating land listing with data:', listingData);
  console.log('[API] Images in request:', listingData.images);
  const response = await api.post('/lands/', listingData);
  console.log('[API] Response from server:', response.data);
  return response.data;
};

// Helper function to transform backend response to match frontend expectations
const transformLandListing = (listing) => {
  if (!listing) return listing;
  return {
    ...listing,
    // Transform status field to is_published boolean
    is_published: listing.status === 'Published' || listing.is_published === true,
    is_archived: listing.status === 'Archived' || listing.is_archived === true,
    // Transform images if needed
    images: listing.images || (listing.coverImageUrl ? [{ url: listing.coverImageUrl, isCover: true }] : []),
    // Ensure addressDistrict matches backend field
    addressDistrict: listing.addressDistrict || listing.addressRegion || '',
  };
};

// Get all land listings
export const getLandListings = async (params = {}) => {
  const response = await api.get('/lands/', { params });
  let data;
  // Handle both direct array and paginated response
  if (Array.isArray(response.data)) {
    data = response.data;
  } else {
    data = response.data?.results || response.data?.data || [];
  }
  console.log('[API] Raw land listings response:', data);
  // Transform all listings
  const transformed = data.map(transformLandListing);
  console.log('[API] Transformed land listings:', transformed);
  return transformed;
};

// Get a specific land listing by ID
export const getLandListing = async (listingId) => {
  const response = await api.get(`/lands/${listingId}`);
  const transformed = transformLandListing(response.data);
  console.log('[API] Raw single listing:', response.data);
  console.log('[API] Transformed single listing:', transformed);
  return transformed;
};

// Update a land listing
export const updateLandListing = async (listingId, listingData) => {
  console.log('[API] Updating land listing ID:', listingId);
  console.log('[API] Update data:', listingData);
  console.log('[API] Images in request:', listingData.images);
  const response = await api.put(`/lands/${listingId}`, listingData);
  console.log('[API] Response from server:', response.data);
  return response.data;
};

// Delete a land listing
export const deleteLandListing = async (listingId) => {
  const response = await api.delete(`/lands/${listingId}`);
  return response.data;
};

// Publish a land listing
export const publishLandListing = async (listingId) => {
  console.log('[API PUBLISH] Sending request for listing ID:', listingId);
  const response = await api.post(`/lands/${listingId}/publish`);
  console.log('[API PUBLISH] Response from server:', response.data);
  const transformed = transformLandListing(response.data);
  console.log('[API PUBLISH] Transformed response:', transformed);
  return transformed;
};

// Archive a land listing
export const archiveLandListing = async (listingId) => {
  console.log('[API ARCHIVE] Sending request for listing ID:', listingId);
  const response = await api.post(`/lands/${listingId}/archive`);
  console.log('[API ARCHIVE] Response from server:', response.data);
  const transformed = transformLandListing(response.data);
  console.log('[API ARCHIVE] Transformed response:', transformed);
  return transformed;
};

// ============================================
// LAND VISIT REQUESTS API
// ============================================

// Create a visit request for a land listing
export const createVisitRequest = async (listingId, requestData) => {
  const response = await api.post(`/lands/${listingId}/visit-requests`, requestData);
  return response.data;
};

// Get all visit requests for a specific land listing
export const getVisitRequests = async (listingId, params = {}) => {
  const response = await api.get(`/lands/${listingId}/visit-requests`, { params });
  let data = response.data?.requests || (Array.isArray(response.data) ? response.data : (response.data?.results || response.data?.data || []));
  return data.map(transformVisitRequest);
};

// Transform visit request data from API format to UI format
const transformVisitRequest = (request) => {
  if (!request) return request;
  
  // Extract date and time from preferredVisitDate
  let preferred_date = null;
  let preferred_time = null;
  
  if (request.preferredVisitDate) {
    try {
      const date = new Date(request.preferredVisitDate);
      preferred_date = date.toISOString().split('T')[0]; // YYYY-MM-DD
      preferred_time = date.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    } catch (err) {
      console.warn('[API] Error parsing preferredVisitDate:', err);
    }
  }
  
  return {
    ...request,
    // Map requester fields to visitor fields
    visitor_name: request.requesterName || request.visitorName,
    visitor_email: request.requesterEmail || request.visitorEmail,
    visitor_phone: request.requesterPhone || request.visitorPhone,
    preferred_date: preferred_date,
    preferred_time: preferred_time,
  };
};

// Get all visit requests across all listings
export const getAllVisitRequests = async (params = {}) => {
  try {
    const response = await api.get('/lands/visit-requests', { params });
    // Handle different response formats: requests property, results, data, or direct array
    let data = response.data?.requests || (Array.isArray(response.data) ? response.data : (response.data?.results || response.data?.data || []));
    return data.map(transformVisitRequest);
  } catch (err) {
    // If global endpoint fails, fetch from all listings
    if (err.response?.status === 404) {
      try {
        const listings = await getLandListings();
        const allRequests = [];
        
        for (const listing of listings) {
          try {
            const requests = await getVisitRequests(listing.id);
            if (requests && requests.length > 0) {
              allRequests.push(...requests);
            }
          } catch (listingErr) {
            // Skip this listing if error
          }
        }
        
        return allRequests;
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
};

// Get details of a specific visit request
export const getVisitRequest = async (requestId) => {
  const response = await api.get(`/lands/visit-requests/${requestId}`);
  return response.data;
};

// Update visit request status
export const updateVisitRequestStatus = async (requestId, newStatus) => {
  const response = await api.put(`/lands/visit-requests/${requestId}/status?new_status=${newStatus}`);
  return response.data;
};

// ============================================
// RENTAL MANAGEMENT API ENDPOINTS
// ============================================

// PERSONS (Renters) - Actors
export const getPersons = async () => {
  const response = await api.get('/rentals/persons');
  return response.data;
};

export const getPerson = async (personId) => {
  const response = await api.get(`/rentals/persons/${personId}`);
  return response.data;
};

export const createPerson = async (personData) => {
  const response = await api.post('/rentals/persons', personData);
  return response.data;
};

export const updatePerson = async (personId, personData) => {
  const response = await api.put(`/rentals/persons/${personId}`, personData);
  return response.data;
};

export const deletePerson = async (personId, hardDelete = false) => {
  const params = hardDelete ? '?hard_delete=true' : '';
  const response = await api.delete(`/rentals/persons/${personId}${params}`);
  return response.data;
};

// ============= EXPENSES API =============

// Expense Categories
export const getExpenseCategories = async (filters = {}) => {
  const branchId = localStorage.getItem('branch_id');
  if (!branchId) {
    console.warn('No branch_id found. Cannot fetch expense categories.');
    return [];
  }
  
  const params = {
    branch_id: parseInt(branchId),
    ...filters
  };
  
  try {
    const response = await api.get('/expenses/categories', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('Error fetching expense categories:', err);
    throw err;
  }
};

export const createExpenseCategory = async (categoryData) => {
  const branchId = localStorage.getItem('branch_id');
  const payload = {
    ...categoryData,
    branch_id: parseInt(branchId)
  };
  const response = await api.post('/expenses/categories', payload);
  return response.data;
};

export const updateExpenseCategory = async (categoryId, categoryData) => {
  const response = await api.patch(`/expenses/categories/${categoryId}`, categoryData);
  return response.data;
};

export const deleteExpenseCategory = async (categoryId) => {
  const response = await api.delete(`/expenses/categories/${categoryId}`);
  return response.data;
};

// Expenses
export const getExpenses = async (filters = {}) => {
  const branchId = localStorage.getItem('branch_id');
  if (!branchId) {
    console.warn('No branch_id found. Cannot fetch expenses.');
    return [];
  }
  
  const params = {
    branch_id: parseInt(branchId),
    ...filters
  };
  
  try {
    const response = await api.get('/expenses/', { params });
    console.log('Expenses response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('Error fetching expenses:', err);
    throw err;
  }
};

export const getExpenseDetail = async (expenseId) => {
  const response = await api.get(`/expenses/${expenseId}`);
  return response.data;
};

export const createExpense = async (expenseData) => {
  const branchId = localStorage.getItem('branch_id');
  const payload = {
    ...expenseData,
    branch_id: parseInt(branchId)
  };
  const response = await api.post('/expenses/', payload);
  return response.data;
};

export const updateExpense = async (expenseId, expenseData) => {
  const response = await api.patch(`/expenses/${expenseId}`, expenseData);
  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await api.delete(`/expenses/${expenseId}`);
  return response.data;
};

// Recurring Expenses
export const getRecurringExpenses = async (filters = {}) => {
  const branchId = localStorage.getItem('branch_id');
  if (!branchId) {
    console.warn('No branch_id found. Cannot fetch recurring expenses.');
    return [];
  }
  
  const params = {
    branch_id: parseInt(branchId),
    ...filters
  };
  
  try {
    const response = await api.get('/expenses/recurring', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('Error fetching recurring expenses:', err);
    throw err;
  }
};

export const createRecurringExpense = async (recurringData) => {
  const branchId = localStorage.getItem('branch_id');
  const payload = {
    ...recurringData,
    branch_id: parseInt(branchId)
  };
  const response = await api.post('/expenses/recurring', payload);
  return response.data;
};

export const updateRecurringExpense = async (recurringId, recurringData) => {
  const response = await api.patch(`/expenses/recurring/${recurringId}`, recurringData);
  return response.data;
};

// Reports
export const getDailyExpenseReport = async (date) => {
  const branchId = localStorage.getItem('branch_id');
  const params = {
    branch_id: parseInt(branchId),
    date: date
  };
  const response = await api.get('/expenses/reports/daily', { params });
  return response.data;
};

// SPONSORS (Financial Backers) - Guarantors
export const getSponsors = async () => {
  const response = await api.get('/rentals/sponsors');
  return response.data;
};

export const getSponsor = async (sponsorId) => {
  const response = await api.get(`/rentals/sponsors/${sponsorId}`);
  return response.data;
};

export const createSponsor = async (sponsorData) => {
  const response = await api.post('/rentals/sponsors', sponsorData);
  return response.data;
};

export const updateSponsor = async (sponsorId, sponsorData) => {
  const response = await api.put(`/rentals/sponsors/${sponsorId}`, sponsorData);
  return response.data;
};

export const deleteSponsor = async (sponsorId, hardDelete = false) => {
  const params = hardDelete ? '?hard_delete=true' : '';
  const response = await api.delete(`/rentals/sponsors/${sponsorId}${params}`);
  return response.data;
};

// EQUIPMENT (Assets) - Resources
export const getEquipment = async () => {
  const response = await api.get('/rentals/equipment');
  return response.data;
};

export const getEquipmentDetail = async (equipmentId) => {
  const response = await api.get(`/rentals/equipment/${equipmentId}`);
  return response.data;
};

export const createEquipment = async (equipmentData) => {
  const response = await api.post('/rentals/equipment', equipmentData);
  return response.data;
};
export const deleteEquipment = async (equipmentId, force = false) => {
  const params = force ? '?force=true' : '';
  const response = await api.delete(`/rentals/equipment/${equipmentId}${params}`);
  return response.data;
};


export const updateEquipment = async (equipmentId, equipmentData) => {
  const response = await api.put(`/rentals/equipment/${equipmentId}`, equipmentData);
  return response.data;
};

// RENTALS (Contracts) - Core lifecycle
export const getRentals = async () => {
  const response = await api.get('/rentals');
  return response.data;
};

export const getActiveRentals = async () => {
  const response = await api.get('/rentals/active');
  return response.data;
};

export const getOverdueRentals = async () => {
  const response = await api.get('/rentals/overdue');
  return response.data;
};

export const getRentalDetail = async (rentalId) => {
  const response = await api.get(`/rentals/${rentalId}`);
  return response.data;
};

export const createRental = async (rentalData) => {
  const response = await api.post('/rentals', rentalData);
  return response.data;
};

export const updateRental = async (rentalId, rentalData) => {
  const response = await api.put(`/rentals/${rentalId}`, rentalData);
  return response.data;
};

// RETURNS - Equipment return workflow
export const returnEquipment = async (rentalId, returnData) => {
  const response = await api.post(`/rentals/${rentalId}/return`, returnData);
  return response.data;
};

// OVERDUE REASONS - Dispute resolution
export const recordOverdueReason = async (rentalId, reasonData) => {
  const response = await api.post(`/rentals/${rentalId}/overdue-reason`, reasonData);
  return response.data;
};

// DASHBOARD & STATS - Insights
export const getRentalsSummary = async () => {
  const response = await api.get('/rentals/stats/summary');
  return response.data;
};

export const getTopEquipment = async () => {
  const response = await api.get('/rentals/stats/top-equipment');
  return response.data;
};

export default api;
