import React from 'react';

export const Button = ({ children, onClick, disabled, className }) => {
  return (
    <button
      className={`dashboard_btn ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
