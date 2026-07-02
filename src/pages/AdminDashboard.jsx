import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDashboardStats, getRevenueData, getTopSellingProducts, getRecentOrders, getProducts, updateProduct, checkout, getActiveRentals, getEquipmentDetail, getRentalIncome } from '../utils/api';
// Removed: fetchQueue
import { formatDayLabel } from '../utils/adminHelpers';
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
  const [rentalIncome, setRentalIncome] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();
  
  // KPI Data - Separate state for KPIs
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    lowStockItems: 0,
    dailyFootfall: 0,
    footfallChange: 0
  });
  
  // Chart/Graph Data - Separate state for charts
  const [revenueData, setRevenueData] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  // Loading states - Separate for KPIs and charts
  const [kpiLoading, setKpiLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ordersLimit, setOrdersLimit] = useState(10);
  
  // Rentals state
  const [activeRentals, setActiveRentals] = useState([]);

  // Helper function to convert values to numbers
  const toNumber = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') {
      const num = parseFloat(v.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(num) ? num : 0;
    }
    return 0;
  };

  // Build date params for API calls
  const getDateParams = useCallback(() => {
    return dateFilter === 'custom' && startDate && endDate
      ? { start_date: startDate, end_date: endDate }
      : { date_range: dateFilter };
  }, [dateFilter, startDate, endDate]);

  // 1. LOAD KPI DATA ONLY
  const loadKpiData = useCallback(async () => {
    try {
      setKpiLoading(true);
      const dateParams = getDateParams();
      
      console.log('📊 Loading KPI data with params:', dateParams);
      
      // Load only KPI-related data
      const [statsData, rentalIncomeRes] = await Promise.allSettled([
        getDashboardStats(dateParams),
        getRentalIncome()
      ]);
      
      // Set stats with fallback
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
        console.log('📊 KPI Data loaded:', statsToSet);
        setStats(statsToSet);
      } else {
        console.warn('[DASHBOARD] Stats endpoint failed:', statsData.reason);
      }
      
      // Set rental income
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
      }
      setRentalIncome(income);
      
    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setKpiLoading(false);
    }
  }, [getDateParams]);

  // 2. LOAD CHART DATA ONLY
  const loadChartData = useCallback(async () => {
    try {
      setChartLoading(true);
      const dateParams = getDateParams();
      
      console.log('📈 Loading Chart data with params:', dateParams);
      
      // Load only chart-related data (removed fetchQueue for print jobs)
      const [revenueRes, topProductsRes, ordersRes, rentalsRes] = await Promise.allSettled([
        getRevenueData(dateParams),
        getTopSellingProducts(dateParams),
        getRecentOrders(ordersLimit),
        getActiveRentals()
      ]);
      
      // Set revenue data
      if (revenueRes.status === 'fulfilled') {
        const revenuePayload = revenueRes.value;
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

        const data = revenueArray.map(d => ({
          day: formatDayLabel(d.date || d.day || d.label || d.period || null),
          value: toNumber(d.value ?? d.revenue ?? d.amount ?? d.total)
        }));
        setRevenueData(data);
      } else {
        console.warn('Revenue endpoint failed:', revenueRes.reason);
        setRevenueData([]);
      }

      // Set top products
      if (topProductsRes.status === 'fulfilled') {
        const productsArray = topProductsRes.value?.products || (Array.isArray(topProductsRes.value) ? topProductsRes.value : []);
        const data = Array.isArray(productsArray)
          ? productsArray.map((p, idx) => ({
              name: p.productName || p.name || p.product_name || p.title || `Product ${idx + 1}`,
              sold: p.quantitySold ?? p.sold ?? p.quantity_sold ?? p.units ?? p.count ?? 0,
              revenue: p.revenue ?? p.total_revenue ?? 0,
              percentage: p.percentage ?? p.share ?? p.percent ?? 0,
            }))
          : [];
        setTopSelling(data);
      } else {
        console.warn('Top products endpoint failed:', topProductsRes.reason);
        setTopSelling([]);
      }

      // Set recent orders
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

      // Set active rentals
      if (rentalsRes.status === 'fulfilled') {
        let rentalsList = Array.isArray(rentalsRes.value) ? rentalsRes.value : [];
        rentalsList = await Promise.all(
          rentalsList.slice(0, 5).map(async (rental) => {
            if (rental.equipment_id && !rental.equipment) {
              try {
                const equipmentData = await getEquipmentDetail(rental.equipment_id);
                return { ...rental, equipment: equipmentData };
              } catch (error) {
                // Use error variable or ignore with _
                console.warn('Failed to load equipment detail:', error);
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
      console.error('Error loading chart data:', error);
    } finally {
      setChartLoading(false);
    }
  }, [getDateParams, ordersLimit]);

  // 3. LOAD ALL DATA (Both KPIs and Charts)
  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Load both KPI and chart data in parallel
      await Promise.all([
        loadKpiData(),
        loadChartData()
      ]);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadKpiData, loadChartData]);

  // Initial load - separate KPI and chart loading
  useEffect(() => {
    // Role guard: redirect staff to staff dashboard
    const checkRole = () => {
      try {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        const roleRaw = user?.role || user?.role_name || user?.user_type;
        const role = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : roleRaw;
        if (!role || (role !== 'admin' && role !== 'owner' && role !== 'manager')) {
          navigate('/staff');
          return false;
        }
        return true;
      } catch {
        // Ignore error and proceed
        return true;
      }
    };
    
    const initialLoad = async () => {
      if (checkRole()) {
        await Promise.all([
          loadKpiData(),
          loadChartData()
        ]);
        setHasLoaded(true);
      }
    };
    
    initialLoad();
  }, [loadKpiData, loadChartData, navigate]);

  // Reload when date filter changes - use separate effect with cleanup
  useEffect(() => {
    if (hasLoaded) {
      console.log('📅 Date filter changed - loading data...');
      // Use a flag to prevent double loading
      let isMounted = true;
      
      const reloadData = async () => {
        if (isMounted) {
          await loadDashboardData();
        }
      };
      
      reloadData();
      
      return () => {
        isMounted = false;
      };
    }
  }, [dateFilter, startDate, endDate, hasLoaded, loadDashboardData]);

  const handleDateFilterChange = (newFilter) => {
    console.log('📅 Date filter changed to:', newFilter);
    setDateFilter(newFilter);
    setStartDate('');
    setEndDate('');
  };

  const handleCustomRangeApply = (customStartDate, customEndDate) => {
    console.log('📅 Custom date range applied:', { customStartDate, customEndDate });
    setStartDate(customStartDate);
    setEndDate(customEndDate);
  };

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadDashboardData();
  };

  // Calculate display value
  const totalRevenueDisplay = Number(stats.totalRevenue) || 0;

  // Quick actions handlers
  const openNewOrderModal = async () => {
    setShowNewOrder(true);
    if (products.length === 0) {
      setProductsLoading(true);
      try {
        const list = await getProducts();
        setProducts(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Failed to load products for order', error);
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
      
      let orderNumber = null;
      let totalPrice = orderResult.totalAmount || 0;
      let itemsList = [];
      
      if (orderResult.products && orderResult.products.length > 0) {
        const firstProduct = orderResult.products[0];
        orderNumber = firstProduct.order_number;
        totalPrice = firstProduct.total_price || firstProduct.total || orderResult.totalAmount || 0;
        itemsList = orderResult.products.map(p => `${p.name || p.service_name} (x${p.quantity})`);
      }
      
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
      toast.success(`Order #${orderNumber} - ${itemsDisplay} - Tzs ${totalPrice.toLocaleString()}`);
      setShowNewOrder(false);
      setOrderProductId('');
      setOrderQty(1);
      await loadDashboardData();
    } catch (error) {
      console.error('Create order failed', error);
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
      } catch (error) {
        console.error('Failed to load products for stock', error);
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
    } catch (error) {
      console.error('Update stock failed', error);
      toast.error('Failed to update stock');
    } finally {
      setActionBusy(false);
    }
  };

  // Loading state - only show if both are loading
  if ((kpiLoading && !hasLoaded) || (chartLoading && !hasLoaded)) {
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

        <div className="dashboard-scroll-content">
          {/* KPI Grid - Now uses kpiLoading state */}
         <KpiGrid 
            stats={stats} 
            totalRevenueDisplay={totalRevenueDisplay} 
            rentalIncome={rentalIncome}
            dateRange={dateFilter}
            onDateFilterChange={handleDateFilterChange}
            startDate={startDate}
            endDate={endDate}
            onCustomRangeApply={handleCustomRangeApply}
            loading={kpiLoading}
           />

          {/* Charts Section - Now uses chartLoading state */}
          <div className="charts-grid">
            <RevenueChart 
              revenueData={revenueData} 
              dateFilter={dateFilter}
              loading={chartLoading}
            />

            <TopSellingList 
              topSelling={topSelling} 
              dateFilter={dateFilter}
              loading={chartLoading}
            />
          </div>

          {/* Bottom Section */}
          <div className="bottom-grid">
            <RecentOrdersTable 
              recentOrders={recentOrders} 
              ordersLimit={ordersLimit}
              onLimitChange={setOrdersLimit}
              activeRentals={activeRentals}
              loading={chartLoading}
            />

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