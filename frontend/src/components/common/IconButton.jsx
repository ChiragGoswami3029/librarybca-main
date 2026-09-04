import React from 'react';

export default function IconButton({
  icon: Icon,
  label,
  variant = 'glass', // 'glass' | 'ghost' | 'primary' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  onClick,
  badge = null,
  ...props
}) {
  const sizeMap = {
    sm: { btn: 32, icon: 15 },
    md: { btn: 40, icon: 18 },
    lg: { btn: 48, icon: 22 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className}`}
      style={{
        width: currentSize.btn,
        height: currentSize.btn,
        padding: 0,
        borderRadius: 'var(--radius-md)',
        position: 'relative',
      }}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon size={currentSize.icon} />
      {badge !== null && badge > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            borderRadius: '9999px',
            background: 'var(--color-danger)',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
