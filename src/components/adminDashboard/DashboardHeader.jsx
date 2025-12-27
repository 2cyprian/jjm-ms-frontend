import React from 'react';

const DashboardHeader = () => {
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
        <button className="filter-btn">
          📅 This Week
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
