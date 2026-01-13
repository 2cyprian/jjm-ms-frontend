import React from 'react';
import { formatCurrency } from '../../utils/adminHelpers';

const RecentOrdersTable = ({ recentOrders, ordersLimit, onLimitChange }) => {
  return (
    <div className="orders-card">
      <div className="orders-header">
        <h3>Recent Orders</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            value={ordersLimit} 
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{
              padding: '0.4rem 0.6rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.85rem'
            }}
          >
            <option value={3}>Last 3</option>
            <option value={5}>Last 5</option>
            <option value={10}>Last 10</option>
            <option value={20}>Last 20</option>
          </select>
          <a href="/orders" className="see-all-link">See All</a>
        </div>
      </div>
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No recent orders available
                </td>
              </tr>
            ) : (
              recentOrders.map((order, index) => (
                <tr key={index}>
                  <td className="font-medium">{order.id}</td>
                  <td>{order.customer}</td>
                  <td>
                    <span className={`status-badge ${order.statusColor || 'neutral'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="font-medium">{formatCurrency(order.amount || 0, 'TZS')}</td>
                  <td>
                    <button className="action-btn">⋮</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
