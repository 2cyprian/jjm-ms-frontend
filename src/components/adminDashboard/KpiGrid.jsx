import React, { useState, useEffect } from 'react';
import { MdPayments } from 'react-icons/md';
import { FiTrendingUp, FiTrendingDown, FiShoppingCart, FiFileText, FiBarChart } from 'react-icons/fi';
import { formatCurrency } from '../../utils/adminHelpers';
import api from '../../utils/api';

const KpiGrid = ({ stats, totalRevenueDisplay, rentalIncome, dateRange = 'today' }) => {
  const [kpiData, setKpiData] = useState(stats || {
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalExpenses: 0,
    expensesChange: 0,
    rentalIncome: 0
  });

  useEffect(() => {
    // When stats change from parent, update local state
    if (stats) {
      console.log('📊 KPI Stats updated from parent with dateRange:', dateRange);
      setKpiData(stats);
    }
  }, [stats, dateRange]);

  return (
    <div className="kpi-grid">
      {/* Total Revenue */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-icon amber-bg">
            <MdPayments size={24} />
          </div>
          <span className="kpi-trend positive">
            <FiTrendingUp size={14} />
            +{kpiData.revenueChange}%
          </span>
        </div>
        <p className="kpi-label">Total Revenue</p>
        <h3 className="kpi-value">{formatCurrency(totalRevenueDisplay || kpiData.totalRevenue, 'TZS')}</h3>
      </div>

      {/* Total Orders */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-icon blue-bg">
            <FiShoppingCart size={24} />
          </div>
          <span className="kpi-trend positive">
            <FiTrendingUp size={14} />
            +{kpiData.ordersChange}%
          </span>
        </div>
        <p className="kpi-label">Total Orders</p>
        <h3 className="kpi-value">{kpiData.totalOrders}</h3>
      </div>

      {/* Total Expenses */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-icon red-bg">
            <FiFileText size={24} />
          </div>
          <span className="kpi-trend negative">
            <FiTrendingDown size={14} />
            {kpiData.expensesChange}%
          </span>
        </div>
        <p className="kpi-label">Total Expenses</p>
        <h3 className="kpi-value">{formatCurrency(kpiData.totalExpenses, 'TZS')}</h3>
      </div>

      {/* Rental Income */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-icon amber-bg">
            <FiBarChart size={24} />
          </div>
          <span className="kpi-trend positive">
            <FiTrendingUp size={14} />
            +{kpiData.rentalIncome > 0 ? '2.5' : '0'}%
          </span>
        </div>
        <p className="kpi-label">Rental Income</p>
        <h3 className="kpi-value">{formatCurrency(rentalIncome || kpiData.rentalIncome, 'TZS')}</h3>
        {kpiData.start_date && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
             {new Date(kpiData.start_date).toLocaleDateString()} - {new Date(kpiData.end_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default KpiGrid;
