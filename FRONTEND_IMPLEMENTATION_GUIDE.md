# Frontend Implementation Guide - Multi-Tenant System

## Overview

The backend now supports multi-tenant data isolation where each shop/branch has completely isolated data. The frontend must be updated to:

1. **Store authentication tokens and branch context** after login
2. **Add authorization headers** to all API requests
3. **Handle tenant-aware errors** (401, 403)
4. **Display branch/shop context** to users
5. **Filter all API calls** through the tenant context

---

## Part 1: Setup Axios with Authorization

### Step 1: Create API Client Instance

Create or update `src/services/api.js`:

```javascript
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
});

// Request interceptor - Add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Access denied - insufficient permissions or wrong branch
      console.error('Access denied:', error.response.data);
      window.location.href = '/forbidden';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Part 2: Update Login Component

### Step 2: Store JWT Token and Branch Context

Update `src/pages/Login.jsx` (or similar):

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/login',
        { username, password }
      );

      // ✅ Store token
      localStorage.setItem('token', response.data.token);

      // ✅ Store branch_id (tenant context)
      localStorage.setItem('branch_id', response.data.user.branch_id);

      // ✅ Store user info
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // ✅ Store role for permission checks
      localStorage.setItem('role', response.data.user.role);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
```

---

## Part 3: Update Dashboard Component

### Step 3: Display Branch Context

Update `src/pages/Dashboard.jsx`:

```javascript
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Get branch context from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const branch_id = localStorage.getItem('branch_id');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // ✅ Authorization header added automatically by interceptor
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    if (branch_id) {
      fetchStats();
    }
  }, [branch_id]);

  if (!branch_id) {
    return <div>Please login first</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
        {/* ✅ Display current branch/shop */}
        <div className="branch-info">
          <span>Shop ID: {branch_id}</span>
          <span>User: {user.username} ({user.role})</span>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{stats.total_orders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>${stats.total_revenue?.toFixed(2) || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Products Sold</h3>
            <p>{stats.total_products_sold}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
```

---

## Part 4: Update API Call Patterns

### Step 4: Inventory Management

Update `src/pages/Inventory.jsx`:

```javascript
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // ✅ Authorization header added automatically
      // ✅ Backend filters by branch_id from JWT token
      const response = await api.get('/inventory/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      // ✅ Backend automatically sets branch_id from JWT
      const response = await api.post('/inventory/products', productData);
      setProducts([...products, response.data]);
    } catch (err) {
      console.error('Failed to add product:', err.response?.data);
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      // ✅ Backend verifies product belongs to user's branch
      const response = await api.put(`/inventory/products/${id}`, productData);
      setProducts(products.map((p) => (p.id === id ? response.data : p)));
    } catch (err) {
      if (err.response?.status === 403) {
        console.error('Product does not belong to your branch');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="inventory">
      <h2>Inventory Management</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Barcode</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.barcode}</td>
              <td>${product.price}</td>
              <td>{product.stock_quantity}</td>
              <td>
                <button onClick={() => handleUpdateProduct(product.id, {})}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
```

---

## Part 5: Update POS/Checkout

### Step 5: Point of Sale System

Update `src/pages/POS.jsx`:

```javascript
import React, { useState } from 'react';
import api from '../services/api';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const handleCheckout = async () => {
    try {
      const orderData = {
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: totalAmount,
      };

      // ✅ Authorization header added automatically
      // ✅ Backend creates order with current user's branch_id
      const response = await api.post('/pos/checkout', orderData);

      console.log('Order created:', response.data);
      
      // ✅ Print receipt if print_job_id returned
      if (response.data.print_job_id) {
        console.log('Print job queued:', response.data.print_job_id);
      }

      // Reset cart
      setCart([]);
      setTotalAmount(0);

      alert('Order completed successfully');
    } catch (err) {
      console.error('Checkout failed:', err.response?.data);
    }
  };

  return (
    <div className="pos">
      <h2>Point of Sale</h2>
      {/* Cart UI */}
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
};

export default POS;
```

---

## Part 6: Implement Logout

### Step 6: Clean Logout

Update `src/components/Navigation.jsx` or similar:

```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ Clear all stored authentication and branch data
    localStorage.removeItem('token');
    localStorage.removeItem('branch_id');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    // Redirect to login
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const branch_id = localStorage.getItem('branch_id');

  return (
    <nav className="navbar">
      <div className="navbar-brand">JJM POS</div>
      <div className="navbar-info">
        {/* ✅ Display current branch context */}
        <span className="branch-badge">Shop {branch_id}</span>
        <span className="user-info">{user.username}</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
```

---

## Part 7: Protected Routes

### Step 7: Route Protection

Create `src/components/ProtectedRoute.jsx`:

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // ✅ Check if user has valid token and branch_id
  const token = localStorage.getItem('token');
  const branch_id = localStorage.getItem('branch_id');

  if (!token || !branch_id) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

Update `src/App.jsx`:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* ✅ Protected routes require valid token and branch_id */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <POS />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## Part 8: Error Handling

### Step 8: Custom Error Handler

Create `src/utils/errorHandler.js`:

```javascript
export const handleApiError = (error, context = '') => {
  const status = error.response?.status;
  const message = error.response?.data?.detail || error.message;

  switch (status) {
    case 400:
      console.error(`Bad Request (${context}):`, message);
      return 'Invalid input. Please check your data.';

    case 401:
      console.error(`Unauthorized (${context}):`, message);
      localStorage.clear();
      window.location.href = '/login';
      return 'Session expired. Please login again.';

    case 403:
      console.error(`Forbidden (${context}):`, message);
      return 'You do not have permission to access this resource.';

    case 404:
      console.error(`Not Found (${context}):`, message);
      return 'Resource not found.';

    case 500:
      console.error(`Server Error (${context}):`, message);
      return 'Server error. Please try again later.';

    default:
      console.error(`Error (${context}):`, message);
      return message;
  }
};
```

