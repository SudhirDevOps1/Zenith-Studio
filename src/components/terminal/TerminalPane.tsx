import React, { useState, useRef, useEffect } from 'react';
import {
  Loader2,
  Copy,
  Check,
  Search,
  X,
} from 'lucide-react';

import {
  useTerminalStore,
  TerminalSession,
  TERMINAL_THEMES,
} from '../../stores/useTerminalStore';
import { useFileStore } from '../../stores/useFileStore';
import { isElectron } from '../../utils/fileUtils';

interface TerminalPaneProps {
  session: TerminalSession;
  isFocused?: boolean;
  onFocus?: () => void;
}

// Strip raw ANSI escape color codes
const cleanAnsi = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[\u001b\x1b]\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\[\d+;?\d*m/g, '')
    .replace(/\[\d+m/g, '');
};

export const TerminalPane: React.FC<TerminalPaneProps> = ({
  session,
  isFocused = false,
  onFocus,
}) => {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    settings,
    addEntry,
    clearSession,
    addHistory,
    setHistoryIdx,
    setSessionRunning,
    setSessionCwd,
  } = useTerminalStore();

  const {
    files,
    rootFolderPath,
    setRootFolderPath,
    createFile,
    deleteFileItem,
    openFileInTab,
  } = useFileStore();


  const isDesktop = isElectron();
  const theme = TERMINAL_THEMES[settings.theme] || TERMINAL_THEMES.vscode;

  // Auto-scroll on new entries
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [session.entries, session.isRunning]);

  // Focus input when clicked or focused
  const handleContainerClick = () => {
    inputRef.current?.focus();
    onFocus?.();
  };

  const handleCopyBuffer = () => {
    const text = session.entries.map((e) => e.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const executeCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    addEntry(session.id, 'input', `${settings.promptGlyph} ${trimmed}`);
    addHistory(session.id, trimmed);

    if (trimmed === 'clear' || trimmed === 'cls') {
      clearSession(session.id);
      return;
    }

    // 1. Desktop Mode: Run REAL Native Shell Command
    if (isDesktop && (window as any).electronAPI?.execTerminalCommand) {
      setSessionRunning(session.id, true);
      try {
        const activeDir = session.cwd || rootFolderPath || undefined;
        const result = await (window as any).electronAPI.execTerminalCommand({
          command: trimmed,
          cwd: activeDir,
        });

        if (result.cwd) {
          setSessionCwd(session.id, result.cwd);
          setRootFolderPath(result.cwd);
        }

        if (result.stdout) {
          addEntry(session.id, 'output', cleanAnsi(result.stdout));
        }
        if (result.stderr) {
          addEntry(session.id, result.code === 0 ? 'output' : 'error', cleanAnsi(result.stderr));
        }
        if (result.error && !result.stderr) {
          addEntry(session.id, 'error', result.error);
        }
      } catch (err: any) {
        addEntry(session.id, 'error', err.message || 'Command execution failed.');
      } finally {
        setSessionRunning(session.id, false);
      }
      return;
    }

    // 2. Web Browser Sandbox Mode
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case 'help':
        addEntry(
          session.id,
          'info',
          `Available Web Commands:\n  ls [path]         - List files and directories\n  cat <filename>    - Print file content\n  touch <filename>  - Create a new blank file\n  rm <filename>     - Delete a file\n  open <filename>   - Open file in Monaco Editor\n  clear / cls       - Clear terminal output\n  pwd               - Print working directory\n  stats             - Display workspace statistics\n  eval <code>       - Execute JavaScript code\n  echo <text>       - Print text\n  date              - Show current date & time\n  version           - Show Zenith Studio version\n\n💡 Tip: Run in Zenith Studio Desktop (.exe) for live PowerShell / Bash execution!`
        );

        break;

      case 'ls':
      case 'dir': {
        const targetFiles = files.filter((f) => !f.parentId);
        if (targetFiles.length === 0) {
          addEntry(session.id, 'output', '(empty workspace)');
        } else {
          const list = targetFiles
            .map((f) => `${f.type === 'folder' ? '📁' : '📄'} ${f.name}`)
            .join('    ');
          addEntry(session.id, 'output', list);
        }
        break;
      }

      case 'cat': {
        if (!args) {
          addEntry(session.id, 'error', 'Usage: cat <filename>');
          break;
        }
        const file = files.find((f) => f.name.toLowerCase() === args.toLowerCase() && f.type === 'file');
        if (file) {
          addEntry(session.id, 'output', file.content || '(empty file)');
        } else {
          addEntry(session.id, 'error', `File not found: ${args}`);
        }
        break;
      }

      case 'touch': {
        if (!args) {
          addEntry(session.id, 'error', 'Usage: touch <filename>');
          break;
        }
        createFile(args, 'file');
        addEntry(session.id, 'output', `Created file: ${args}`);
        break;
      }

      case 'rm': {
        if (!args) {
          addEntry(session.id, 'error', 'Usage: rm <filename>');
          break;
        }
        const target = files.find((f) => f.name.toLowerCase() === args.toLowerCase());
        if (target) {
          deleteFileItem(target.id);
          addEntry(session.id, 'output', `Removed: ${args}`);
        } else {
          addEntry(session.id, 'error', `File not found: ${args}`);
        }
        break;
      }

      case 'open': {
        if (!args) {
          addEntry(session.id, 'error', 'Usage: open <filename>');
          break;
        }
        const toOpen = files.find((f) => f.name.toLowerCase() === args.toLowerCase() && f.type === 'file');
        if (toOpen) {
          openFileInTab(toOpen.id);
          addEntry(session.id, 'output', `Opened ${args} in editor`);
        } else {
          addEntry(session.id, 'error', `File not found: ${args}`);
        }
        break;
      }

      case 'pwd':
        addEntry(session.id, 'output', session.cwd || rootFolderPath || '/workspace');
        break;

      case 'stats': {
        const fileCount = files.filter((f) => f.type === 'file').length;
        const folderCount = files.filter((f) => f.type === 'folder').length;
        const totalChars = files.reduce((acc, f) => acc + (f.content?.length || 0), 0);
        addEntry(
          session.id,
          'info',
          `Workspace Stats:\n  Files: ${fileCount}\n  Folders: ${folderCount}\n  Total Size: ~${(totalChars / 1024).toFixed(1)} KB`
        );
        break;
      }

      case 'eval': {
        if (!args) {
          addEntry(session.id, 'error', 'Usage: eval <javascript code>');
          break;
        }
        try {
          const fn = new Function(`return (${args})`);
          const res = String(fn());
          addEntry(session.id, 'output', `=> ${res}`);
        } catch (err: any) {
          addEntry(session.id, 'error', `Eval Error: ${err.message}`);
        }
        break;
      }


      case 'echo':
        addEntry(session.id, 'output', args);
        break;

      case 'date':
        addEntry(session.id, 'output', new Date().toString());
        break;

      case 'version':
        addEntry(session.id, 'output', 'Zenith Studio v1.0.3 (React 19 + Monaco + Vite 7 + Electron Shell)');
        break;


      default:
        addEntry(
          session.id,
          'error',
          `Command not recognized in web mode: "${command}".\nType "help" for web commands, or use the Desktop App for native PowerShell.`
        );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (session.history.length > 0) {
        const nextIdx = Math.min(session.historyIdx + 1, session.history.length - 1);
        setHistoryIdx(session.id, nextIdx);
        setInput(session.history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (session.historyIdx > 0) {
        const prevIdx = session.historyIdx - 1;
        setHistoryIdx(session.id, prevIdx);
        setInput(session.history[prevIdx] || '');
      } else if (session.historyIdx === 0) {
        setHistoryIdx(session.id, -1);
        setInput('');
      }
    } else if (e.key === 'c' && e.ctrlKey && session.isRunning) {
      addEntry(session.id, 'error', '^C (Interrupted)');
      setSessionRunning(session.id, false);
    } else if (e.key === 'f' && e.ctrlKey) {
      e.preventDefault();
      setShowSearch((prev) => !prev);
    }
  };

  const filteredEntries = searchQuery.trim()
    ? session.entries.filter((entry) =>
        entry.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : session.entries;

  return (
    <div
      onClick={handleContainerClick}
      className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden select-text border-r last:border-r-0 transition-colors ${
        isFocused ? 'ring-1 ring-cyan-500/30' : ''
      }`}
      style={{
        backgroundColor: theme.background,
        color: theme.foreground,
        borderColor: theme.borderColor,
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
      }}
    >
      {/* Mini search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141522] border-b border-slate-800 text-xs shrink-0">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terminal output..."
            className="flex-1 bg-transparent text-white outline-none font-mono text-xs placeholder-slate-500"
            autoFocus
          />
          <button
            onClick={() => {
              setSearchQuery('');
              setShowSearch(false);
            }}
            className="p-0.5 hover:bg-slate-700 rounded text-slate-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Output Stream */}
      <div
        ref={outputRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 font-mono select-text"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className={`whitespace-pre-wrap break-all ${
              entry.type === 'input'
                ? 'font-bold'
                : entry.type === 'error'
                ? 'text-red-400'
                : entry.type === 'info'
                ? 'text-cyan-400 opacity-90'
                : ''
            }`}
            style={{
              color:
                entry.type === 'input'
                  ? theme.inputColor
                  : entry.type === 'error'
                  ? theme.errorColor
                  : entry.type === 'info'
                  ? theme.infoColor
                  : theme.outputColor,
            }}
          >
            {settings.showTimestamps && (
              <span className="text-[10px] text-slate-600 mr-2 select-none">
                [{entry.timestamp}]
              </span>
            )}
            {entry.text}
          </div>
        ))}

        {session.isRunning && (
          <div className="flex items-center gap-2 text-cyan-400 italic text-xs py-1">
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Executing process...</span>
          </div>
        )}
      </div>

      {/* Input Line */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-t shrink-0"
        style={{
          borderColor: theme.borderColor,
          backgroundColor: theme.background,
        }}
      >
        <span
          className="font-bold font-mono select-none"
          style={{ color: theme.promptColor }}
        >
          {settings.promptGlyph}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={session.isRunning}
          placeholder={
            session.isRunning
              ? 'Process is running... (Press Ctrl+C to abort)'
              : `Type command (help, ls, npm, git)...`
          }
          className="flex-1 bg-transparent outline-none font-mono placeholder-slate-600 disabled:opacity-50"
          style={{ color: theme.inputColor }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyBuffer();
          }}
          className="p-1 hover:bg-slate-800/80 rounded text-slate-500 hover:text-slate-300 transition shrink-0"
          title="Copy buffer output"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
