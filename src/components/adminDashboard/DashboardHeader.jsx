import React from 'react';

const DashboardHeader = ({ dateFilter, onDateFilterChange }) => {
  const filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' }
  ];

  const currentFilterLabel = filterOptions.find(opt => opt.value === dateFilter)?.label || 'Last 7 Days';

  return (
    <div className="admin-dashboard-header">
      <div>
        <h2>Dashboard Overview</h2>
        <p className="subtitle">
          Manage operations and key metrics
          <span style={{
            marginLeft: '1rem',
            padding: '0.15rem 0.5rem',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            ⚡ Redis Cache Enabled
          </span>
        </p>
      </div>
      <div className="header-actions">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search orders, items..." />
        </div>
        <button className="icon-btn">
          <span className="notification-dot"></span>
          🔔
        </button>
        <select 
          className="filter-btn" 
          value={dateFilter} 
          onChange={(e) => onDateFilterChange(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>
              📅 {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DashboardHeader;
