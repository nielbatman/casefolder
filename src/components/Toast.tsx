import React from 'react';
import type { ToastMessage } from '../types/case';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = 'border-emerald-300 dark:border-emerald-500/40 bg-white dark:bg-emerald-950/90 text-slate-800 dark:text-emerald-200 shadow-xl shadow-slate-200/50 dark:shadow-2xl';
        let iconColor = 'text-emerald-600 dark:text-emerald-400';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-300 dark:border-rose-500/40 bg-white dark:bg-rose-950/90 text-slate-800 dark:text-rose-200 shadow-xl shadow-slate-200/50 dark:shadow-2xl';
          iconColor = 'text-rose-600 dark:text-rose-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-300 dark:border-amber-500/40 bg-white dark:bg-amber-950/90 text-slate-800 dark:text-amber-200 shadow-xl shadow-slate-200/50 dark:shadow-2xl';
          iconColor = 'text-amber-600 dark:text-amber-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = 'border-blue-300 dark:border-blue-500/40 bg-white dark:bg-blue-950/90 text-slate-800 dark:text-blue-200 shadow-xl shadow-slate-200/50 dark:shadow-2xl';
          iconColor = 'text-blue-600 dark:text-blue-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl transition-all duration-300 animate-slide-up ${borderClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs tracking-wide uppercase text-slate-900 dark:text-white/90">
                {toast.title}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
