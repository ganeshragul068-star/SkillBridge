import React from 'react';
import './FormInput.css';

const FormInput = ({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  required = false,
  helperText = '',
  icon: Icon = null,
  disabled = false,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`form-input-group ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="form-input-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className="input-with-icon-wrapper">
        {Icon && <Icon className="input-icon" size={18} />}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`form-input-field ${Icon ? 'with-icon' : ''}`}
          {...props}
        />
      </div>

      {error ? (
        <span className="input-error-msg">{error}</span>
      ) : helperText ? (
        <span className="input-helper-msg">{helperText}</span>
      ) : null}
    </div>
  );
};

export default FormInput;
