import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  Search,
  X,
  Star,
  ChevronRight,
  Trash2,
  Check,
} from 'lucide-react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export const WorkspaceSwitcherModal: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    isSwitcherOpen,
    setSwitcherOpen,
    openWorkspace,
    removeWorkspace,
    togglePinWorkspace,
    promptOpenNewWorkspace,
  } = useWorkspaceStore();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSwitcherOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSwitcherOpen]);

  if (!isSwitcherOpen) return null;

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.lastTask.toLowerCase().includes(search.toLowerCase()) ||
      w.path.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        openWorkspace(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSwitcherOpen(false);
    }
  };

  return (
    <div
      onClick={() => setSwitcherOpen(false)}
      className="fixed inset-0 z-[110] flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg bg-[#141524] border border-slate-700/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#10111d] border-b border-slate-800 text-slate-200">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search workspaces & projects (or press Enter to switch)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            onClick={() => setSwitcherOpen(false)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action: Open System Folder as Workspace */}
        <div className="px-3 py-2 bg-[#18192b] border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspaces ({filtered.length})
          </span>
          <button
            onClick={() => {
              promptOpenNewWorkspace();
              setSwitcherOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Open Folder as Workspace</span>
          </button>
        </div>

        {/* Workspace List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2 text-xs">
              <Folder className="w-8 h-8 mx-auto text-slate-600" />
              <p>No matching workspaces found.</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isActive = activeWorkspaceId === item.id;
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => openWorkspace(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition border ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-white'
                      : isSelected
                      ? 'bg-slate-800/80 border-slate-700 text-white'
                      : 'bg-slate-900/30 border-transparent text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/90 text-cyan-400 group-hover:text-cyan-300 transition shrink-0">
                      <Folder className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white truncate">
                          {item.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                        {item.pinned && (
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 truncate">
                        {item.lastTask}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-sm">
                        {item.path}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500">
                      {formatTimeAgo(item.lastActive)}
                    </span>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinWorkspace(item.id);
                        }}
                        className="p-1 hover:bg-slate-700 text-slate-400 hover:text-amber-400 rounded transition"
                        title={item.pinned ? 'Unpin' : 'Pin Workspace'}
                      >
                        <Star className={`w-3 h-3 ${item.pinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWorkspace(item.id);
                        }}
                        className="p-1 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded transition"
                        title="Remove from Recent"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-[#10111d] border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <span>Tip: Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Ctrl+R</kbd> anytime to open</span>
          <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">↑↓</kbd> Navigate <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Enter</kbd> Select</span>
        </div>
      </div>
    </div>
  );
};
