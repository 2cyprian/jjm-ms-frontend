import React from 'react';
import { formatCurrency } from '../../utils/adminHelpers';

const RecentOrdersTable = ({ recentOrders }) => {
  return (
    <div className="orders-card">
      <div className="orders-header">
        <h3>Recent Orders</h3>
        <a href="/orders" className="see-all-link">See All</a>
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
            {recentOrders.map((order, index) => (
              <tr key={index}>
                <td className="font-medium">{order.id}</td>
                <td>{order.customer}</td>
                <td>
                  <span className={`status-badge ${order.statusColor}`}>
                    {order.status}
                  </span>
                </td>
                <td className="font-medium">{formatCurrency(order.amount || 0, 'TZS')}</td>
                <td>
                  <button className="action-btn">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;
