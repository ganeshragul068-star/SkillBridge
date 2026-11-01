import React from 'react';
import './SelectField.css';

const SelectField = ({
  label,
  id,
  name,
  options = [],
  value,
  onChange,
  error = '',
  required = false,
  placeholder = 'Select an option...',
  disabled = false,
  ...props
}) => {
  const selectId = id || name;

  return (
    <div className={`select-field-group ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="select-field-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className="select-field-wrapper">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="select-field-element"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={idx} value={val}>
                {text}
              </option>
            );
          })}
        </select>
      </div>

      {error && <span className="select-error-msg">{error}</span>}
    </div>
  );
};

export default SelectField;
