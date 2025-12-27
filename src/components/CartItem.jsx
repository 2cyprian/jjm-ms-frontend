import React from 'react';
import { formatCurrency } from '../utils/adminHelpers';

const CartItem = ({ item }) => {
  return (
    <div className="cart-item">
      <span>{item.name} (x{item.qty})</span>
      <span>{formatCurrency(item.price * item.qty, 'TZS')}</span>
    </div>
  );
};

export default CartItem;
