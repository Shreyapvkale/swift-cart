import React from 'react';
import uiStore from '../store/uiStore';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = uiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 p-4 rounded-btn shadow-hover border transition-all duration-300 transform translate-y-0 opacity-100 ${
            t.type === 'success'
              ? 'bg-primary-light border-primary/20 text-primary-dark'
              : t.type === 'error' || t.type === 'warning'
              ? 'bg-accent-light border-accent/20 text-accent-dark'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div>
            {t.type === 'success' && <CheckCircle size={20} />}
            {(t.type === 'error' || t.type === 'warning') && <AlertTriangle size={20} />}
            {t.type === 'info' && <Info size={20} />}
          </div>
          
          <div className="flex-1 text-sm font-medium">{t.message}</div>
          
          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
