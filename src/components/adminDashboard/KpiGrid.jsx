import React from 'react';
import { formatCurrency } from '../../utils/adminHelpers';

const KpiGrid = ({ stats, totalRevenueDisplay, rentalIncome }) => {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-icon green">💰</div>
          <span className="kpi-trend positive">↗ +{stats.revenueChange}%</span>
        </div>
        <p className="kpi-label">Total Revenue</p>
        <h3 className="kpi-value">{formatCurrency(totalRevenueDisplay, 'TZS')}</h3>
      </div>

      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-icon teal">🏠</div>
          <span className="kpi-trend">Rental Revenue</span>
        </div>
        <p className="kpi-label">Rental Revenue</p>
        <h3 className="kpi-value">{formatCurrency(rentalIncome, 'TZS')}</h3>
        <p className="kpi-subtext">This period</p>
      </div>

      <div className="kpi-card alert">
        <div className="kpi-header">
          <div className="kpi-icon yellow">📦</div>
          <span className="kpi-trend alert">⚠️ Action Needed</span>
        </div>
        <p className="kpi-label">Low Stock Items</p>
        <h3 className="kpi-value">{stats.lowStockItems}</h3>
      </div>

      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-icon purple">🚶</div>
          <span className="kpi-trend negative">↘ {stats.footfallChange}%</span>
        </div>
        <p className="kpi-label">Daily Footfall</p>
        <h3 className="kpi-value">{stats.dailyFootfall}</h3>
      </div>
    </div>
  );
};

export default KpiGrid;
