import React from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../Button';
import { formatCurrency } from '../../utils/adminHelpers';

const SalesCart = ({ items, total, loading, onCheckout, onRemoveItem, onUpdateQuantity }) => {
  return (
    <div className="sales-cart">
      <div className="cart-header">
        <h3>CART</h3>
        <span className="order-number">{`#${Date.now().toString().slice(-3)}`}</span>
      </div>

      {/* Cart Items */}
      <div className="cart-items-list">
        {items.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', paddingTop: '2rem' }}>
            Cart is empty
          </p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="cart-item-row">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-qty">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.qty - 1)}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.qty + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item-price">
                {formatCurrency(item.price * item.qty, 'TZS')}
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="cart-remove-btn"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Total & Checkout */}
      <div className="cart-footer">
        <div className="cart-total">
          <span>Total:</span>
          <span className="total-amount">{formatCurrency(total, 'TZS')}</span>
        </div>
        <Button
          onClick={onCheckout}
          disabled={loading || items.length === 0}
          className="checkout-btn"
          style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '700' }}
        >
          {loading ? 'Processing...' : 'COMPLETE SALE'}
        </Button>
      </div>
    </div>
  );
};

export default SalesCart;
