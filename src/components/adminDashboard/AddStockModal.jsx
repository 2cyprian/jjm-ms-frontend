import React from 'react';
import Button from '../Button';

const AddStockModal = ({
  show,
  onClose,
  products,
  productsLoading,
  actionBusy,
  stockProductId,
  setStockProductId,
  stockAmount,
  setStockAmount,
  onSubmit,
}) => {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Stock</h3>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Product</label>
            <select value={stockProductId} onChange={(e)=>setStockProductId(e.target.value)} required>
              <option value="">Select product</option>
              {productsLoading ? (
                <option disabled>Loading...</option>
              ) : (
                products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - In stock: {p.stock_quantity}</option>
                ))
              )}
            </select>
          </div>
          <div className="form-group">
            <label>Amount to add</label>
            <input type="number" min="1" value={stockAmount || 1} onChange={(e)=>setStockAmount(Number(e.target.value) || 1)} required />
          </div>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={actionBusy}>
              {actionBusy?'Updating...':'Update Stock'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
