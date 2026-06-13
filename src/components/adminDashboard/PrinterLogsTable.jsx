import React from 'react';
import Button from '../Button';
import { getLogStatusStyle, sortPrinterLogs, paginateItems, getSortIndicator } from '../../utils/adminHelpers';

const PrinterLogsTable = ({
  logs = [],
  loading = false,
  sortField = 'printed_at',
  sortDirection = 'desc',
  onSort,
  page = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
}) => {
  const sorted = sortPrinterLogs(logs, sortField, sortDirection);
  const { total, totalPages, pageItems } = paginateItems(sorted, page, pageSize);

  return (
    <div>
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSort && onSort('id')}>ID{getSortIndicator('id', sortField, sortDirection)}</th>
              <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSort && onSort('printer_name')}>Printer Name{getSortIndicator('printer_name', sortField, sortDirection)}</th>
              <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSort && onSort('job_name')}>Job Name{getSortIndicator('job_name', sortField, sortDirection)}</th>
              <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSort && onSort('status')}>Status{getSortIndicator('status', sortField, sortDirection)}</th>
              <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSort && onSort('pages')}>Pages{getSortIndicator('pages', sortField, sortDirection)}</th>
              <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSort && onSort('source_machine')}>Source Machine{getSortIndicator('source_machine', sortField, sortDirection)}</th>
              <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSort && onSort('sent')}>Sent Status{getSortIndicator('sent', sortField, sortDirection)}</th>
              <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => onSort && onSort('printed_at')}>Printed At{getSortIndicator('printed_at', sortField, sortDirection)}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Loading logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>No logs to display</td>
              </tr>
            ) : (
              pageItems.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px' }}>{log.id}</td>
                  <td style={{ padding: '10px' }}>{log.printer_name}</td>
                  <td style={{ padding: '10px' }}>{log.job_name}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, backgroundColor: getLogStatusStyle(log.status).bg, color: getLogStatusStyle(log.status).color }}>
                      {String(log.status || '').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>{log.pages}</td>
                  <td style={{ padding: '10px' }}>{log.source_machine}</td>
                  <td style={{ padding: '10px' }}>
                    {log.received_at ? (
                      <span style={{ color: '#065f46', fontWeight: 700 }}>✓ Sent</span>
                    ) : (
                      <span style={{ color: '#991b1b', fontWeight: 700 }}>✗ Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>{log.printed_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
        <div style={{ color: '#6b7280' }}>Page {page} of {Math.max(1, totalPages)}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button variant="secondary" onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>Prev</Button>
          <Button variant="secondary" onClick={() => onPageChange && onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</Button>
          <select value={pageSize} onChange={(e) => onPageSizeChange && onPageSizeChange(parseInt(e.target.value, 10))} style={{ padding: '6px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PrinterLogsTable;
