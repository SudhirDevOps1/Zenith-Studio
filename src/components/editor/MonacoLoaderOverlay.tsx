import React from 'react';
import { Code2 } from 'lucide-react';

interface MonacoLoaderOverlayProps {
  visible: boolean;
}

export const MonacoLoaderOverlay: React.FC<MonacoLoaderOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-[#1e1e2e] flex flex-col items-center justify-center z-30 animate-fade-in-up">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-spin-slow">
        <Code2 className="w-7 h-7 text-white" />
      </div>
      <p className="mt-4 text-sm font-mono text-slate-400 animate-pulse">Loading Monaco Editor Engine...</p>
      <div className="mt-3 w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse" style={{ width: '70%' }} />
      </div>
    </div>
  );
};
