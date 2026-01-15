import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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

export const checkout = async (payload) => {
  const response = await api.post('/checkout/', payload);
  return response.data;
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
export const getDashboardStats = async (dateRange = 'last_7_days') => {
  const response = await api.get(`/dashboard/dashboard/stats?date_range=${dateRange}`);
  return response.data;
};

export const getRevenueData = async (dateRange = 'last_7_days') => {
  const response = await api.get(`/dashboard/dashboard/revenue?date_range=${dateRange}`);
  return response.data;
};

export const getTopSellingProducts = async (dateRange = 'last_7_days', limit = 5) => {
  const response = await api.get(`/dashboard/dashboard/top-products?date_range=${dateRange}&limit=${limit}`);
  return response.data;
};

export const getRecentOrders = async (limit = 10) => {
  const response = await api.get(`/dashboard/dashboard/recent-orders?limit=${limit}`);
  return response.data;
};

// Dashboard Cache Management API
export const getCacheHealth = async () => {
  const response = await api.get('/dashboard/dashboard/cache/health');
  return response.data;
};

export const getCacheStats = async () => {
  const response = await api.get('/dashboard/dashboard/cache/stats');
  return response.data;
};

export const invalidateCache = async () => {
  const response = await api.post('/dashboard/dashboard/cache/invalidate');
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

export default api;
