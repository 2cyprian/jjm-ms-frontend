import React from 'react';

const TopSellingList = ({ topSelling }) => {
  return (
    <div className="chart-card">
      <h3>Top Selling Items</h3>
      <p className="chart-subtitle">By unit volume</p>
      <div className="progress-list">
        {topSelling.map((item, index) => (
          <div key={index} className="progress-item">
            <div className="progress-header">
              <span>{item.name}</span>
              <span className="progress-count">{item.sold} sold</span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${index === 0 ? 'primary' : index === 1 ? 'dark' : 'gray'}`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <button className="view-all-btn">View All Inventory</button>
    </div>
  );
};

export default TopSellingList;
