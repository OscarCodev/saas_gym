import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  onClick, 
  type = 'button',
  className = ''
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-lime-400 text-slate-950 hover:bg-lime-500 focus:ring-lime-400",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-500",
    outline: "border border-slate-700 text-slate-300 hover:border-lime-400 hover:text-lime-400 focus:ring-lime-400",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;