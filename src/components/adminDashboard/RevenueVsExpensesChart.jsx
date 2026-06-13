import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const RevenueVsExpensesChart = ({ dateRange = 'last_7_days' }) => {
  const [chartData, setChartData] = useState([
    { month: 'Jan', revenue: 40, expenses: 20 },
    { month: 'Feb', revenue: 55, expenses: 25 },
    { month: 'Mar', revenue: 70, expenses: 30 },
    { month: 'Apr', revenue: 65, expenses: 35 },
    { month: 'May', revenue: 85, expenses: 40 },
    { month: 'Jun', revenue: 95, expenses: 45 }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [dateRange]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/revenue-expenses?date_range=${dateRange}&months=6`);
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        const normalizedData = response.data.data.map(item => {
          const maxRevenue = Math.max(...response.data.data.map(d => d.revenue || 0));
          const maxExpenses = Math.max(...response.data.data.map(d => d.expenses || 0));
          const maxValue = Math.max(maxRevenue, maxExpenses) || 100;
          
          return {
            month: item.month || item.date?.slice(5, 7) || '',
            revenue: Math.round((item.revenue || 0) / maxValue * 100),
            expenses: Math.round((item.expenses || 0) / maxValue * 100),
            actualRevenue: item.revenue || 0,
            actualExpenses: item.expenses || 0
          };
        });
        
        setChartData(normalizedData.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chart-card chart-large">
      <div className="chart-header">
        <div>
          <h3>Revenue vs Expenses</h3>
          <p>Monthly performance comparison</p>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#1F2937' }}></span>
            <span>Revenue</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#F3B33D' }}></span>
            <span>Expenses</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          Loading chart...
        </div>
      ) : (
        <div className="bar-chart-container">
          {chartData.map((item, idx) => (
            <div key={idx} className="bar-column" title={`Revenue: ${item.actualRevenue}, Expenses: ${item.actualExpenses}`}>
              <div className="bar-group">
                <div 
                  className="bar bar-primary"
                  style={{ height: `${Math.max(item.revenue, 5)}%` }}
                ></div>
                <div 
                  className="bar bar-secondary"
                  style={{ height: `${Math.max(item.expenses, 5)}%` }}
                ></div>
              </div>
              <span className="bar-label">{item.month}</span>
            </div>
          ))}
        </div>
      )}
  );
};

export default RevenueVsExpensesChart;
