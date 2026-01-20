import React from 'react';
import { X } from 'lucide-react';
import Button from '../Button';
import { formatCurrency } from '../../utils/adminHelpers';

const PrintConfirmModal = ({
  show,
  onClose,
  onConfirm,
  job,
  printedPages,
  onPrintedPagesChange,
  printType,
  onPrintTypeChange,
  price,
  onPriceChange,
  savedServices
}) => {
  if (!show || !job) return null;

  const totalCost = (Number(printedPages) || 0) * (Number(price) || 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
    }}>
      <div style={{ backgroundColor: 'white', borderRadius: 8, padding: '1.5rem', width: '90%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Did the document print successfully?</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Confirm to deduct stock for this job.</p>
        
        <div style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
          <div style={{ marginBottom: '0.25rem' }}><strong>File:</strong> {job.filename || job.job_code}</div>
          <div style={{ marginBottom: '0.5rem' }}><strong>Queued Pages:</strong> {job.total_pages}</div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Pages actually printed</label>
          <input
            type="number"
            min="0"
            value={printedPages}
            onChange={(e) => onPrintedPagesChange(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6 }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="printType"
                value="print_bw"
                checked={printType === 'print_bw'}
                onChange={() => {
                  onPrintTypeChange('print_bw');
                  const matchingService = savedServices.find(s => s.serviceType === 'print' && s.printType === 'bw');
                  onPriceChange(matchingService?.price ? String(matchingService.price) : '');
                }}
              />
              B&W
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="printType"
                value="print_color"
                checked={printType === 'print_color'}
                onChange={() => {
                  onPrintTypeChange('print_color');
                  const matchingService = savedServices.find(s => s.serviceType === 'print' && s.printType === 'color');
                  onPriceChange(matchingService?.price ? String(matchingService.price) : '');
                }}
              />
              Color
            </label>
          </div>
          <label style={{ display: 'block', marginTop: '0.75rem', marginBottom: '0.25rem' }}>Price per page (TZS)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="Enter price per page"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6 }}
          />
          {(price && printedPages !== '') && (
            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: 6 }}>
              <strong>Total:</strong> {formatCurrency(totalCost, 'TZS')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button onClick={onClose} className="secondary" style={{ flex: 1 }}>No</Button>
          <Button onClick={onConfirm} style={{ flex: 1 }}>Yes, Deduct</Button>
        </div>
      </div>
    </div>
  );
};

export default PrintConfirmModal;
