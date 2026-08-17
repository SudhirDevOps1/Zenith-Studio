import React, { useState } from 'react';
import {
  Play,
  Square,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Bug,
  Layers,
} from 'lucide-react';
import { useDebugStore } from '../../stores/useDebugStore';
import { useFileStore } from '../../stores/useFileStore';

export const DebugPanel: React.FC = () => {
  const {
    sessionState,
    breakpoints,
    callStack,
    variables,
    watchExpressions,
    consoleLogs,
    startDebugging,
    stopDebugging,
    toggleBreakpointEnabled,
    removeBreakpoint,
    clearAllBreakpoints,
    addWatch,
    removeWatch,
    clearConsoleLogs,
  } = useDebugStore();

  const { files, activeFileId: currentEditorFileId, openFileInTab } = useFileStore();

  const [newWatchInput, setNewWatchInput] = useState('');
  const [showAddWatch, setShowAddWatch] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    variables: true,
    watch: true,
    callStack: true,
    breakpoints: true,
    console: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeEditorFile = files.find((f) => f.id === currentEditorFileId);

  const handleStartDebug = () => {
    if (!activeEditorFile) return;
    startDebugging(activeEditorFile.id, activeEditorFile.path || activeEditorFile.name, activeEditorFile.content || '');
  };

  const handleAddWatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWatchInput.trim()) {
      addWatch(newWatchInput.trim());
      setNewWatchInput('');
      setShowAddWatch(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141524] text-slate-300 text-xs select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-[#10111d]">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-slate-200 text-xs tracking-wide uppercase">Run & Debug</span>
        </div>

        {/* Start / Stop Trigger */}
        {sessionState === 'inactive' ? (
          <button
            onClick={handleStartDebug}
            disabled={!activeEditorFile}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-md font-semibold text-[11px] transition shadow-sm"
            title="Start Debugging active file (F5)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Debug</span>
          </button>
        ) : (
          <button
            onClick={stopDebugging}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md font-semibold text-[11px] transition shadow-sm"
            title="Stop Debugging (Shift+F5)"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Main Accordion Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
        {/* 1. Variables Section */}
        <div>
          <button
            onClick={() => toggleSection('variables')}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-[#18192b] hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.variables ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="uppercase text-[10px] tracking-wider text-slate-400">Variables</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{variables.length}</span>
          </button>

          {expandedSections.variables && (
            <div className="p-2 space-y-1 bg-[#121320] font-mono text-[11px]">
              {variables.length === 0 ? (
                <div className="text-slate-500 italic text-[10px] py-1 px-1">No active scope variables</div>
              ) : (
                variables.map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5 px-1 hover:bg-slate-800/50 rounded">
                    <span className="text-cyan-300 truncate max-w-[40%]">{v.name}:</span>
                    <span className="text-amber-300 truncate max-w-[55%] text-right">{v.value}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 2. Watch Section */}
        <div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#18192b] hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition">
            <button
              onClick={() => toggleSection('watch')}
              className="flex items-center gap-1.5 flex-1 text-left"
            >
              {expandedSections.watch ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="uppercase text-[10px] tracking-wider text-slate-400">Watch</span>
            </button>
            <button
              onClick={() => setShowAddWatch(!showAddWatch)}
              className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
              title="Add Expression"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {expandedSections.watch && (
            <div className="p-2 space-y-1 bg-[#121320] font-mono text-[11px]">
              {showAddWatch && (
                <form onSubmit={handleAddWatchSubmit} className="mb-1">
                  <input
                    value={newWatchInput}
                    onChange={(e) => setNewWatchInput(e.target.value)}
                    placeholder="Expression to watch..."
                    autoFocus
                    className="w-full bg-slate-900 border border-cyan-500 rounded px-2 py-0.5 text-xs text-white outline-none"
                  />
                </form>
              )}

              {watchExpressions.length === 0 && !showAddWatch ? (
                <div className="text-slate-500 italic text-[10px] py-1 px-1">No watch expressions added</div>
              ) : (
                watchExpressions.map((expr, i) => (
                  <div key={i} className="group flex items-center justify-between py-0.5 px-1 hover:bg-slate-800/50 rounded">
                    <span className="text-slate-300">{expr}:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-400 text-[10px]">not available</span>
                      <button
                        onClick={() => removeWatch(expr)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3. Call Stack Section */}
        <div>
          <button
            onClick={() => toggleSection('callStack')}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-[#18192b] hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.callStack ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="uppercase text-[10px] tracking-wider text-slate-400">Call Stack</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{callStack.length}</span>
          </button>

          {expandedSections.callStack && (
            <div className="p-2 space-y-1 bg-[#121320] font-mono text-[11px]">
              {callStack.length === 0 ? (
                <div className="text-slate-500 italic text-[10px] py-1 px-1">Not paused</div>
              ) : (
                callStack.map((frame) => (
                  <div
                    key={frame.id}
                    className="flex items-center gap-1.5 py-1 px-1.5 bg-blue-950/40 border border-blue-500/30 rounded text-cyan-300"
                  >
                    <Layers className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate flex-1">{frame.name}</span>
                    <span className="text-[10px] text-slate-500">:{frame.lineNumber}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 4. Breakpoints Section */}
        <div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#18192b] hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition">
            <button
              onClick={() => toggleSection('breakpoints')}
              className="flex items-center gap-1.5 flex-1 text-left"
            >
              {expandedSections.breakpoints ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="uppercase text-[10px] tracking-wider text-slate-400">Breakpoints</span>
            </button>
            {breakpoints.length > 0 && (
              <button
                onClick={clearAllBreakpoints}
                className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition"
                title="Remove All Breakpoints"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {expandedSections.breakpoints && (
            <div className="p-2 space-y-1 bg-[#121320] font-mono text-[11px]">
              {breakpoints.length === 0 ? (
                <div className="text-slate-500 italic text-[10px] py-1 px-1">
                  Click on any editor line gutter to add a breakpoint
                </div>
              ) : (
                breakpoints.map((bp) => (
                  <div
                    key={bp.id}
                    className="group flex items-center justify-between py-0.5 px-1 hover:bg-slate-800/50 rounded cursor-pointer"
                    onClick={() => openFileInTab(bp.fileId)}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBreakpointEnabled(bp.id);
                        }}
                        className="text-rose-500 hover:text-rose-400"
                      >
                        {bp.enabled ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full border border-rose-500" />
                        )}
                      </button>
                      <span className="text-slate-300 truncate max-w-[120px]">{bp.filePath.split(/[\\/]/).pop()}</span>
                      <span className="text-cyan-400">:{bp.lineNumber}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBreakpoint(bp.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 5. Debug Console Output */}
        <div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#18192b] hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition">
            <button
              onClick={() => toggleSection('console')}
              className="flex items-center gap-1.5 flex-1 text-left"
            >
              {expandedSections.console ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="uppercase text-[10px] tracking-wider text-slate-400">Debug Console</span>
            </button>
            {consoleLogs.length > 0 && (
              <button
                onClick={clearConsoleLogs}
                className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                title="Clear Console"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {expandedSections.console && (
            <div className="p-2 space-y-1 bg-[#0b0c14] font-mono text-[10px] max-h-40 overflow-y-auto">
              {consoleLogs.length === 0 ? (
                <div className="text-slate-600 italic py-1 px-1">Debug output will appear here...</div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div key={i} className="text-slate-300 leading-tight border-b border-slate-800/40 pb-0.5">
                    {log}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
