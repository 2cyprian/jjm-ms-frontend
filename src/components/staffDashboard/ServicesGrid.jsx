import React from 'react';
import { formatCurrency } from '../../utils/adminHelpers';

const ServicesGrid = ({ services, onAddService, onDeleteService, onSelectService }) => {
  return (
    <div className="quick-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Services</h3>
        <button
          onClick={onAddService}
          type="button"
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          + Add Service
        </button>
      </div>
      {services.length === 0 ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>
          No service configurations. Click "Add Service" to create one.
        </p>
      ) : (
        <div className="quick-grid">
          {services.map(service => (
            <div
              key={service.id}
              style={{
                position: 'relative',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.75rem',
                background: 'white'
              }}
            >
              <button
                onClick={() => onSelectService(service)}
                type="button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <div className="quick-item-name" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  {service.displayName}
                </div>
                <div className="quick-item-price">
                  {formatCurrency(service.price * service.pages, 'TZS')}
                </div>
              </button>
              <button
                onClick={() => onDeleteService(service.id)}
                type="button"
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}
                title="Delete configuration"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesGrid;
