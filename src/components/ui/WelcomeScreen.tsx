import React from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useDialogStore } from '../../stores/useDialogStore';
import {
  FileText,
  FilePlus,
  FolderOpen,
  Command,
  Folder,
  Sparkles,
} from 'lucide-react';
import { ZenithLogo } from './ZenithLogo';

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

export const WelcomeScreen: React.FC = () => {
  const { createFile, files, openFileInTab, openSystemFolder, openSystemFile } = useFileStore();
  const { workspaces, openWorkspace, setSwitcherOpen } = useWorkspaceStore();
  const { openDialog } = useDialogStore();

  const handleCreateFile = async () => {
    const result = await openDialog({
      type: 'file',
      title: 'Create New File',
      message: 'Enter the filename with extension (e.g. index.ts, main.py)',
      placeholder: 'main.ts',
      confirmText: 'Create',
      cancelText: 'Cancel',
    });

    if (result) {
      createFile(result, null);
    }
  };

  const recentOpenFiles = files
    .filter((f) => f.type === 'file')
    .slice(-5)
    .reverse();

  const recentWorkspaces = workspaces.slice(0, 5);

  const shortcuts = [
    { keys: 'Ctrl+Shift+P', label: 'Command Palette' },
    { keys: 'Ctrl+R', label: 'Switch Workspace / Recent' },
    { keys: 'Ctrl+Shift+I', label: 'AI Composer' },
    { keys: 'Ctrl+Shift+O', label: 'Open Folder from System' },
    { keys: 'Ctrl+O', label: 'Open File' },
    { keys: 'Ctrl+S', label: 'Save Active File' },
    { keys: 'Ctrl+`', label: 'Toggle Terminal' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto bg-gradient-to-br from-[#0c0d16] via-[#121320] to-[#0c0d16] p-6 text-slate-200">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in duration-200">
        {/* Header Branding */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800/80">
          <ZenithLogo size={56} className="rounded-xl shadow-xl shadow-cyan-500/20 border border-cyan-500/30 p-1 bg-slate-900 shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
                Zenith Studio
              </h1>
              <span className="px-2 py-0.5 bg-blue-950/80 text-cyan-300 rounded-full border border-cyan-500/30 text-[10px] font-mono font-bold">
                v1.0.3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-performance, lightweight development environment with native compilers and AI capabilities.
            </p>
          </div>
        </div>

        {/* 2-Column Main Start Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Start Actions */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Start
            </h2>

            <div className="space-y-2">
              <button
                onClick={handleCreateFile}
                className="w-full flex items-center gap-3 p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-blue-500/40 rounded-xl transition text-left group"
              >
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">New File...</div>
                  <div className="text-[11px] text-slate-500">Create an empty file in workspace</div>
                </div>
              </button>

              <button
                onClick={openSystemFile}
                className="w-full flex items-center gap-3 p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl transition text-left group"
              >
                <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">Open File...</div>
                  <div className="text-[11px] text-slate-500">Open a file from your system</div>
                </div>
              </button>

              <button
                onClick={openSystemFolder}
                className="w-full flex items-center gap-3 p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition text-left group"
              >
                <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">Open Folder...</div>
                  <div className="text-[11px] text-slate-500">Open an entire project folder</div>
                </div>
              </button>

              <button
                onClick={() => setSwitcherOpen(true)}
                className="w-full flex items-center justify-between p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-purple-500/40 rounded-xl transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition">Switch Workspace / Recent</div>
                    <div className="text-[11px] text-slate-500">Browse and manage recent projects</div>
                  </div>
                </div>
                <kbd className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Ctrl+R</kbd>
              </button>
            </div>
          </div>

          {/* Right Column: Recent Workspaces & Files */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-blue-400" /> Recent Workspaces
              </h2>
              <button
                onClick={() => setSwitcherOpen(true)}
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-1.5">
              {recentWorkspaces.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/60">
                  No recent workspaces yet. Open a folder to begin.
                </div>
              ) : (
                recentWorkspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => openWorkspace(ws)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 rounded-xl text-left transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Folder className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition">
                          {ws.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {ws.path}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono ml-2 shrink-0">
                      {formatTimeAgo(ws.lastActive)}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Recent Open Files (if any exist) */}
            {recentOpenFiles.length > 0 && (
              <div className="pt-2 space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Recent Files in Project
                </h3>
                <div className="space-y-1">
                  {recentOpenFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => openFileInTab(file.id)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/30 hover:bg-slate-800/60 rounded-lg text-xs text-slate-300 hover:text-white transition text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11.5px] truncate flex-1">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shortcuts Footer Bar */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5 text-purple-400" /> Keyboard Shortcuts
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {shortcuts.slice(0, 4).map((s, idx) => (
              <div key={idx} className="p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{s.label}</span>
                <kbd className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
