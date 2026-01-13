import React from 'react';

/**
 * DateRangeSelector Component
 * Single date filter that controls ALL dashboard data fetching
 * No calculations - just triggers backend API calls with selected period
 */
const DateRangeSelector = ({ dateFilter, onDateFilterChange }) => {
  const dateOptions = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="date-range-selector">
      <select 
        value={dateFilter} 
        onChange={(e) => onDateFilterChange(e.target.value)}
        className="date-filter-select"
      >
        {dateOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateRangeSelector;
