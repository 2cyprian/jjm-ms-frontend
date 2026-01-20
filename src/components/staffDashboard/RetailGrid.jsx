import React from 'react';
import { formatCurrency } from '../../utils/adminHelpers';

const RetailGrid = ({ items, onSelectItem }) => {
  return (
    <div className="quick-section">
      <h3>Retail Items</h3>
      {items.length === 0 ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>
          No retail items available
        </p>
      ) : (
        <div className="quick-grid">
          {items.map(item => (
            <button
              key={item.id}
              className="quick-item"
              onClick={() => onSelectItem({ id: item.id, name: item.name, price: item.price })}
              type="button"
            >
              <div className="quick-item-name">{item.name}</div>
              <div className="quick-item-price">{formatCurrency(item.price, 'TZS')}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RetailGrid;
