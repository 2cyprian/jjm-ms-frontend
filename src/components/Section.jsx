import React from 'react';

function Section({ title, children }) {
  return (
    <div style={{
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '10px',
      padding: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {title && (
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#fff'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export default Section;
