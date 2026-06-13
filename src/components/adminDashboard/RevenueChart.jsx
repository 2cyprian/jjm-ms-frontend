import React from 'react';
import { formatCurrency, formatDayLabel } from '../../utils/adminHelpers';

const RevenueChart = ({ revenueData, dateFilter, startDate, endDate }) => {
  // Calculate max for visual scaling only - not data transformation
  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.value)) : 1;

  const getPeriodLabel = (filter) => {
    if (filter === 'custom' && startDate && endDate) {
      const start = formatDayLabel(startDate);
      const end = formatDayLabel(endDate);
      return `${start} - ${end}`;
    }
    
    const labels = {
      today: 'Today',
      last_7_days: 'Last 7 Days'
    };
    return labels[filter] || 'Last 7 Days';
  };

  const hasData = revenueData.length > 0;
  const width = 100;
  const height = 200;
  const pointRadius = 1.5;
  const safeMax = Math.max(maxRevenue, 1);
  const step = hasData && revenueData.length > 1 ? width / (revenueData.length - 1) : 0;
  
  // Generate path for simple line graph
  const linePath = hasData
    ? revenueData.map((item, idx) => {
        const x = step * idx;
        const y = height - (item.value / safeMax) * height;
        return idx === 0 ? `M ${x},${y}` : `L ${x},${y}`;
      }).join(' ')
    : '';

  return (
    <div className="chart-card large">
      <div className="chart-header">
        <div>
          <h3>Revenue Trends</h3>
          <p>Sales performance - {getPeriodLabel(dateFilter)}</p>
        </div>
      </div>

      {hasData ? (
        <div style={{ padding: '1rem 1rem 0 1rem' }}>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '220px' }}>
            <path
              fill="none"
              stroke="#4f46e5"
              strokeWidth="0.5"
              d={linePath}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {revenueData.map((item, idx) => {
              const x = step * idx;
              const y = height - (item.value / safeMax) * height;
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r={pointRadius} fill="#4f46e5" />
                  <title>{`${item.day}: ${formatCurrency(item.value, 'TZS')}`}</title>
                </g>
              );
            })}
          </svg>
          <div className="bar-chart" style={{ marginTop: '0.5rem' }}>
            {revenueData.map((item, index) => (
              <div key={index} className="bar-item" style={{ flex: 1 }}>
                <span className="bar-label">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          No revenue data available for this period
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
