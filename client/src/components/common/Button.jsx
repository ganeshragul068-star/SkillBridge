import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'navy'
  size = 'md',        // 'sm', 'md', 'lg'
  fullWidth = false,
  icon: Icon = null,
  iconPosition = 'left',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const btnClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-block' : '',
    disabled ? 'btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={btnClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="btn-icon" size={size === 'sm' ? 16 : 18} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="btn-icon" size={size === 'sm' ? 16 : 18} />}
    </button>
  );
};

export default Button;
