import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  Plus,
  X,
  Split,
  Trash2,
  Maximize2,
  Minimize2,
  FolderOpen,
  Sliders,
  ChevronDown,
  Download,
  Code2,
} from 'lucide-react';
import {
  useTerminalStore,
  TerminalShellType,
} from '../../stores/useTerminalStore';
import { useFileStore } from '../../stores/useFileStore';
import { isElectron } from '../../utils/fileUtils';

interface TerminalTabsHeaderProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const TerminalTabsHeader: React.FC<TerminalTabsHeaderProps> = ({
  isMaximized,
  onToggleMaximize,
  onClose,
  onOpenSettings,
}) => {
  const {
    sessions,
    activeSessionId,
    splitSessionId,
    createSession,
    removeSession,
    setActiveSession,
    setSplitSession,
    clearSession,
  } = useTerminalStore();

  const { rootFolderPath, openSystemFolder } = useFileStore();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const isDesktop = isElectron();

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];


  const handleExportLog = () => {
    if (!activeSession) return;
    const content = activeSession.entries.map((e) => `[${e.timestamp}] ${e.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.name.toLowerCase().replace(/\s+/g, '-')}-log.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateType = (type: TerminalShellType) => {
    createSession(type);
    setShowNewMenu(false);
  };

  const toggleSplitView = () => {
    if (splitSessionId) {
      setSplitSession(null);
    } else {
      // Find or create second session to split
      const other = sessions.find((s) => s.id !== activeSessionId);
      if (other) {
        setSplitSession(other.id);
      } else {
        const newId = createSession('powershell', 'Terminal 2');
        setSplitSession(newId);
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-2.5 py-1 bg-[#10111d] border-b border-slate-800 text-slate-300 select-none text-xs shrink-0">
      {/* Left: Tabs List */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[65%]">
        {sessions.map((sess) => {
          const isActive = sess.id === activeSessionId || sess.id === splitSessionId;
          return (
            <div
              key={sess.id}
              onClick={() => setActiveSession(sess.id)}
              className={`group flex items-center gap-1.5 px-3 py-1 rounded-md cursor-pointer transition-all border text-xs font-mono shrink-0 ${
                isActive
                  ? 'bg-[#181a2b] text-cyan-300 font-semibold border-cyan-500/40 shadow-sm'
                  : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <TerminalIcon className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[120px]">{sess.name}</span>
              {sess.isRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSession(sess.id);
                  }}
                  className="p-0.5 hover:bg-slate-700/80 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-slate-500 hover:text-white"
                  title="Close Terminal"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add New Session Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-0.5 p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
            title="New Terminal Instance"
          >
            <Plus className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {showNewMenu && (
            <div
              onClick={() => setShowNewMenu(false)}
              className="fixed inset-0 z-40"
            />
          )}

          {showNewMenu && (
            <div className="absolute left-0 top-full mt-1 z-50 w-44 bg-[#141524] border border-slate-700 shadow-2xl rounded-xl py-1 text-xs text-slate-200 backdrop-blur-xl">
              <button
                onClick={() => handleCreateType('powershell')}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition"
              >
                <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
                PowerShell (Default)
              </button>
              {isDesktop && (
                <>
                  <button
                    onClick={() => handleCreateType('cmd')}
                    className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition"
                  >
                    <TerminalIcon className="w-3.5 h-3.5 text-amber-400" />
                    Command Prompt (CMD)
                  </button>
                  <button
                    onClick={() => handleCreateType('bash')}
                    className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition"
                  >
                    <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Git Bash / WSL
                  </button>
                </>
              )}
              <button
                onClick={() => handleCreateType('node')}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition"
              >
                <Code2 className="w-3.5 h-3.5 text-green-400" />
                Node.js REPL
              </button>
              <button
                onClick={() => handleCreateType('python')}
                className="w-full text-left px-3 py-1.5 hover:bg-cyan-600 hover:text-white flex items-center gap-2 transition"
              >
                <TerminalIcon className="w-3.5 h-3.5 text-yellow-400" />
                Python Shell
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Folder / Working Directory Badge */}
      <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400">
        <button
          onClick={openSystemFolder}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          title="Click to Switch Project Folder"
        >
          <FolderOpen className="w-3 h-3 text-cyan-400" />
          <span className="truncate max-w-[150px]">
            {activeSession?.cwd
              ? activeSession.cwd.split(/[\\/]/).pop() || activeSession.cwd
              : rootFolderPath
              ? rootFolderPath.split(/[\\/]/).pop() || rootFolderPath
              : 'workspace'}
          </span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 text-slate-400 shrink-0">
        {/* Split Terminal Button */}
        <button
          onClick={toggleSplitView}
          className={`p-1.5 rounded-md transition ${
            splitSessionId
              ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/40'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
          title={splitSessionId ? 'Close Split View' : 'Split Terminal Pane (Dual Session)'}
        >
          <Split className="w-3.5 h-3.5" />
        </button>

        {/* Clear buffer */}
        <button
          onClick={() => clearSession(activeSessionId)}
          className="p-1.5 hover:bg-slate-800 hover:text-white rounded-md transition"
          title="Clear Buffer (cls / clear)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Export Log */}
        <button
          onClick={handleExportLog}
          className="p-1.5 hover:bg-slate-800 hover:text-white rounded-md transition"
          title="Download Terminal Log"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded-md transition"
          title="Terminal Appearance & Settings"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Maximize */}
        <button
          onClick={onToggleMaximize}
          className="p-1.5 hover:bg-slate-800 hover:text-white rounded-md transition"
          title={isMaximized ? 'Restore Terminal' : 'Maximize Terminal'}
        >
          {isMaximized ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-red-900/60 hover:text-red-300 rounded-md transition"
          title="Close Terminal Panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
