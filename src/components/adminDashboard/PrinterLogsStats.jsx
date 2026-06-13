import React from 'react';

const PrinterLogsStats = ({ printersCount = 0, logsCount = 0, selectedPrinterName = '-' }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
      <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Total Printers</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{printersCount}</div>
      </div>
      <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Log Count</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{logsCount}</div>
      </div>
      <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Selected Printer</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>{selectedPrinterName || '-'}</div>
      </div>
    </div>
  );
};

export default PrinterLogsStats;
