import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'lime' }) => {
  const colors = {
    lime: 'text-lime-400 bg-lime-400/10',
    green: 'text-green-400 bg-green-400/10',
    red: 'text-red-400 bg-red-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend > 0 ? (
            <ArrowUp className="mr-1 h-4 w-4 text-green-400" />
          ) : trend < 0 ? (
            <ArrowDown className="mr-1 h-4 w-4 text-red-400" />
          ) : (
            <Minus className="mr-1 h-4 w-4 text-slate-400" />
          )}
          <span
            className={
              trend > 0
                ? 'text-green-400'
                : trend < 0
                ? 'text-red-400'
                : 'text-slate-400'
            }
          >
            {Math.abs(trend)}%
          </span>
          <span className="ml-2 text-slate-500">vs mes anterior</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;