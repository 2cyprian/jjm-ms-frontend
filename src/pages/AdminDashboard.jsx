import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDashboardStats, getRevenueData, getTopSellingProducts, getRecentOrders, getProducts, updateProduct, checkout, fetchQueue, getActiveRentals, getEquipmentDetail, getRentalIncome } from '../utils/api';
import { formatDayLabel } from '../utils/adminHelpers';
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
  // Rental Revenue
  const [rentalIncome, setRentalIncome] = useState(0);
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
  const [loading, setLoading] = useState(true); // first-load spinner only
  const [refreshing, setRefreshing] = useState(false); // background refresh indicator
  const [hasLoaded, setHasLoaded] = useState(false);
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
  const [dateFilter, setDateFilter] = useState('today'); // today, last_7_days, last_30_days, last_90_days
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ordersLimit, setOrdersLimit] = useState(10);
  
  // Rentals state
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);



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
  }, []); // Load only on mount
  
  // Reload data INSTANTLY when date filter changes
  useEffect(() => {
    if (hasLoaded) {
      console.log(' Date filter changed - loading data instantly...');
      loadDashboardData();
    }
  }, [dateFilter, startDate, endDate]);

  const handleDateFilterChange = (newFilter) => {
    console.log('📅 Date filter changed to:', newFilter);
    setDateFilter(newFilter);
    // Clear custom dates when switching to preset
    setStartDate('');
    setEndDate('');
    // Data will reload when user clicks refresh button
  };

  const handleCustomRangeApply = (customStartDate, customEndDate) => {
    console.log('📅 Custom date range applied:', { customStartDate, customEndDate });
    setStartDate(customStartDate);
    setEndDate(customEndDate);
    // Data will reload when user clicks refresh button
  };

  const handleManualRefresh = async () => {
    console.log(' Manual refresh triggered for current date range:', { dateFilter, startDate, endDate });
    await loadDashboardData();
  };

  const loadDashboardData = async () => {
    const isFirstLoad = !hasLoaded;
    try {
      if (isFirstLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const toNumber = (v) => {
        if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
        if (typeof v === 'string') {
          const num = parseFloat(v.replace(/[^0-9.-]/g, ''));
          return Number.isFinite(num) ? num : 0;
        }
        return 0;
      };
      
      // Build date params for API calls
      const dateParams = dateFilter === 'custom' && startDate && endDate
        ? { start_date: startDate, end_date: endDate }
        : { date_range: dateFilter };
      
      console.log(' Date params for API:', dateParams);
      
      // Load each endpoint independently with fallback data
      const [statsData, revenueRes, topProductsRes, ordersRes, jobsRes, rentalsRes, rentalIncomeRes] = await Promise.allSettled([
        getDashboardStats(dateParams),
        getRevenueData(dateParams),
        getTopSellingProducts(dateParams),
        getRecentOrders(ordersLimit),
        // Fetch print jobs from queue - returns array directly
        fetchQueue(),
        // Fetch active rentals
        getActiveRentals(),
        // Fetch rental income
        getRentalIncome()
      ]);
      
      // Set rental income robustly
      let income = 0;
      if (rentalIncomeRes && rentalIncomeRes.status === 'fulfilled') {
        const rawIncome = rentalIncomeRes.value;
        income = rawIncome?.rental_income ?? rawIncome?.total ?? rawIncome?.amount ?? rawIncome ?? 0;
        if (typeof income !== 'number' || !isFinite(income)) {
          income = Number(income);
        }
        if (!isFinite(income) || isNaN(income)) {
          income = 0;
        }
      } else {
        console.warn('[DASHBOARD] Rental income request failed:', rentalIncomeRes?.reason);
      }
      setRentalIncome(income);



      // Set stats with fallback - orders and print jobs are separate
      if (statsData.status === 'fulfilled') {
          const data = statsData.value || {};
          const statsToSet = {
            totalRevenue: toNumber(data.totalRevenue ?? data.total_revenue ?? data.total_sales ?? data.revenue),
            revenueChange: toNumber(data.revenueChange ?? data.revenue_change ?? data.change),
            totalOrders: toNumber(data.totalOrders ?? data.total_orders ?? data.orders),
            ordersChange: toNumber(data.ordersChange ?? data.orders_change),
            totalExpenses: toNumber(data.totalExpenses ?? data.total_expenses),
            expensesChange: toNumber(data.expensesChange ?? data.expenses_change),
            lowStockItems: toNumber(data.lowStockItems ?? data.low_stock_items ?? data.low_stock),
            dailyFootfall: toNumber(data.dailyFootfall ?? data.daily_footfall ?? data.footfall),
            footfallChange: toNumber(data.footfallChange ?? data.footfall_change)
          };
          console.log(' Stats set from API:', statsToSet);
          setStats(statsToSet);
      } else {
        console.warn('[DASHBOARD] Stats endpoint failed:', statsData.reason);
      }

      // Set revenue data with fallback and array guard
      if (revenueRes.status === 'fulfilled') {
        const revenuePayload = revenueRes.value;
        // Support multiple backend shapes: plain array or wrapped under data/results/chart/points
        const revenueArray = Array.isArray(revenuePayload)
          ? revenuePayload
          : Array.isArray(revenuePayload?.data)
            ? revenuePayload.data
            : Array.isArray(revenuePayload?.results)
              ? revenuePayload.results
              : Array.isArray(revenuePayload?.chart)
                ? revenuePayload.chart
                : Array.isArray(revenuePayload?.points)
                  ? revenuePayload.points
                  : [];

        const data = revenueArray.map(d => {
          const dayKey = d.date || d.day || d.label || d.period || null;
          return {
            day: formatDayLabel(dayKey),
            value: toNumber(d.value ?? d.revenue ?? d.amount ?? d.total)
          };
        });
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
        console.log(' Top Products Response:', topProductsRes.value);
        
        // Handle both direct array and products property structure
        const productsArray = topProductsRes.value?.products || (Array.isArray(topProductsRes.value) ? topProductsRes.value : []);
        console.log(' Products Array:', productsArray);
        
        const data = Array.isArray(productsArray)
          ? productsArray.map((p, idx) => {
              const mapped = {
                name: p.productName || p.name || p.product_name || p.title || `Product ${idx + 1}`,
                sold: p.quantitySold ?? p.sold ?? p.quantity_sold ?? p.units ?? p.count ?? 0,
                revenue: p.revenue ?? p.total_revenue ?? 0,
                percentage: p.percentage ?? p.share ?? p.percent ?? 0,
              };
              console.log(`🏆 Mapped product ${idx}:`, mapped);
              return mapped;
            })
          : [];
        setTopSelling(data);
        console.log('Top Selling set with', data.length, 'products');
      } else {
        console.warn('Top products endpoint failed:', topProductsRes.reason);
        setTopSelling([]);
      }

      // Set recent orders with fallback and array guard
      if (ordersRes.status === 'fulfilled') {
        const data = Array.isArray(ordersRes.value)
          ? ordersRes.value.map((o, idx) => ({
              id: o.id ?? o.order_id ?? o.code ?? `#${idx + 1}`,
              customer: o.customer ?? o.customer_name ?? o.client ?? 'N/A',
              status: o.status ?? o.state ?? 'unknown',
              statusColor: o.statusColor ?? o.status_color ?? 'neutral',
              amount: toNumber(o.amount ?? o.total_amount ?? o.total),
            }))
          : [];
        setRecentOrders(data);
      } else {
        console.warn('Recent orders endpoint failed:', ordersRes.reason);
        setRecentOrders([]);
      }

      // Set print jobs with fallback and array guard
      if (jobsRes.status === 'fulfilled') {
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

      // Set active rentals with fallback - fetch only first 5
      if (rentalsRes.status === 'fulfilled') {
        let rentalsList = Array.isArray(rentalsRes.value) ? rentalsRes.value : [];
        
        // Fetch equipment details for each rental
        rentalsList = await Promise.all(
          rentalsList.slice(0, 5).map(async (rental) => {
            if (rental.equipment_id && !rental.equipment) {
              try {
                const equipmentData = await getEquipmentDetail(rental.equipment_id);
                return { ...rental, equipment: equipmentData };
              } catch (err) {
                return rental;
              }
            }
            return rental;
          })
        );
        
        setActiveRentals(rentalsList);
      } else {
        console.warn('Active rentals endpoint failed:', rentalsRes.reason);
        setActiveRentals([]);
      }
    } catch (error) {
      console.error(' Error loading dashboard data:', error);
    } finally {
      setHasLoaded(true);
      setLoading(false);
      setRefreshing(false);
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
      const orderResult = await checkout(payload);
      
      // Extract order details from actual response structure
      let orderNumber = null;
      let totalPrice = orderResult.totalAmount || 0;
      let itemsList = [];
      
      // Check products array first
      if (orderResult.products && orderResult.products.length > 0) {
        const firstProduct = orderResult.products[0];
        orderNumber = firstProduct.order_number;
        totalPrice = firstProduct.total_price || firstProduct.total || orderResult.totalAmount || 0;
        itemsList = orderResult.products.map(p => `${p.name || p.service_name} (x${p.quantity})`);
      }
      
      // Check services array if not found in products
      if (!orderNumber && orderResult.services && orderResult.services.length > 0) {
        const firstService = orderResult.services[0];
        orderNumber = firstService.order_number;
        totalPrice = firstService.total_price || orderResult.totalAmount || 0;
        itemsList = orderResult.services.map(s => {
          const items = s.items_json || {};
          return `${items.service_name || s.service_name || 'Service'} (x${items.quantity || 1})`;
        });
      }
      
      const itemsDisplay = itemsList.join(' + ') || 'Order';
      console.log('✅ Order Created:', {
        order_number: orderNumber,
        totalAmount: totalPrice,
        itemsCount: itemsList.length,
        items: itemsDisplay,
        payment_method: orderPayment
      });
      
      toast.success(`Order #${orderNumber} - ${itemsDisplay} - Tzs ${totalPrice.toLocaleString()}`);
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

  if (loading && !hasLoaded) {
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
          startDate={startDate}
          endDate={endDate}
          onCustomRangeApply={handleCustomRangeApply}
          onRefresh={handleManualRefresh}
        />

        {refreshing && (
          <div style={{ padding: '0.5rem 1.5rem', color: '#666', fontSize: '0.9rem' }}>
            Refreshing data...
          </div>
        )}

        {/* Scrollable Content */}
        <div className="dashboard-scroll-content">
          <KpiGrid 
            stats={stats} 
            totalRevenueDisplay={totalRevenueDisplay} 
            rentalIncome={rentalIncome}
            dateRange={dateFilter}
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
              activeRentals={activeRentals}
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
