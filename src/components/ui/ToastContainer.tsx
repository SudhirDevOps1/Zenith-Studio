import React, { useState } from 'react';
import { useToastStore, Toast } from '../../stores/useToastStore';
import { Check, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const iconMap: Record<string, React.ReactNode> = {
    success: <Check className="w-4 h-4 text-emerald-400" />,
    error: <AlertCircle className="w-4 h-4 text-red-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
  };

  const borderMap: Record<string, string> = {
    success: 'border-emerald-500/40',
    error: 'border-red-500/40',
    warning: 'border-amber-500/40',
    info: 'border-blue-500/40',
  };

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 bg-[#1e1e2e] border-l-4 ${borderMap[toast.type]} shadow-xl rounded-lg text-sm text-slate-200 animate-toast-in max-w-sm ${isExiting ? 'animate-toast-out' : ''}`}
    >
      <div className="shrink-0 mt-0.5">{iconMap[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs">{toast.title}</p>
        {toast.message && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{toast.message}</p>}
      </div>
      <button onClick={handleRemove} className="shrink-0 text-slate-400 hover:text-white p-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-10 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast: Toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};
