import React from 'react';

const SystemStatusCard = () => {
  return (
    <div className="system-status-card">
      <div className="status-header">
        <h3>System Status</h3>
        <div className="status-indicator online"></div>
      </div>
      <div className="status-metrics">
        <div className="metric">
          <div className="metric-header">
            <span>Server Load</span>
            <span>24%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill green" style={{ width: '24%' }}></div>
          </div>
        </div>
        <div className="metric">
          <div className="metric-header">
            <span>Printer Queue</span>
            <span>8 Jobs</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill yellow" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusCard;
