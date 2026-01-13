import React from 'react';

const TopSellingList = ({ topSelling, dateFilter }) => {
  const getPeriodLabel = (filter) => {
    const labels = {
      '1d': 'Today',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days'
    };
    return labels[filter] || 'Last 7 Days';
  };

  return (
    <div className="chart-card">
      <h3>Top Selling Items</h3>
      <p className="chart-subtitle">By unit volume - {getPeriodLabel(dateFilter)}</p>
      <div className="progress-list">
        {topSelling.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            No top selling products for this period
          </div>
        ) : (
          topSelling.map((item, index) => (
            <div key={index} className="progress-item">
              <div className="progress-header">
                <span>{item.name}</span>
                <span className="progress-count">{item.sold} sold</span>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${index === 0 ? 'primary' : index === 1 ? 'dark' : 'gray'}`}
                  style={{ width: `${Math.min(100, item.percentage ?? 0)}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
      <button className="view-all-btn">View All Inventory</button>
    </div>
  );
};

export default TopSellingList;
