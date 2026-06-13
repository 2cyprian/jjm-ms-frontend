import React from 'react';
import DateRangeSelector from './DateRangeSelector';
import { FiRefreshCw } from 'react-icons/fi';

const DashboardHeader = ({ dateFilter, onDateFilterChange, startDate, endDate, onCustomRangeApply, onRefresh }) => {
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
      <div className="header-actions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <DateRangeSelector 
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          startDate={startDate}
          endDate={endDate}
          onCustomRangeApply={onCustomRangeApply}
        />
        <button
          onClick={onRefresh}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
          title='Fetch latest data for current date range'
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
