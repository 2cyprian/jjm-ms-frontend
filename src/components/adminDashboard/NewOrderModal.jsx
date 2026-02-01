import React from 'react';
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Order</h3>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Product</label>
            <select value={orderProductId} onChange={(e)=>setOrderProductId(e.target.value)} required>
              <option value="">Select product</option>
              {productsLoading ? (
                <option disabled>Loading...</option>
              ) : (
                products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price||0,'TZS')}</option>
                ))
              )}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" value={orderQty || 1} onChange={(e)=>setOrderQty(Number(e.target.value) || 1)} required />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={orderPayment} onChange={(e)=>setOrderPayment(e.target.value)}>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="MPESA">M-Pesa</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={actionBusy}>
              {actionBusy?'Creating...':'Create Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderModal;
