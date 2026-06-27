import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}
