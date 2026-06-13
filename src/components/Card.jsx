import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`upload-card ${className}`}>
      {children}
    </div>
  );
};

export default Card;
