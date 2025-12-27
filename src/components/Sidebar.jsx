import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard', path: '/dashboard' },
    { id: 'staff', label: '🖨️ Print Jobs', path: '/staff' },
    { id: 'inventory', label: '📦 Inventory', path: '/inventory' },
    { id: 'branches', label: '🏢 Branches & Staff', path: '/branches' },
    { id: 'admin', label: '⚙️ Settings', path: '/admin' },
    { id: 'customer', label: '📤 Customer Upload', path: '/customer' }
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    setShowUserMenu(false);
    navigate('/login');
  };

  let showBrand = location.pathname.startsWith('/staff');
  try {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const role = (user.role || user.role_name || user.user_type || '').toString().toLowerCase();
    showBrand = showBrand || role === 'staff';
  } catch {}

  const userDisplayName = currentUser.name || currentUser.username || currentUser.email || 'User';
  const userRole = (currentUser.role || currentUser.role_name || currentUser.user_type || 'USER').toString().toUpperCase();

  return (
    <div className="sidebar">
      {showBrand && (
        <>
          <h2>PrintSync</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(186, 175, 156, 0.7)', marginTop: '-8px', marginBottom: '24px' }}>Staff Workspace</p>
        </>
      )}
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          {item.label}
        </NavLink>
      ))}

      {/* User Profile Section at Bottom */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!showUserMenu) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            if (!showUserMenu) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'white',
              flexShrink: 0
            }}
          >
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userDisplayName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              {userRole}
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
        </div>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div
            style={{
              marginTop: '8px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <button
              onClick={() => {
                navigate('/admin');
                setShowUserMenu(false);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'none',
                border: 'none',
                color: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              ⚙️ Account Settings
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ff6b6b',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,107,107,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
