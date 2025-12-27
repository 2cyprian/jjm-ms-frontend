import React from 'react';

const Spinner = ({ size = 20 }) => {
  return (
    <div 
      className="spinner" 
      style={{ width: size, height: size }}
    />
  );
};

export default Spinner;
