import React, { useState } from 'react';
import {
  Sparkles,

  X,
  Send,
  Loader2,
  CheckCheck,
  Trash2,
  FileCode,
  Layers,
} from 'lucide-react';

import { useComposerStore } from '../../stores/useComposerStore';
import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { ComposerDiffViewer } from './ComposerDiffViewer';

export const AiComposerModal: React.FC = () => {
  const {
    isOpen,
    prompt,
    isGenerating,
    selectedFiles,
    patches,
    logs,
    setIsOpen,
    setPrompt,
    toggleSelectedFile,
    runComposer,
    acceptAllPatches,
    clearPatches,
  } = useComposerStore();

  const { files } = useFileStore();
  const { settings } = useSettingsStore();
  const [showFilePicker, setShowFilePicker] = useState(false);

  if (!isOpen) return null;

  const workspaceSourceFiles = files.filter((f) => f.type === 'file');
  const pendingCount = patches.filter((p) => p.status === 'pending').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      runComposer();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-[#141524] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#10111d] border-b border-slate-800 text-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Zenith Studio AI Composer

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  Multi-File Agent
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Model: <span className="text-cyan-400 font-mono">{(settings.aiProvider || 'gemini').toUpperCase()} ({settings.aiModel || 'gemini-1.5-flash'})</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Files Chips Bar */}
        <div className="px-4 py-2 bg-[#18192b] border-b border-slate-800/80 flex items-center justify-between text-xs gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Context:</span>
            {selectedFiles.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic">Entire Workspace (Auto-selected)</span>
            ) : (
              selectedFiles.map((sf) => (
                <div
                  key={sf}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono"
                >
                  <FileCode className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[120px]">{sf.split(/[\\/]/).pop()}</span>
                  <button
                    onClick={() => toggleSelectedFile(sf)}
                    className="hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setShowFilePicker(!showFilePicker)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] transition shrink-0"
          >
            {showFilePicker ? 'Close Files' : '+ Pick Files'}
          </button>
        </div>

        {/* File Picker dropdown if active */}
        {showFilePicker && (
          <div className="p-3 bg-[#121320] border-b border-slate-800 max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-mono">
            {workspaceSourceFiles.map((f) => {
              const isSelected = selectedFiles.includes(f.path || f.name);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleSelectedFile(f.path || f.name)}
                  className={`text-left px-2 py-1 rounded truncate border transition ${
                    isSelected
                      ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Body: Generated Patches & Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {patches.length === 0 && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-cyan-400/50 animate-pulse" />
              <p className="text-xs text-slate-300 font-semibold">What would you like to build or refactor?</p>
              <p className="text-[11px] text-slate-500 max-w-md">
                Describe a feature or fix. The AI will plan, generate, and patch multiple files across your workspace simultaneously.
              </p>
            </div>
          )}

          {/* Real-time execution logs */}
          {logs.length > 0 && (
            <div className="p-2.5 bg-[#0b0c14] border border-slate-800/80 rounded-xl font-mono text-[10px] space-y-0.5 max-h-28 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="text-cyan-300/80 leading-tight">
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Patches List */}
          {patches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Proposed Multi-File Changes ({patches.length})
                </span>

                {pendingCount > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={acceptAllPatches}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-emerald-950"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Accept All Files ({pendingCount})</span>
                    </button>
                    <button
                      onClick={clearPatches}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                      title="Clear"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {patches.map((p) => (
                <ComposerDiffViewer key={p.filePath} patch={p} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Prompt Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-[#10111d] border-t border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="E.g. 'Refactor the entire auth flow and update imports across all components'..."
              disabled={isGenerating}
              rows={2}
              className="w-full bg-[#18192b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Generate</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
