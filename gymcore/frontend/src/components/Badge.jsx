import React from 'react';

const Badge = ({ label, variant = 'info' }) => {
  const variants = {
    success: 'bg-green-400/10 text-green-400 border-green-400/20',
    warning: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    error: 'bg-red-400/10 text-red-400 border-red-400/20',
    info: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    default: 'bg-slate-700/50 text-slate-300 border-slate-600',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant] || variants.default}`}>
      {label}
    </span>
  );
};

export default Badge;