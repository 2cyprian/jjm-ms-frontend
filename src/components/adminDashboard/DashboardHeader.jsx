import React from 'react';

const DashboardHeader = ({ dateFilter, onDateFilterChange }) => {
  const filterOptions = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const currentFilterLabel = filterOptions.find(opt => opt.value === dateFilter)?.label || 'Last 7 Days';

  return (
    <div className="admin-dashboard-header">
      <div>
        <h2>Dashboard Overview</h2>
        <p className="subtitle">Manage operations and key metrics</p>
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
