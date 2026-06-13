import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/adminDashboard/DashboardHeader';
import KpiGrid from '../components/adminDashboard/KpiGrid';
import RevenueVsExpensesChart from '../components/adminDashboard/RevenueVsExpensesChart';
import TopServicesCard from '../components/adminDashboard/TopServicesCard';
import RecentOrdersTable from '../components/adminDashboard/RecentOrdersTable';
import ExpensesBreakdownCard from '../components/adminDashboard/ExpensesBreakdownCard';

const NewDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 42850,
    revenueChange: 12.4,
    totalOrders: 1284,
    ordersChange: 8.1,
    lowStockItems: 0,
    dailyFootfall: 0,
    footfallChange: 0
  });

  useEffect(() => {
    // Role guard
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      const roleRaw = user?.role || user?.role_name || user?.user_type;
      const role = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : roleRaw;
      if (!role || (role !== 'admin' && role !== 'owner' && role !== 'manager')) {
        navigate('/staff');
      }
    } catch (_) {}
  }, [navigate]);

  return (
    <main className="ml-64 pt-20 p-6 min-h-screen bg-gray-50">
      {/* KPI Row */}
      <KpiGrid 
        stats={stats}
        totalRevenueDisplay={42850}
        rentalIncome={0}
      />

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <RevenueVsExpensesChart />
        <TopServicesCard />
      </section>

      {/* Bottom Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentOrdersTable />
        <ExpensesBreakdownCard />
      </section>
    </main>
  );
};

export default NewDashboard;
