import React from 'react';

export default function Dropdown({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  error = null,
  required = false,
  className = '',
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`glass-input glass-select ${className}`}
        style={error ? { borderColor: 'var(--color-danger)' } : {}}
      >
        <option value="" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
          {placeholder}
        </option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option
              key={val}
              value={val}
              style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}
            >
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
