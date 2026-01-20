import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/adminHelpers';

const ServiceConfigModal = ({
  show,
  onClose,
  serviceType,
  onServiceTypeChange,
  printType,
  onPrintTypeChange,
  paperSize,
  onPaperSizeChange,
  paperType,
  onPaperTypeChange,
  servicePages,
  onServicePagesChange,
  servicePrice,
  onServicePriceChange,
  onSave
}) => {
  if (!show) return null;

  const totalCost = parseInt(servicePages || 0) * parseFloat(servicePrice || 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Add Service Configuration</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Service Type */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Service Type
          </label>
          <select
            value={serviceType}
            onChange={(e) => onServiceTypeChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            <option value="photocopy">Photocopy</option>
            <option value="print">Print</option>
          </select>
        </div>

        {/* Print Type (only if service is Print) */}
        {serviceType === 'print' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Print Type
            </label>
            <select
              value={printType}
              onChange={(e) => onPrintTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="bw">Black & White</option>
              <option value="color">Color</option>
            </select>
          </div>
        )}

        {/* Paper Size */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Paper Size
          </label>
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            <option value="A0">A0</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="A3">A3</option>
            <option value="A4">A4</option>
          </select>
        </div>

        {/* Paper Type */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Paper Type
          </label>
          <select
            value={paperType}
            onChange={(e) => onPaperTypeChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            <option value="draft">Draft-Film</option>
            <option value="gloss">Gloss</option>
            <option value="plain">Plain</option>
            <option value="sticker">Sticker</option>
            <option value="manila">Manila</option>
          </select>
        </div>

        {/* Number of Pages */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Number of Pages
          </label>
          <input
            type="number"
            min="1"
            value={servicePages}
            onChange={(e) => onServicePagesChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Price per Page */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Price per Page (TZS)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={servicePrice}
            onChange={(e) => onServicePriceChange(e.target.value)}
            placeholder="Enter price per page"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Total Preview */}
        {servicePrice && servicePages && (
          <div style={{
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Configuration Summary:</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#333' }}>
              {serviceType === 'photocopy' ? 'Photocopy' : `Print (${printType.toUpperCase()})`} - {paperSize} {paperType} ({servicePages}p)
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4CAF50' }}>
                {formatCurrency(totalCost, 'TZS')}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfigModal;
