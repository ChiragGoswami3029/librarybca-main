import React from 'react';

export default function Skeleton({
  type = 'line', // 'line' | 'title' | 'card' | 'row' | 'avatar'
  width,
  height,
  borderRadius,
  className = '',
  style = {},
}) {
  const customStyles = { ...style };
  if (width) customStyles.width = width;
  if (height) customStyles.height = height;
  if (borderRadius) customStyles.borderRadius = borderRadius;

  const typeClass =
    type === 'title'
      ? 'skeleton-title'
      : type === 'card'
      ? 'skeleton-card'
      : type === 'row'
      ? 'skeleton-row'
      : type === 'avatar'
      ? 'skeleton-avatar'
      : 'skeleton-text';

  return <div className={`skeleton ${typeClass} ${className}`.trim()} style={customStyles} aria-hidden="true" />;
}
