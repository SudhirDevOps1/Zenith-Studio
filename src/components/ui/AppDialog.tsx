import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, FilePlus, FolderPlus, Sparkles } from 'lucide-react';

export type DialogType = 'file' | 'folder' | 'confirm' | 'input' | 'template';

interface AppDialogProps {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  type,
  title,
  message,
  defaultValue = '',
  placeholder = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Enter') {
        onConfirm(type === 'confirm' ? 'confirmed' : value);
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, value, onConfirm, onCancel]);

  if (!isOpen) return null;

  const icons = {
    file: <FilePlus className="w-6 h-6 text-blue-400" />,
    folder: <FolderPlus className="w-6 h-6 text-amber-400" />,
    template: <Sparkles className="w-6 h-6 text-purple-400" />,
    confirm: <AlertCircle className="w-6 h-6 text-orange-400" />,
    input: <FilePlus className="w-6 h-6 text-cyan-400" />,
  };

  return (
    <div onClick={onCancel} className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#181825]">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {message && (
            <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
          )}

          {(type === 'file' || type === 'folder' || type === 'input') && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {type === 'file' ? 'Filename' : type === 'folder' ? 'Folder Name' : 'Input'}
              </label>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder || (type === 'file' ? 'app.tsx' : type === 'folder' ? 'my-folder' : 'Enter value...')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-mono text-sm"
              />
              {type === 'file' && (
                <p className="text-[10px] text-slate-500">
                  Popular: .tsx, .ts, .js, .jsx, .html, .css, .json, .md, .mermaid
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-800 bg-[#181825]">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm(type === 'confirm' ? 'confirmed' : value)}
            disabled={(type === 'file' || type === 'folder' || type === 'input') && !value.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
