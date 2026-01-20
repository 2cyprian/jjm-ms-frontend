import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaGauge, FaPrint, FaBoxesStacked, FaKey, FaMapLocationDot, FaUsersGear, FaGears, FaUserPlus, FaBars } from 'react-icons/fa6';

const Sidebar = () => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <FaGauge /> },
    { id: 'staff', label: 'Print Jobs', path: '/staff', icon: <FaPrint /> },
    { id: 'inventory', label: 'Inventory', path: '/inventory', icon: <FaBoxesStacked /> },
    { id: 'rentals', label: 'Rental System', path: '/rentals', icon: <FaKey /> },
    { id: 'branches', label: 'Branches & Staff', path: '/branches', icon: <FaUsersGear /> },
    { id: 'land', label: 'Land Management', path: '/land', icon: <FaMapLocationDot /> },
    { id: 'admin', label: 'Settings', path: '/admin', icon: <FaGears /> },
    { id: 'customer', label: 'Customer Upload', path: '/customer', icon: <FaUserPlus /> }
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

  // Mobile sidebar state
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1998,
            display: 'none',
          }}
        />
      )}

      {/* Mobile Hamburger */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 2000,
          background: '#232946',
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FaBars size={20} />
      </button>

      <div
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          height: '100vh',
          width: '240px',
          background: '#232946',
          color: 'white',
          zIndex: 1999,
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '24px 0 0 24px' }}>
          {showBrand && (
            <>
              <h2>PrintSync</h2>
              <p style={{ fontSize: '0.75rem', color: 'rgba(186, 175, 156, 0.7)', marginTop: '-8px', marginBottom: '24px' }}>Staff Workspace</p>
            </>
          )}
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '12px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 500,
                color: 'white',
                textDecoration: 'none',
                borderLeft: '4px solid transparent',
                background: 'none',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              <span style={{ fontSize: '1.2em', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        {/* User Profile Section at Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowUserMenu(!showUserMenu);
            }}
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
                <FaGears style={{ marginRight: 8 }} /> Account Settings
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
                <span style={{ marginRight: 8 }}>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Responsive styles */}
      <style>{`
        /* Desktop - sidebar always visible */
        @media (min-width: 901px) {
          .sidebar {
            left: 0 !important;
          }
          .sidebar-mobile-toggle {
            display: none !important;
          }
          .sidebar-overlay {
            display: none !important;
          }
        }

        /* Tablet & Mobile - sidebar hidden by default */
        @media (max-width: 900px) {
          .sidebar {
            left: -260px !important;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .sidebar.sidebar-open {
            left: 0 !important;
          }
          .sidebar-mobile-toggle {
            display: flex !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }

        /* Active nav item styling */
        .nav-item.active {
          background: rgba(255, 255, 255, 0.1) !important;
          border-left-color: #4ade80 !important;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
