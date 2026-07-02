import React, { useState, useEffect } from 'react';
import { MdPayments } from 'react-icons/md';
import { FiTrendingUp, FiTrendingDown, FiShoppingCart, FiFileText, FiBarChart, FiDollarSign } from 'react-icons/fi';
import { formatCurrency } from '../../utils/adminHelpers';
import DateRangeSelector from './DateRangeSelector';

const KpiGrid = ({ 
  stats, 
  totalRevenueDisplay, 
  rentalIncome, 
  dateRange = 'today',
  onDateFilterChange,
  startDate,
  endDate,
  onCustomRangeApply,
  loading = false 
}) => {
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalExpenses: 0,
    expensesChange: 0,
    rentalIncome: 0,
    start_date: null,
    end_date: null,
    period: null
  });

  useEffect(() => {
    if (stats) {
      console.log('📊 KPI Stats updated from parent with dateRange:', dateRange);
      console.log('📊 Stats data:', stats);
      setKpiData({
        ...stats,
        start_date: stats.start_date || stats.period_start || null,
        end_date: stats.end_date || stats.period_end || null,
        period: stats.period || null
      });
    }
  }, [stats, dateRange]);

  const getRangeLabel = () => {
    if (dateRange === 'custom') return 'Custom Range';
    if (dateRange === 'last_7_days') return 'Last 7 Days';
    if (dateRange === 'last_30_days') return 'Last 30 Days';
    if (dateRange === 'last_90_days') return 'Last 90 Days';
    return 'Today';
  };

  // Format date display from period string or individual dates
  const getDateRangeDisplay = () => {
    if (kpiData.period) {
      const [start, end] = kpiData.period.split(' to ');
      if (start && end) {
        try {
          const startDate = new Date(start);
          const endDate = new Date(end);
          if (!isNaN(startDate) && !isNaN(endDate)) {
            return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
          }
        } catch (e) {
          return kpiData.period;
        }
      }
      return kpiData.period;
    }
    
    if (kpiData.start_date && kpiData.end_date) {
      try {
        const startDate = new Date(kpiData.start_date);
        const endDate = new Date(kpiData.end_date);
        if (!isNaN(startDate) && !isNaN(endDate)) {
          return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        }
      } catch (e) {
        return 'Date range unavailable';
      }
    }
    
    return null;
  };

  // Get rental income from either prop or kpiData
  const getRentalIncome = () => {
    if (rentalIncome !== undefined && rentalIncome !== null) {
      return rentalIncome;
    }
    return kpiData.rentalIncome || 0;
  };

  // Calculate Total Profit (Revenue - Expenses)
  const calculateTotalProfit = () => {
    const revenue = totalRevenueDisplay || kpiData.totalRevenue || 0;
    const expenses = kpiData.totalExpenses || 0;
    return revenue - expenses;
  };

  // Calculate profit margin percentage
  const calculateProfitMargin = () => {
    const revenue = totalRevenueDisplay || kpiData.totalRevenue || 0;
    const profit = calculateTotalProfit();
    if (revenue === 0) return 0;
    return (profit / revenue) * 100;
  };

  // Safely format currency with fallback
  const safeFormatCurrency = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || !isFinite(numValue)) {
      return formatCurrency(0, 'TZS');
    }
    return formatCurrency(numValue, 'TZS');
  };

  const dateRangeDisplay = getDateRangeDisplay();
  const totalProfit = calculateTotalProfit();
  const profitMargin = calculateProfitMargin();
  const isProfitable = totalProfit > 0;

  // Handle date filter change from DateRangeSelector
  const handleDateFilterChange = (newFilter) => {
    if (onDateFilterChange) {
      onDateFilterChange(newFilter);
    }
  };

  // Handle custom range apply
  const handleCustomRangeApply = (start, end) => {
    if (onCustomRangeApply) {
      onCustomRangeApply(start, end);
    }
  };

  if (loading) {
    return (
      <div className="kpi-grid">
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '600' }}>Performance Overview</span>
          <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: '700' }}>{getRangeLabel()}</span>
        </div>
        <div className="kpi-card-grid" style={{ opacity: 0.6, pointerEvents: 'none' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="kpi-card" style={{ background: '#f9fafb' }}>
              <div className="kpi-header">
                <div className="kpi-icon" style={{ background: '#e5e7eb' }}></div>
              </div>
              <p className="kpi-label" style={{ color: '#9ca3af' }}>Loading...</p>
              <h3 className="kpi-value" style={{ color: '#d1d5db' }}>---</h3>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="kpi-grid">
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '600' }}>Performance Overview</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: '700' }}>{getRangeLabel()}</span>
          <DateRangeSelector 
            dateFilter={dateRange}
            onDateFilterChange={handleDateFilterChange}
            startDate={startDate}
            endDate={endDate}
            onCustomRangeApply={handleCustomRangeApply}
          />
        </div>
      </div>
      <div className="kpi-card-grid">
        {/* Total Profit */}
        <div className="kpi-card" style={{ borderLeft: `4px solid ${isProfitable ? '#22c55e' : '#ef4444'}` }}>
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: isProfitable ? '#dcfce7' : '#fee2e2' }}>
              <FiDollarSign size={24} color={isProfitable ? '#22c55e' : '#ef4444'} />
            </div>
            <span className={`kpi-trend ${isProfitable ? 'positive' : 'negative'}`}>
              {isProfitable ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
              {profitMargin.toFixed(1)}%
            </span>
          </div>
          <p className="kpi-label">Total Profit</p>
          <h3 className="kpi-value" style={{ color: isProfitable ? '#22c55e' : '#ef4444' }}>
            {safeFormatCurrency(totalProfit)}
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isProfitable ? '▲ Profitable' : '▼ Loss'}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon amber-bg">
              <MdPayments size={24} />
            </div>
            <span className="kpi-trend positive">
              <FiTrendingUp size={14} />
              +{kpiData.revenueChange || 0}%
            </span>
          </div>
          <p className="kpi-label">Total Revenue</p>
          <h3 className="kpi-value">{safeFormatCurrency(totalRevenueDisplay || kpiData.totalRevenue)}</h3>
        </div>

        {/* Total Orders */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon blue-bg">
              <FiShoppingCart size={24} />
            </div>
            <span className="kpi-trend positive">
              <FiTrendingUp size={14} />
              +{kpiData.ordersChange || 0}%
            </span>
          </div>
          <p className="kpi-label">Total Orders</p>
          <h3 className="kpi-value">{kpiData.totalOrders || 0}</h3>
        </div>

        {/* Total Expenses */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon red-bg">
              <FiFileText size={24} />
            </div>
            <span className="kpi-trend negative">
              <FiTrendingDown size={14} />
              {kpiData.expensesChange || 0}%
            </span>
          </div>
          <p className="kpi-label">Total Expenses</p>
          <h3 className="kpi-value">{safeFormatCurrency(kpiData.totalExpenses)}</h3>
        </div>

        {/* Rental Income */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon amber-bg">
              <FiBarChart size={24} />
            </div>
            <span className="kpi-trend positive">
              <FiTrendingUp size={14} />
              +{getRentalIncome() > 0 ? '2.5' : '0'}%
            </span>
          </div>
          <p className="kpi-label">Rental Income</p>
          <h3 className="kpi-value">{safeFormatCurrency(getRentalIncome())}</h3>
          {dateRangeDisplay && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {dateRangeDisplay}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiGrid;