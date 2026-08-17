import React, { useState, useEffect } from 'react';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { TerminalTabsHeader } from '../terminal/TerminalTabsHeader';
import { TerminalPane } from '../terminal/TerminalPane';
import { TerminalQuickBar } from '../terminal/TerminalQuickBar';
import { TerminalSettingsModal } from '../terminal/TerminalSettingsModal';
import { useFileStore } from '../../stores/useFileStore';
import { isElectron } from '../../utils/fileUtils';

export const IntegratedTerminal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [height, setHeight] = useState(260);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFocusedPane, setActiveFocusedPane] = useState<'primary' | 'split'>('primary');

  const {
    sessions,
    activeSessionId,
    splitSessionId,
    createSession,
    addEntry,
    setSessionCwd,
  } = useTerminalStore();

  const { rootFolderPath } = useFileStore();
  const isDesktop = isElectron();

  // Initialize first session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createSession('powershell', 'PowerShell', rootFolderPath || '');
    }
  }, [sessions.length]);


  // Sync active project root folder into session cwd
  useEffect(() => {
    if (rootFolderPath && activeSessionId) {
      setSessionCwd(activeSessionId, rootFolderPath);
    }
  }, [rootFolderPath, activeSessionId]);

  // Initial welcome message on startup
  useEffect(() => {
    const session = sessions.find((s) => s.id === activeSessionId) || sessions[0];
    if (session && session.entries.length === 0) {
      if (isDesktop) {
        addEntry(session.id, 'info', '💻 CodeStudio Advanced Multi-Session Terminal (PowerShell)');
        if (rootFolderPath) {
          addEntry(session.id, 'info', `📂 Active Project Folder: ${rootFolderPath}`);
        }
        addEntry(session.id, 'info', 'Ready: npm, git, node, python, gcc, dir, cd, cargo, echo, etc.');
      } else {
        addEntry(session.id, 'info', '🚀 CodeStudio Integrated Terminal Ready (Web Sandbox)');
        addEntry(session.id, 'info', 'Type "help" for available commands (ls, cat, touch, rm, open, stats, eval).');
      }
      addEntry(session.id, 'output', '');
    }
  }, [activeSessionId, isDesktop]);

  // Drag resizer handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 140 && newHeight <= window.innerHeight * 0.85) {
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const splitSession = splitSessionId ? sessions.find((s) => s.id === splitSessionId) : null;

  const handleQuickRun = (command: string) => {
    const targetSessionId =
      activeFocusedPane === 'split' && splitSession ? splitSession.id : activeSession?.id;

    if (!targetSessionId) return;

    // Trigger command in target session by dispatching custom keyboard entry
    const trimmed = command.trim();
    if (!trimmed) return;

    addEntry(targetSessionId, 'input', `❯ ${trimmed}`);
    if (trimmed === 'clear' || trimmed === 'cls') {
      useTerminalStore.getState().clearSession(targetSessionId);
      return;
    }

    // Execute in Electron or Web mode
    if (isDesktop && (window as any).electronAPI?.execTerminalCommand) {
      useTerminalStore.getState().setSessionRunning(targetSessionId, true);
      const activeDir = rootFolderPath || undefined;
      (window as any).electronAPI
        .execTerminalCommand({ command: trimmed, cwd: activeDir })
        .then((result: any) => {
          if (result.stdout) addEntry(targetSessionId, 'output', result.stdout);
          if (result.stderr)
            addEntry(targetSessionId, result.code === 0 ? 'output' : 'error', result.stderr);
        })
        .catch((err: any) => {
          addEntry(targetSessionId, 'error', err.message || 'Execution error');
        })
        .finally(() => {
          useTerminalStore.getState().setSessionRunning(targetSessionId, false);
        });
    } else {
      addEntry(targetSessionId, 'info', `Quick executed: ${trimmed}`);
    }
  };

  return (
    <div
      style={{ height: isMaximized ? '85vh' : `${height}px` }}
      className="border-t border-slate-800 bg-[#0d0e17] flex flex-col z-30 shadow-2xl relative select-none"
    >
      {/* Top Resizer Bar */}
      {!isMaximized && (
        <div
          onMouseDown={() => setIsDragging(true)}
          className="h-1.5 w-full bg-slate-800/60 hover:bg-cyan-500 cursor-row-resize transition-colors flex items-center justify-center group"
          title="Drag to resize terminal panel"
        >
          <div className="w-12 h-0.5 rounded-full bg-slate-600 group-hover:bg-white transition" />
        </div>
      )}

      {/* Terminal Tabs & Header */}
      <TerminalTabsHeader
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        onClose={onClose}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Terminal Workspace View (Single or Dual Split-Pane) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {activeSession && (
          <TerminalPane
            session={activeSession}
            isFocused={activeFocusedPane === 'primary'}
            onFocus={() => setActiveFocusedPane('primary')}
          />
        )}

        {splitSession && (
          <TerminalPane
            session={splitSession}
            isFocused={activeFocusedPane === 'split'}
            onFocus={() => setActiveFocusedPane('split')}
          />
        )}
      </div>

      {/* Quick Task Runner Bar */}
      <TerminalQuickBar
        onRunCommand={handleQuickRun}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Customization Settings Modal */}
      <TerminalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
