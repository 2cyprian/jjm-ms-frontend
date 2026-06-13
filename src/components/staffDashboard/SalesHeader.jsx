import React from 'react';
import { formatCurrency } from '../../utils/adminHelpers';

const SalesHeader = ({ dailySales, transactionCount, onExportCSV }) => {
  return (
    <div className="dashboard-header" style={{ justifyContent: 'space-between' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Sales & Service</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '999px' }}>
          Daily Sales: {formatCurrency(dailySales || 0, 'TZS')}
        </span>
        <button
          onClick={onExportCSV}
          type="button"
          disabled={transactionCount === 0}
          style={{
            padding: '6px 12px',
            background: transactionCount > 0 ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: transactionCount > 0 ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          title={transactionCount === 0 ? 'No transactions to export' : 'Download today\'s sales report as CSV'}
        >
          📥 Export CSV
        </button>
      </div>
    </div>
  );
};

export default SalesHeader;
