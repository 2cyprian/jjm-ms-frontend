import React, { useState } from 'react';
import { Download, Printer, X } from 'lucide-react';
import Button from './Button';

const JobDetailModal = ({ job, onClose, onPrint, onDownload }) => {
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <X size={24} color="var(--primary)" />
        </button>

        {/* Job Details */}
        <h2 style={{
          color: 'var(--primary)',
          marginBottom: '1.5rem',
          fontSize: '1.5rem'
        }}>
          Job Details
        </h2>

        <div style={{
          marginBottom: '1.5rem',
          backgroundColor: '#f9f9f9',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              color: '#666',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Job Code
            </label>
            <p style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'var(--primary)',
              margin: '0.5rem 0 0 0'
            }}>
              #{job.job_code}
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              color: '#666',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              File Name
            </label>
            <p style={{
              fontSize: '1rem',
              color: '#333',
              margin: '0.5rem 0 0 0',
              wordBreak: 'break-all'
            }}>
              {job.filename}
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              color: '#666',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Total Pages
            </label>
            <p style={{
              fontSize: '1rem',
              color: '#333',
              margin: '0.5rem 0 0 0'
            }}>
              {job.total_pages} pages
            </p>
          </div>

          <div style={{ marginBottom: '0' }}>
            <label style={{
              color: '#666',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Status
            </label>
            <p style={{
              fontSize: '1rem',
              color: 'var(--accent)',
              margin: '0.5rem 0 0 0',
              fontWeight: '600'
            }}>
              {job.status}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <Button
            onClick={() => onDownload(job)}
            variant="primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Download size={18} />
            Download
          </Button>
          <Button
            onClick={() => onPrint(job)}
            variant="primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Printer size={18} />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
