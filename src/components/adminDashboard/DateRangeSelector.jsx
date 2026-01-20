import React, { useState } from 'react';

/**
 * DateRangeSelector Component
 * Single date filter that controls ALL dashboard data fetching
 * Supports both preset periods and custom date ranges
 */
const DateRangeSelector = ({ dateFilter, onDateFilterChange, startDate, endDate, onCustomRangeApply }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate || '');
  const [tempEndDate, setTempEndDate] = useState(endDate || '');
  const [error, setError] = useState('');

  const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleSelectChange = (value) => {
    if (value === 'custom') {
      setShowCustomPicker(true);
      setError('');
    } else {
      setShowCustomPicker(false);
      onDateFilterChange(value);
    }
  };

  const handleApplyCustomRange = () => {
    setError('');
    
    if (!tempStartDate || !tempEndDate) {
      setError('Both start and end dates are required');
      return;
    }

    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);

    if (start > end) {
      setError('Start date must be before or equal to end date');
      return;
    }

    // Enforce max 365-day span
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      setError('Date range cannot exceed 365 days');
      return;
    }

    setShowCustomPicker(false);
    onCustomRangeApply(tempStartDate, tempEndDate);
  };

  const handleCancel = () => {
    setShowCustomPicker(false);
    setError('');
    setTempStartDate(startDate || '');
    setTempEndDate(endDate || '');
  };

  return (
    <div className="date-range-selector">
      <select 
        value={showCustomPicker ? 'custom' : dateFilter} 
        onChange={(e) => handleSelectChange(e.target.value)}
        className="date-filter-select"
      >
        {dateOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {showCustomPicker && (
        <div className="custom-date-picker" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          padding: '1rem',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '280px'
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#555' }}>
              Start Date
            </label>
            <input
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#555' }}>
              End Date
            </label>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          {error && (
            <div style={{
              padding: '0.5rem',
              marginBottom: '0.75rem',
              background: '#fee',
              color: '#c33',
              fontSize: '0.85rem',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleApplyCustomRange}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              Apply
            </button>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: '#f3f4f6',
                color: '#555',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
