import React, { useState } from 'react';
import Button from '../Button';
import { formatCurrency } from '../../utils/adminHelpers';

const NewOrderModal = ({
  show,
  onClose,
  products,
  productsLoading,
  actionBusy,
  orderProductId,
  setOrderProductId,
  orderQty,
  setOrderQty,
  orderPayment,
  setOrderPayment,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Create Order</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Product Selection */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              📦 Product
            </label>
            <select 
              value={orderProductId} 
              onChange={(e) => setOrderProductId(e.target.value)} 
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="">Select product</option>
              {productsLoading ? (
                <option disabled>Loading...</option>
              ) : (
                products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatCurrency(p.price || 0, 'TZS')}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              📊 Quantity
            </label>
            <input 
              type="number" 
              min="1" 
              value={orderQty || 1} 
              onChange={(e) => setOrderQty(Number(e.target.value) || 1)} 
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: '#374151' }}>
              💳 Payment Method
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.75rem'
            }}>
              {['CASH', 'CARD', 'MPESA'].map((method) => (
                <label key={method} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  border: `2px solid ${orderPayment === method ? '#4f46e5' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: orderPayment === method ? '#eef2ff' : 'white',
                  transition: 'all 0.2s',
                  gap: '0.5rem'
                }}>
                  <input 
                    type="radio" 
                    value={method} 
                    checked={orderPayment === method}
                    onChange={(e) => setOrderPayment(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500' }}>
                    {method === 'CASH' && '💵 Cash'}
                    {method === 'CARD' && '🏦 Card'}
                    {method === 'MPESA' && '📱 M-Pesa'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '1.5rem'
          }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={actionBusy}>
              {actionBusy ? '⏳ Creating...' : '✅ Create Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderModal;
