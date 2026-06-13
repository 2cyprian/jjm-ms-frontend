import React from 'react';

const QuickActions = ({ onNewOrder, onAddStock }) => {
  return (
    <div className="quick-actions-card">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        <button className="action-primary" onClick={onNewOrder}>
          <span className="action-icon">➕</span>
          New Order
        </button>
        <button className="action-secondary" onClick={onAddStock}>
          <span className="action-icon">📦</span>
          Add Stock
        </button>
      
        <button className="action-outline">
          <span className="action-icon">📥</span>
          Export Weekly Report
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
