import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiLoader, FiAlertCircle, FiInbox } from 'react-icons/fi';
import api from '../../utils/api';

const RecentOrdersTable = ({ ordersLimit = 10 }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default sample orders as fallback
  const sampleOrders = useMemo(() => [
    {
      id: '#EMZ-9042',
      service: 'Large Format Vinyl',
      client: 'Apex Tech',
      amount: 1240,
      status: 'Completed',
      statusColor: 'status-completed'
    },
    {
      id: '#EMZ-9041',
      service: 'Brand Kit Package',
      client: 'Lumina Studio',
      amount: 3500,
      status: 'In Production',
      statusColor: 'status-pending'
    },
    {
      id: '#EMZ-9040',
      service: 'Exhibition Banner',
      client: 'Global Events',
      amount: 2100,
      status: 'Pending',
      statusColor: 'status-info'
    }
  ], []);

  // Map status to CSS class
  const getStatusColor = (status) => {
    if (!status) return 'status-info';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('done')) {
      return 'status-completed';
    }
    if (statusLower.includes('production') || statusLower.includes('processing')) {
      return 'status-pending';
    }
    if (statusLower.includes('pending') || statusLower.includes('waiting')) {
      return 'status-info';
    }
    return 'status-info';
  };

  const fetchRecentOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📦 Fetching recent orders with limit:', ordersLimit);
      const response = await api.get(`/dashboard/recent-orders?limit=${ordersLimit}`);
      console.log(' Recent Orders API Response:', response.data);
      
      // Handle both response.data.orders and response.data.data structures
      const ordersData = response.data?.orders || response.data?.data || [];
      
      if (ordersData && Array.isArray(ordersData) && ordersData.length > 0) {
        console.log('Mapping', ordersData.length, 'orders to display format');
        
        // Map backend response to component format
        const mappedOrders = ordersData.map(order => ({
          id: order.order_id || order.id,
          service: order.service_name || order.service,
          client: order.client_name || order.customer || order.client,
          amount: parseFloat(order.amount || order.total_amount || 0),
          status: order.status,
          statusColor: getStatusColor(order.status)
        }));
        
        console.log(' Mapped orders:', mappedOrders);
        setOrders(mappedOrders);
      } else {
        console.warn('No orders data in response, using sample data');
        setOrders(sampleOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load recent orders');
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  }, [ordersLimit, sampleOrders]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  const displayData = orders?.length > 0 ? orders : sampleOrders;
  
  return (
    <div className="orders-table-card">
      <div className="orders-table-header">
        <h3>Recent Orders</h3>
        <a href="/orders" className="view-all-link">View All</a>
      </div>
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            <FiLoader size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px', display: 'block' }} />
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
            <FiAlertCircle size={32} style={{ marginBottom: '12px', display: 'block' }} />
            <p>{error}</p>
          </div>
        ) : displayData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            <FiInbox size={32} style={{ marginBottom: '12px', display: 'block' }} />
            <p>No orders found</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Service</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, index) => (
                <tr key={index}>
                  <td className="order-id">{item.id}</td>
                  <td className="order-service">{item.service}</td>
                  <td className="order-client">{item.client}</td>
                  <td className="order-amount">Tzs {item.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentOrdersTable;
