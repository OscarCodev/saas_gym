import React from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  error, 
  icon: Icon, 
  placeholder,
  required = false,
  disabled = false
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {label} {required && <span className="text-lime-400">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-slate-500" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full rounded-lg border bg-slate-950 p-2.5 text-slate-100 placeholder-slate-500 focus:border-lime-400 focus:ring-lime-400 sm:text-sm ${
            Icon ? 'pl-10' : ''
          } ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-slate-700'
          } disabled:opacity-50`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;