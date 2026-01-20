import React from 'react';
import DateRangeSelector from './DateRangeSelector';

const DashboardHeader = ({ dateFilter, onDateFilterChange, startDate, endDate, onCustomRangeApply }) => {
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
      <div className="header-actions" style={{ position: 'relative' }}>
        <DateRangeSelector 
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          startDate={startDate}
          endDate={endDate}
          onCustomRangeApply={onCustomRangeApply}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
