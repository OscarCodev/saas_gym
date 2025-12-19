import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessModal = ({ isOpen, message, title, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/10">
          <CheckCircle className="h-10 w-10 text-lime-400 animate-bounce" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-100">{title || '¡Éxito!'}</h3>
        <div className="text-slate-400">{message}</div>
      </div>
    </div>
  );
};

export default SuccessModal;