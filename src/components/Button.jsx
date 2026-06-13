import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  className = '', 
  type = 'button',
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
