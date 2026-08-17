import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  FileCode,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useDiagnosticsStore, DiagnosticItem } from '../../stores/useDiagnosticsStore';
import { useFileStore } from '../../stores/useFileStore';

export const ProblemsPanel: React.FC<{
  onClose: () => void;
  onNavigateToLine?: (lineNumber: number, column?: number) => void;
}> = ({ onClose, onNavigateToLine }) => {
  const { diagnostics, clearDiagnostics } = useDiagnosticsStore();
  const { openFileInTab } = useFileStore();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning'>('all');
  const [isMaximized, setIsMaximized] = useState(false);

  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');


  const filtered = diagnostics.filter((d) => {
    if (filterSeverity === 'error') return d.severity === 'error';
    if (filterSeverity === 'warning') return d.severity === 'warning';
    return true;
  });

  // Group by file
  const groupedByFile = filtered.reduce((acc, item) => {
    if (!acc[item.fileName]) acc[item.fileName] = [];
    acc[item.fileName].push(item);
    return acc;
  }, {} as Record<string, DiagnosticItem[]>);

  const handleItemClick = (item: DiagnosticItem) => {
    openFileInTab(item.fileId);
    if (onNavigateToLine) {
      onNavigateToLine(item.startLineNumber, item.startColumn);
    }
  };

  return (
    <div
      style={{ height: isMaximized ? '420px' : '220px' }}
      className="border-t border-slate-800 bg-[#11111b] text-slate-300 font-sans flex flex-col transition-all duration-150 relative z-30"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-400" /> Problems & Diagnostics
          </span>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2 py-0.5 rounded-full transition flex items-center gap-1 ${
                filterSeverity === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All</span>
              <span className="px-1 bg-slate-900 rounded-full text-[10px]">{diagnostics.length}</span>
            </button>

            <button
              onClick={() => setFilterSeverity('error')}
              className={`px-2 py-0.5 rounded-full transition flex items-center gap-1 ${
                filterSeverity === 'error'
                  ? 'bg-red-950/80 text-red-300 font-semibold'
                  : 'text-slate-400 hover:text-red-300'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-red-400" />
              <span>{errors.length} Errors</span>
            </button>

            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2 py-0.5 rounded-full transition flex items-center gap-1 ${
                filterSeverity === 'warning'
                  ? 'bg-amber-950/80 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>{warnings.length} Warnings</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => clearDiagnostics()}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Clear Diagnostics"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Close Problems Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Diagnostics List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs font-mono" style={{ scrollbarWidth: 'thin' }}>
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-1.5 py-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-60" />
            <span className="text-xs font-semibold text-slate-400">No problems have been detected in the workspace.</span>
            <span className="text-[11px] text-slate-600">Syntax errors and warnings will automatically show here.</span>
          </div>
        ) : (
          Object.entries(groupedByFile).map(([fileName, items]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-sans font-semibold text-[11px] px-2 py-0.5 bg-slate-900/60 rounded">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{fileName}</span>
                <span className="text-slate-600">({items.length})</span>
              </div>

              <div className="space-y-0.5 pl-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex items-start gap-2 px-2 py-1 hover:bg-slate-800/80 rounded cursor-pointer transition text-[11px] group"
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.severity === 'error' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      ) : item.severity === 'warning' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <span className="text-slate-200 group-hover:text-white truncate">
                        {item.message}
                      </span>
                      <span className="text-slate-500 shrink-0 font-mono text-[10px]">
                        [{item.startLineNumber}, {item.startColumn}]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
