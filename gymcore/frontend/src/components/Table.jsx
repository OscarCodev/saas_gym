import React from 'react';
import { Loader2 } from 'lucide-react';

const Table = ({ columns, data, onRowClick, loading = false }) => {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950/50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900">
            {data.map((row, rowIdx) => (
              <tr 
                key={row.id || rowIdx} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? "cursor-pointer hover:bg-slate-800/50 transition-colors" : ""}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;