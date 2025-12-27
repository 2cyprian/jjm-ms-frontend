import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDashboardStats, getRevenueData, getTopSellingProducts, getRecentOrders, getProducts, updateProduct, checkout } from '../utils/api';
import '../css/components/adminDashboard.css';
import { useToast } from '../utils/toast';
import DashboardHeader from '../components/adminDashboard/DashboardHeader';
import KpiGrid from '../components/adminDashboard/KpiGrid';
import RevenueChart from '../components/adminDashboard/RevenueChart';
import TopSellingList from '../components/adminDashboard/TopSellingList';
import RecentOrdersTable from '../components/adminDashboard/RecentOrdersTable';
import QuickActions from '../components/adminDashboard/QuickActions';
import SystemStatusCard from '../components/adminDashboard/SystemStatusCard';
import NewOrderModal from '../components/adminDashboard/NewOrderModal';
import AddStockModal from '../components/adminDashboard/AddStockModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    activeJobs: 0,
    jobsChange: 0,
    lowStockItems: 0,
    dailyFootfall: 0,
    footfallChange: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Quick Actions state
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [orderProductId, setOrderProductId] = useState('');
  const [orderQty, setOrderQty] = useState(1);
  const [orderPayment, setOrderPayment] = useState('CASH');
  const [stockProductId, setStockProductId] = useState('');
  const [stockAmount, setStockAmount] = useState(1);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    // Role guard: redirect staff to staff dashboard
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      const roleRaw = user?.role || user?.role_name || user?.user_type;
      const role = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : roleRaw;
      if (!role || (role !== 'admin' && role !== 'owner' && role !== 'manager')) {
        navigate('/staff');
        return;
      }
    } catch (_) {}
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const toNumber = (v) => {
        if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
        if (typeof v === 'string') {
          const num = parseFloat(v.replace(/[^0-9.-]/g, ''));
          return Number.isFinite(num) ? num : 0;
        }
        return 0;
      };
      
      // Load each endpoint independently with fallback data
      const [statsData, revenueRes, topProductsRes, ordersRes] = await Promise.allSettled([
        getDashboardStats(),
        getRevenueData('7d'),
        getTopSellingProducts(),
        getRecentOrders(3)
      ]);

      // Set stats with fallback
      if (statsData.status === 'fulfilled') {
          const data = statsData.value || {};
          setStats({
            totalRevenue: toNumber(data.total_sales),
            revenueChange: toNumber(data.revenue_change),
            activeJobs: toNumber(data.total_orders),
            jobsChange: toNumber(data.orders_change),
            lowStockItems: toNumber(data.low_stock_items),
            dailyFootfall: toNumber(data.daily_footfall),
            footfallChange: toNumber(data.footfall_change)
          });
      } else {
        console.warn('Stats endpoint failed:', statsData.reason);
      }

      // Set revenue data with fallback and array guard
      if (revenueRes.status === 'fulfilled') {
        const data = Array.isArray(revenueRes.value) ? revenueRes.value.map(d => ({
          day: d.day,
          value: toNumber(d.value)
        })) : [];
        setRevenueData(data);
      } else {
        console.warn('Revenue endpoint failed:', revenueRes.reason);
        setRevenueData([
          { day: 'Mon', value: 0 },
          { day: 'Tue', value: 0 },
          { day: 'Wed', value: 0 },
          { day: 'Thu', value: 0 },
          { day: 'Fri', value: 0 },
          { day: 'Sat', value: 0 },
          { day: 'Sun', value: 0 }
        ]);
      }

      // Set top products with fallback and array guard
      if (topProductsRes.status === 'fulfilled') {
        const data = Array.isArray(topProductsRes.value) ? topProductsRes.value : [];
        setTopSelling(data);
      } else {
        console.warn('Top products endpoint failed:', topProductsRes.reason);
        setTopSelling([]);
      }

      // Set recent orders with fallback and array guard
      if (ordersRes.status === 'fulfilled') {
        const data = Array.isArray(ordersRes.value) ? ordersRes.value.map(o => ({
          ...o,
          amount: toNumber(o.amount)
        })) : [];
        setRecentOrders(data);
      } else {
        console.warn('Recent orders endpoint failed:', ordersRes.reason);
        setRecentOrders([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.value)) : 1;
  const totalRevenueDisplay = (Number(stats.totalRevenue) > 0
    ? Number(stats.totalRevenue)
    : revenueData.reduce((acc, d) => acc + (Number(d.value) || 0), 0));

  // Helpers for quick actions
  const openNewOrderModal = async () => {
    setShowNewOrder(true);
    if (products.length === 0) {
      setProductsLoading(true);
      try {
        const list = await getProducts();
        setProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load products for order', e);
        toast.error('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    }
  };

  const submitNewOrder = async (e) => {
    e.preventDefault();
    if (!orderProductId || Number(orderQty) <= 0) {
      toast.error('Select a product and quantity');
      return;
    }
    const product = products.find(p => String(p.id) === String(orderProductId));
    if (!product) {
      toast.error('Invalid product');
      return;
    }
    setActionBusy(true);
    try {
      const itemId = product.barcode || product.id;
      const payload = {
        payment_method: orderPayment,
        items: [ { type: 'PRODUCT', id: itemId, quantity: Number(orderQty) } ],
      };
      await checkout(payload);
      toast.success('Order created');
      setShowNewOrder(false);
      setOrderProductId('');
      setOrderQty(1);
      await loadDashboardData();
    } catch (e) {
      console.error('Create order failed', e);
      toast.error('Failed to create order');
    } finally {
      setActionBusy(false);
    }
  };

  const openAddStockModal = async () => {
    setShowAddStock(true);
    if (products.length === 0) {
      setProductsLoading(true);
      try {
        const list = await getProducts();
        setProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load products for stock', e);
        toast.error('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    }
  };

  const submitAddStock = async (e) => {
    e.preventDefault();
    if (!stockProductId || Number(stockAmount) <= 0) {
      toast.error('Select a product and amount > 0');
      return;
    }
    const product = products.find(p => String(p.id) === String(stockProductId));
    if (!product) {
      toast.error('Invalid product');
      return;
    }
    const newQty = Number(product.stock_quantity || 0) + Number(stockAmount);
    setActionBusy(true);
    try {
      await updateProduct(product.id, { ...product, stock_quantity: newQty });
      toast.success('Stock updated');
      setShowAddStock(false);
      setStockProductId('');
      setStockAmount(1);
      await loadDashboardData();
    } catch (e) {
      console.error('Update stock failed', e);
      toast.error('Failed to update stock');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <DashboardHeader />

        {/* Scrollable Content */}
        <div className="dashboard-scroll-content">
          <KpiGrid stats={stats} totalRevenueDisplay={totalRevenueDisplay} />

          {/* Charts Section */}
          <div className="charts-grid">
            <RevenueChart revenueData={revenueData} maxRevenue={maxRevenue} />

            <TopSellingList topSelling={topSelling} />
          </div>

          {/* Bottom Section */}
          <div className="bottom-grid">
            <RecentOrdersTable recentOrders={recentOrders} />

            {/* Quick Actions & System Status */}
            <div className="side-panels">
              <QuickActions onNewOrder={openNewOrderModal} onAddStock={openAddStockModal} />

              <SystemStatusCard />
            </div>
          </div>
        </div>

        <NewOrderModal
          show={showNewOrder}
          onClose={() => setShowNewOrder(false)}
          products={products}
          productsLoading={productsLoading}
          actionBusy={actionBusy}
          orderProductId={orderProductId}
          setOrderProductId={setOrderProductId}
          orderQty={orderQty}
          setOrderQty={setOrderQty}
          orderPayment={orderPayment}
          setOrderPayment={setOrderPayment}
          onSubmit={submitNewOrder}
        />

        <AddStockModal
          show={showAddStock}
          onClose={() => setShowAddStock(false)}
          products={products}
          productsLoading={productsLoading}
          actionBusy={actionBusy}
          stockProductId={stockProductId}
          setStockProductId={setStockProductId}
          stockAmount={stockAmount}
          setStockAmount={setStockAmount}
          onSubmit={submitAddStock}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