Use in components:

```javascript
import { handleApiError } from '../utils/errorHandler';

try {
  const response = await api.get('/dashboard/stats');
} catch (err) {
  const errorMsg = handleApiError(err, 'Dashboard Stats');
  setError(errorMsg);
}
```

---

## Part 9: Testing Tenant Isolation

### Step 9: Verify Multi-Tenant Isolation

**Test Checklist**:

1. **Login as User 1**:
   ```
   - Log in with user from branch_id=1
   - Verify token stored in localStorage
   - Verify branch_id=1 stored
   - Verify dashboard shows only branch 1 data
   ```

2. **Create Order**:
   ```
   - Add items to cart
   - Checkout
   - Verify order appears in dashboard
   - Check backend: order has branch_id=1
   ```

3. **Verify Data Isolation**:
   ```
   - Open browser dev tools → Application → Storage → localStorage
   - Verify: token, branch_id, user, role are present
   - Manually check Network tab: Authorization header sent
   ```

4. **Test Cross-Branch Access Denial** (if applicable):
   ```
   - Create order for branch 1 (order_id=1)
   - Try to GET /api/v1/orders/1 → Should return order
   - Switch to branch 2 (impossible without new login)
   - Verify branch 2 user cannot see branch 1 orders
   ```

5. **Logout and Re-login**:
   ```
   - Click logout
   - Verify localStorage cleared
   - Verify redirected to login
   - Re-login
   - Verify new token stored
   - Verify correct branch_id
   ```

---

## Part 10: Common Issues & Solutions

### Issue 1: "401 Unauthorized" on every request

**Cause**: Token not being sent or token expired
**Solution**:
```javascript
// Verify token exists in localStorage
console.log('Token:', localStorage.getItem('token'));
// Verify axios interceptor is adding it
// Check Network tab → Request Headers → Authorization
```

### Issue 2: "403 Forbidden" when accessing resources

**Cause**: Resource belongs to different branch or user doesn't have permission
**Solution**:
```javascript
// Check branch_id matches
console.log('Current branch:', localStorage.getItem('branch_id'));
// Check user role
console.log('User role:', localStorage.getItem('role'));
// Verify resource ownership on backend
```

### Issue 3: CORS errors

**Cause**: Frontend and backend URLs don't match or CORS not configured
**Solution**:
```javascript
// Verify backend URL in api.js
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Check this matches your backend
});
// Backend must have CORS enabled for frontend origin
```

### Issue 4: Dashboard shows no data

**Cause**: Data exists but is filtered by branch_id
**Solution**:
```javascript
// Verify you're logged in to correct branch
console.log('Branch ID:', localStorage.getItem('branch_id'));
// Check backend database: products/orders have matching branch_id
// Verify GET /api/v1/dashboard/stats returns data
```

---

## Implementation Checklist

- [ ] Create `src/services/api.js` with axios interceptors
- [ ] Update Login component to store token, branch_id, user, role
- [ ] Update Dashboard to fetch and display stats
- [ ] Update Inventory to fetch/create/update products
- [ ] Update POS checkout to create orders
- [ ] Create ProtectedRoute component
- [ ] Update App.jsx routing with ProtectedRoute
- [ ] Implement logout functionality
- [ ] Create error handler utility
- [ ] Test token persistence across page refresh
- [ ] Test 401 error handling (redirect to login)
- [ ] Test 403 error handling (cross-branch access)
- [ ] Verify Authorization header in network requests
- [ ] Test logout clears localStorage
- [ ] Test login stores all required data
- [ ] Verify dashboard data filters by branch_id
- [ ] Verify checkout creates orders with correct branch_id
- [ ] Test with multiple users/branches

---

## API Endpoints Reference

### Authentication
- `POST /auth/login` → Returns: `{token, user: {id, username, role, branch_id}}`
- `POST /auth/logout` → No body needed

### Dashboard
- `GET /dashboard/stats` → Returns: `{total_orders, total_revenue, total_products_sold}`
- `GET /dashboard/revenue` → Returns: Daily revenue data
- `GET /dashboard/top-products` → Returns: Top selling products
- `GET /dashboard/recent-orders` → Returns: Recent order history

### Inventory
- `GET /inventory/products` → Returns: List of products for current branch
- `POST /inventory/products` → Create product (auto: branch_id)
- `GET /inventory/products/{id}` → Get product details
- `PUT /inventory/products/{id}` → Update product
- `GET /inventory/scan/{barcode}` → Scan product by barcode
- `POST /inventory/audit/{barcode}` → Update stock count

### POS
- `POST /pos/checkout` → Create order (auto: branch_id)

---

## Key Points to Remember

✅ **Authorization is automatic**: All requests include the `Authorization: Bearer {token}` header via interceptor

✅ **Branch filtering is automatic**: Backend filters all queries by the JWT's embedded branch_id

✅ **Data isolation enforced**: Users can only access data from their own branch (branch_id from JWT)

✅ **Token required**: All requests must include valid JWT token

✅ **Error handling**: 401 → redirect to login, 403 → show access denied message

✅ **Logout clears context**: localStorage must be cleared on logout

---

## Support

For issues or questions:
1. Check Network tab for Authorization header presence
2. Verify localStorage has: token, branch_id, user, role
3. Check browser console for error messages
4. Verify backend is running: `uvicorn app.main:app --reload`
5. Check database has branch_id values: `SELECT id, branch_id FROM products LIMIT 5;`
