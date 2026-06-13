import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { formatDayLabel } from '../../utils/adminHelpers';

const TopSellingList = ({ topSelling, dateFilter, startDate, endDate }) => {
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

  return (
    <div className="chart-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <FiTrendingUp size={20} style={{ color: 'var(--primary)' }} />
        <h3 style={{ margin: 0 }}>Top Selling Items</h3>
      </div>
      <p className="chart-subtitle">By unit volume - {getPeriodLabel(dateFilter)}</p>
      <div className="progress-list">
        {!topSelling || topSelling.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            No top selling products for this period
          </div>
        ) : (
          topSelling.map((item, index) => {
            console.log(`🏆 Rendering product ${index}:`, item);
            return (
              <div key={index} className="progress-item">
                <div className="progress-header">
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    {item.revenue && (
                      <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                         Tzs {(item.revenue || 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="progress-count">{item.sold} sold</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${index === 0 ? 'primary' : index === 1 ? 'dark' : 'gray'}`}
                    style={{ width: `${Math.min(100, item.percentage ?? 0)}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <button className="view-all-btn">View All Inventory</button>
    </div>
  );
};

export default TopSellingList;
