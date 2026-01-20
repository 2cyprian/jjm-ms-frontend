import React from 'react';
import { BarChart3, Package, Users, Briefcase, TrendingUp } from 'lucide-react';

const RentalSubnav = ({ active, onTabChange }) => {
  const tabs = [
    { id: 'rentals', label: 'Rentals', icon: BarChart3 },
    { id: 'equipment', label: 'Equipment', icon: Package },
    { id: 'persons', label: 'Persons', icon: Users },
    { id: 'sponsors', label: 'Sponsors', icon: Briefcase },
    { id: 'reports', label: 'Reports & Stats', icon: TrendingUp },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        padding: '0 24px',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#1f2937' : '#6b7280',
              borderBottom: isActive ? '2px solid #3b82f6' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon size={18} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default RentalSubnav;
