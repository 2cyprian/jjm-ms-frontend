import React from 'react';

function FormGrid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '12px'
    }}>
      {children}
    </div>
  );
}

export default FormGrid;
