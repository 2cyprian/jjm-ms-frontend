import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDashboardStats, getRevenueData, getTopSellingProducts, getRecentOrders, getProducts, updateProduct, checkout, fetchQueue } from '../utils/api';
import api from '../utils/api';
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
    totalOrders: 0,
    ordersChange: 0,
    lowStockItems: 0,
    dailyFootfall: 0,
    footfallChange: 0
  });
  
  // Print jobs are separate from orders
  const [activePrintJobs, setActivePrintJobs] = useState(0);

  const [revenueData, setRevenueData] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
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
  // Print jobs state
  const [printJobs, setPrintJobs] = useState([]);
  const [printJobsCount, setPrintJobsCount] = useState(0);
  const [totalPrintPages, setTotalPrintPages] = useState(0);
  const [completedPrintJobs, setCompletedPrintJobs] = useState(0);
  // Date filter state
  const [dateFilter, setDateFilter] = useState('7d'); // 1d, 7d, 30d, 90d
  const [ordersLimit, setOrdersLimit] = useState(10);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State Updated:', {
      stats,
      revenueDataCount: revenueData.length,
      topSellingCount: topSelling.length,
      recentOrdersCount: recentOrders.length,
      activePrintJobs,
      totalRevenueDisplay: stats.totalRevenue
    });
  }, [stats, revenueData, topSelling, recentOrders, activePrintJobs]);

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
    
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(loadDashboardData, 10000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dateFilter, ordersLimit]); // Reload when filters change

  const handleDateFilterChange = (newFilter) => {
    setDateFilter(newFilter);
    // Data will reload automatically via useEffect dependency
  };

  const loadDashboardData = async () => {
    console.log('🔄 Loading Dashboard Data...', { dateFilter, ordersLimit });
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
      const [statsData, revenueRes, topProductsRes, ordersRes, jobsRes] = await Promise.allSettled([
        getDashboardStats(dateFilter),
        getRevenueData(dateFilter),
        getTopSellingProducts(dateFilter),
        getRecentOrders(ordersLimit),
        // Fetch print jobs from queue - returns array directly
        fetchQueue()
      ]);

      console.log('📊 Dashboard Data Fetch Results:', {
        statsData: statsData.status === 'fulfilled' ? statsData.value : statsData.reason,
        revenueRes: revenueRes.status === 'fulfilled' ? revenueRes.value : revenueRes.reason,
        topProductsRes: topProductsRes.status === 'fulfilled' ? topProductsRes.value : topProductsRes.reason,
        ordersRes: ordersRes.status === 'fulfilled' ? ordersRes.value : ordersRes.reason,
        jobsRes: jobsRes.status === 'fulfilled' ? jobsRes.value : jobsRes.reason
      });

      // Set stats with fallback - orders and print jobs are separate
      if (statsData.status === 'fulfilled') {
          const data = statsData.value || {};
          console.log('📈 Stats Data:', data);
          const statsToSet = {
            totalRevenue: toNumber(data.total_revenue ?? data.total_sales),
            revenueChange: toNumber(data.revenue_change),
            totalOrders: toNumber(data.total_orders),
            ordersChange: toNumber(data.orders_change),
            lowStockItems: toNumber(data.low_stock_items),
            dailyFootfall: toNumber(data.daily_footfall),
            footfallChange: toNumber(data.footfall_change)
          };
          console.log('✅ Setting Stats State:', statsToSet);
          setStats(statsToSet);
      } else {
        console.warn('Stats endpoint failed:', statsData.reason);
      }

      // Set revenue data with fallback and array guard
      if (revenueRes.status === 'fulfilled') {
        console.log('💰 Revenue Data Raw:', revenueRes.value);
        const data = Array.isArray(revenueRes.value) ? revenueRes.value.map(d => ({
          day: d.day || d.date,
          value: toNumber(d.value ?? d.revenue)
        })) : [];
        console.log('💰 Revenue Data Processed:', data);
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
        console.log('🏆 Top Products Raw:', topProductsRes.value);
        const data = Array.isArray(topProductsRes.value)
          ? topProductsRes.value.map((p, idx) => ({
              name: p.name || p.product_name || p.title || `Product ${idx + 1}`,
              sold: p.sold ?? p.quantity_sold ?? p.units ?? p.count ?? 0,
              percentage: p.percentage ?? p.share ?? p.percent ?? 0,
            }))
          : [];
        console.log('🏆 Top Products Processed:', data);
        setTopSelling(data);
      } else {
        console.warn('Top products endpoint failed:', topProductsRes.reason);
        setTopSelling([]);
      }

      // Set recent orders with fallback and array guard
      if (ordersRes.status === 'fulfilled') {
        console.log('📦 Recent Orders Raw:', ordersRes.value);
        const data = Array.isArray(ordersRes.value)
          ? ordersRes.value.map((o, idx) => ({
              id: o.id ?? o.order_id ?? o.code ?? `#${idx + 1}`,
              customer: o.customer ?? o.customer_name ?? o.client ?? 'N/A',
              status: o.status ?? o.state ?? 'unknown',
              statusColor: o.statusColor ?? o.status_color ?? 'neutral',
              amount: toNumber(o.amount ?? o.total_amount ?? o.total),
            }))
          : [];
        console.log('📦 Recent Orders Processed:', data);
        setRecentOrders(data);
      } else {
        console.warn('Recent orders endpoint failed:', ordersRes.reason);
        setRecentOrders([]);
      }

      // Set print jobs with fallback and array guard
      if (jobsRes.status === 'fulfilled') {
        console.log('🖨️ Print Jobs Raw:', jobsRes.value);
        const allJobs = Array.isArray(jobsRes.value) ? jobsRes.value : [];
        // Filter for active jobs (pending/processing only)
        const activeJobs = allJobs.filter(job => 
          job.status === 'pending' || job.status === 'processing'
        );
        // Completed jobs
        const completedJobs = allJobs.filter(job => {
          const s = (job.status || '').toLowerCase();
          return s === 'completed' || s === 'done' || s === 'finished' || s === 'printed';
        });
        // Total pages across jobs (best-effort field detection)
        const totalPages = allJobs.reduce((sum, job) => {
          const pages = toNumber(job.pages ?? job.page_count ?? job.total_pages ?? 0);
          return sum + pages;
        }, 0);

        console.log('🖨️ Active Print Jobs:', activeJobs.length, 'out of', allJobs.length, 'pages:', totalPages, 'completed:', completedJobs.length);
        setPrintJobs(allJobs);
        setPrintJobsCount(allJobs.length);
        setActivePrintJobs(activeJobs.length);
        setTotalPrintPages(totalPages);
        setCompletedPrintJobs(completedJobs.length);
      } else {
        console.warn('Print jobs endpoint failed:', jobsRes.reason);
        setPrintJobs([]);
        setPrintJobsCount(0);
        setActivePrintJobs(0);
        setTotalPrintPages(0);
        setCompletedPrintJobs(0);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      console.log('✅ Dashboard Load Complete - Loading state set to false');
    }
  };

  // Backend provides total revenue - no frontend calculation needed
  const totalRevenueDisplay = Number(stats.totalRevenue) || 0;

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
        <DashboardHeader 
          dateFilter={dateFilter} 
          onDateFilterChange={handleDateFilterChange} 
        />

        {/* Scrollable Content */}
        <div className="dashboard-scroll-content">
          <KpiGrid 
            stats={stats} 
            totalRevenueDisplay={totalRevenueDisplay} 
            activePrintJobs={activePrintJobs}
            printJobsCount={printJobsCount}
            totalPrintPages={totalPrintPages}
            completedPrintJobs={completedPrintJobs}
          />

          {/* Charts Section */}
          <div className="charts-grid">
            <RevenueChart 
              revenueData={revenueData} 
              dateFilter={dateFilter}
            />

            <TopSellingList 
              topSelling={topSelling} 
              dateFilter={dateFilter}
            />
          </div>

          {/* Bottom Section */}
          <div className="bottom-grid">
            <RecentOrdersTable 
              recentOrders={recentOrders} 
              ordersLimit={ordersLimit}
              onLimitChange={setOrdersLimit}
            />

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
