import React from 'react';
import { formatCurrency } from '../../utils/adminHelpers';

const RecentOrdersTable = ({ recentOrders, ordersLimit, onLimitChange, activeRentals }) => {
  // Combine and show rentals if available
  const showRentals = activeRentals && activeRentals.length > 0;
  const displayData = showRentals ? activeRentals : recentOrders;
  
  return (
    <div className="orders-card">
      <div className="orders-header">
        <h3>{showRentals ? 'Active Rentals' : 'Recent Orders'}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!showRentals && (
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
          )}
          <a href={showRentals ? "/rentals" : "/orders"} className="see-all-link">
            See All
          </a>
        </div>
      </div>
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              {showRentals ? (
                <>
                  <th>Person</th>
                  <th>Equipment</th>
                  <th>Start Date</th>
                  <th>Due Date</th>
                  <th>Deposit</th>
                </>
              ) : (
                <>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th></th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  {showRentals ? 'No active rentals' : 'No recent orders available'}
                </td>
              </tr>
            ) : (
              displayData.map((item, index) => (
                <tr key={index}>
                  {showRentals ? (
                    <>
                      <td className="font-medium">{item.customer_name || 'N/A'}</td>
                      <td>
                        <div>{item.equipment?.name || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                          {item.equipment?.category || ''}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>
                        {new Date(item.start_date).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>
                        {new Date(item.expected_return_date).toLocaleDateString()}
                      </td>
                      <td className="font-medium">
                        {formatCurrency(item.deposit_paid || 0, 'TZS')}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="font-medium">{item.id}</td>
                      <td>{item.customer}</td>
                      <td>
                        <span className={`status-badge ${item.statusColor || 'neutral'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="font-medium">{formatCurrency(item.amount || 0, 'TZS')}</td>
                      <td>
                        <button className="action-btn">⋮</button>
                      </td>
                    </>
                  )}
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
