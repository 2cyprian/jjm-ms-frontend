import React from 'react';
import { formatCurrency } from '../../utils/adminHelpers';

const RevenueChart = ({ revenueData, maxRevenue }) => {
  return (
    <div className="chart-card large">
      <div className="chart-header">
        <div>
          <h3>Revenue Trends</h3>
          <p>Sales performance over the last 7 days</p>
        </div>
        <select className="chart-filter">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>
      <div className="bar-chart">
        {revenueData.map((item, index) => (
          <div key={index} className="bar-item">
            <div
              className={`bar ${item.day === 'Thu' ? 'highlight' : ''}`}
              style={{ height: `${(item.value / maxRevenue) * 100}%` }}
            >
              <div className="bar-tooltip">{formatCurrency(item.value, 'TZS')}</div>
            </div>
            <span className="bar-label">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
