import React from 'react';

function TextArea({ label, required, placeholder, rows = 3, onChange }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      {label && (
        <label style={{
          fontSize: '13px',
          fontWeight: '500',
          color: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        rows={rows}
        required={required}
        onChange={onChange}
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '13px',
          fontFamily: 'inherit',
          outline: 'none',
          resize: 'vertical',
          transition: 'all 0.2s'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        }}
      />
    </div>
  );
}

export default TextArea;
