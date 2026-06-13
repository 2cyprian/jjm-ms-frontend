import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ExpensesBreakdownCard = ({ dateRange = 'last_7_days' }) => {
  const [expenses, setExpenses] = useState([
    { label: 'Logistics', percentage: 45, color: '#1F2937' },
    { label: 'Materials', percentage: 30, color: '#F3B33D' },
    { label: 'Overhead', percentage: 25, color: '#d1d5db' }
  ]);
  const [total, setTotal] = useState(18200);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpensesBreakdown();
  }, [dateRange]);

  const fetchExpensesBreakdown = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/expenses-breakdown?date_range=${dateRange}`);
      
      if (response.data?.data) {
        const data = response.data.data;
        
        // If breakdown array exists
        if (Array.isArray(data.breakdown)) {
          const colorMap = {
            'Logistics': '#1F2937',
            'Materials': '#F3B33D',
            'Overhead': '#d1d5db',
            'logistics': '#1F2937',
            'materials': '#F3B33D',
            'overhead': '#d1d5db'
          };
          
          const expensesData = data.breakdown.map(item => ({
            label: item.category || item.label,
            percentage: item.percentage || 0,
            color: colorMap[item.category] || '#999'
          }));
          
          setExpenses(expensesData);
          setTotal(data.total || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching expenses breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format total for display
  const formatTotal = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value}`;
  };

  return (
    <div className="chart-card expenses-card">
      <h3>Expenses Breakdown</h3>
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span>Loading breakdown...</span>
        </div>
      ) : (
        <div className="donut-container">
          <div className="donut-chart">
            <svg viewBox="0 0 36 36" className="donut-svg">
              <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f3f4f6" strokeWidth="4"></circle>
              {expenses.map((expense, idx) => {
                // Calculate stroke-dashoffset for each segment
                let offset = 0;
                for (let i = 0; i < idx; i++) {
                  offset += expenses[i].percentage;
                }
                
                return (
                  <circle 
                    key={idx}
                    cx="18" 
                    cy="18" 
                    fill="transparent" 
                    r="15.915" 
                    stroke={expense.color}
                    strokeDasharray={`${expense.percentage} ${100 - expense.percentage}`}
                    strokeDashoffset={25 - offset}
                    strokeWidth="4"
                  ></circle>
                );
              })}
            </svg>
            <div className="donut-label">
              <span className="donut-amount">{formatTotal(total)}</span>
              <span className="donut-text">Total</span>
            </div>
          </div>
          <div className="expense-legend">
            {expenses.map((expense, idx) => (
              <div key={idx} className="legend-row">
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: expense.color }}></span>
                  <span className="legend-label">{expense.label}</span>
                </div>
                <span className="legend-value">{expense.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesBreakdownCard;

  return (
    <div className="chart-card expenses-card">
      <h3>Expenses Breakdown</h3>
      <div className="donut-container">
        <div className="donut-chart">
          <svg viewBox="0 0 36 36" className="donut-svg">
            <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f3f4f6" strokeWidth="4"></circle>
            <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#1F2937" strokeDasharray="45 55" strokeDashoffset="25" strokeWidth="4"></circle>
            <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#F3B33D" strokeDasharray="30 70" strokeDashoffset="80" strokeWidth="4"></circle>
            <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#d1d5db" strokeDasharray="25 75" strokeDashoffset="10" strokeWidth="4"></circle>
          </svg>
          <div className="donut-label">
            <span className="donut-amount">$18.2k</span>
            <span className="donut-text">Total</span>
          </div>
        </div>
        <div className="expense-legend">
          {expenses.map((expense, idx) => (
            <div key={idx} className="legend-row">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: expense.color }}></span>
                <span className="legend-label">{expense.label}</span>
              </div>
              <span className="legend-value">{expense.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesBreakdownCard;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[350px]">
      <h4 className="text-2xl font-bold text-slate-900 mb-8">Expenses Breakdown</h4>
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Donut Chart SVG */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle 
              cx="18" 
              cy="18" 
              fill="transparent" 
              r="15.915" 
              stroke="#e5e7eb" 
              strokeWidth="4"
            ></circle>
            {/* Logistics - 45% */}
            <circle 
              cx="18" 
              cy="18" 
              fill="transparent" 
              r="15.915" 
              stroke="#0f172a" 
              strokeDasharray="45 55" 
              strokeDashoffset="25" 
              strokeWidth="4"
            ></circle>
            {/* Materials - 30% */}
            <circle 
              cx="18" 
              cy="18" 
              fill="transparent" 
              r="15.915" 
              stroke="#d97706" 
              strokeDasharray="30 70" 
              strokeDashoffset="80" 
              strokeWidth="4"
            ></circle>
            {/* Overhead - 25% */}
            <circle 
              cx="18" 
              cy="18" 
              fill="transparent" 
              r="15.915" 
              stroke="#d1d5db" 
              strokeDasharray="25 75" 
              strokeDashoffset="10" 
              strokeWidth="4"
            ></circle>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-900">$18.2k</span>
            <span className="text-xs text-gray-600">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 w-full space-y-3">
          {expenses.map((expense, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${expense.color}`}></span>
                <span className="text-sm text-gray-600">{expense.label}</span>
              </div>
              <span className="text-sm font-medium text-slate-900">{expense.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesBreakdownCard;
