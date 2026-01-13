import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../utils/toast';
import { login } from '../utils/api';
import '../css/components/login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const raw = await login(credentials);
      const payload = raw?.data || raw;

      // Check if response has nested user object or if the payload itself is the user
      let user =
        payload?.user ||
        payload?.data?.user ||
        payload?.profile ||
        payload?.user_data ||
        payload?.data?.user_data;

      // If no nested user object, check if payload itself has user fields
      if (!user && (payload?.user_id || payload?.username || payload?.email)) {
        user = payload;
      }

      if (!user) {
        toast.error('Login failed. Invalid response from server.');
        return;
      }

      // Store user data and tenant context
      localStorage.setItem('user', JSON.stringify(user));
      if (user?.branch_id) localStorage.setItem('branch_id', user.branch_id);
      const roleRaw = user.role || user.role_name || user.user_type;
      if (roleRaw) localStorage.setItem('role', String(roleRaw).toLowerCase());

      // Store token and refresh token if present
      const token =
        payload?.token ||
        payload?.access ||
        payload?.access_token ||
        payload?.data?.token ||
        payload?.data?.access ||
        payload?.data?.access_token;

      const refresh = payload?.refresh || payload?.refresh_token || payload?.data?.refresh || payload?.data?.refresh_token;

      if (token) localStorage.setItem('token', token);
      if (refresh) localStorage.setItem('refreshToken', refresh);

      const displayName = user.name || user.username || user.email || 'User';
      toast.success(`Welcome back, ${displayName}!`);

      const role = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : roleRaw;
      if (role === 'admin' || role === 'owner') {
        navigate('/dashboard');
      } else if (role === 'manager') {
        navigate('/branches');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err?.response?.data?.detail || err?.message || 'Invalid credentials. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-icon">🖨️</div>
          <h1>PrintSync</h1>
          <p>Admin Portal</p>
        </div>
        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Manage Print Jobs</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Track Inventory</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Staff Management</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Real-time Analytics</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                required
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="quick-access">
            <p>Quick Access for Demo:</p>
            <div className="demo-buttons">
              <button
                type="button"
                onClick={() => {
                  setCredentials({ username: 'admin', password: 'admin123' });
                  toast.info('Admin credentials loaded');
                }}
                className="demo-btn"
              >
                👨‍💼 Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setCredentials({ username: 'staff', password: 'staff123' });
                  toast.info('Staff credentials loaded');
                }}
                className="demo-btn"
              >
                👤 Staff
              </button>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2025 PrintSync. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
