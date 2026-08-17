import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Trash2, Maximize2, Minimize2, Loader2, FolderOpen } from 'lucide-react';
import { useFileStore } from '../../stores/useFileStore';
import { isElectron } from '../../utils/fileUtils';

interface TerminalEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  text: string;
  timestamp: string;
}

// Strip raw ANSI escape color codes from terminal output
const cleanAnsi = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[\u001b\x1b]\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\[\d+;?\d*m/g, '')
    .replace(/\[\d+m/g, '');
};

export const IntegratedTerminal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [height, setHeight] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    rootFolderPath,
    setRootFolderPath,
    createFile,
    deleteFileItem,
    openFileInTab,
    openSystemFolder,
  } = useFileStore();

  const savedFolder =
    typeof window !== 'undefined'
      ? localStorage.getItem('codestudio_root_folder_path') || ''
      : '';
  const initialPath = rootFolderPath || savedFolder || '';
  const [cwd, setCwd] = useState<string>(initialPath);
  const isDesktop = isElectron();

  // Auto-sync cwd when active project folder changes
  useEffect(() => {
    if (rootFolderPath && rootFolderPath !== cwd) {
      setCwd(rootFolderPath);
    }
  }, [rootFolderPath]);

  useEffect(() => {
    const activePath = rootFolderPath || savedFolder;
    if (isDesktop) {
      addEntry('info', '💻 CodeStudio Native Desktop Shell (PowerShell)');
      if (activePath) {
        addEntry('info', `📂 Active Project Folder: ${activePath}`);
      } else {
        addEntry(
          'info',
          '💡 Tip: Open your project folder (File > Open Folder) or click the folder badge above to navigate.'
        );
      }
      addEntry('info', 'Ready: npm, git, node, python, dir, cd, cargo, echo, etc.');
    } else {
      addEntry('info', '🚀 CodeStudio Integrated Terminal Ready (Web Sandbox)');
      addEntry('info', 'Type "help" for available commands (ls, cat, touch, rm, open, stats, eval, echo).');
    }
    addEntry('output', '');
  }, [isDesktop, rootFolderPath]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries, isRunning]);

  const addEntry = (type: TerminalEntry['type'], text: string) => {
    const cleanedText = cleanAnsi(text);
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type,
        text: cleanedText,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    addEntry('input', `❯ ${trimmed}`);
    setHistory((prev) => [trimmed, ...prev.filter((h) => h !== trimmed)]);
    setHistoryIdx(-1);

    if (trimmed === 'clear' || trimmed === 'cls') {
      setEntries([]);
      return;
    }

    // 1. Desktop Mode: Run REAL Native Shell Command
    if (isDesktop && (window as any).electronAPI?.execTerminalCommand) {
      setIsRunning(true);
      try {
        const activeDir = cwd || rootFolderPath || savedFolder || undefined;
        const result = await (window as any).electronAPI.execTerminalCommand({
          command: trimmed,
          cwd: activeDir,
        });

        if (result.cwd) {
          setCwd(result.cwd);
          setRootFolderPath(result.cwd);
        }

        if (result.stdout) {
          addEntry('output', result.stdout);
        }
        if (result.stderr) {
          addEntry(result.code === 0 ? 'output' : 'error', result.stderr);
        }
        if (result.error && !result.stderr) {
          addEntry('error', result.error);
        }
      } catch (err: any) {
        addEntry('error', err.message || 'Command execution failed.');
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // 2. Web Browser Sandbox Mode
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case 'help':
        addEntry('output', 'Available Web Commands:');
        addEntry('output', '  ls / dir          - List files and folders in workspace');
        addEntry('output', '  cat <file>        - View contents of a workspace file');
        addEntry('output', '  touch <file>      - Create a new empty file in workspace');
        addEntry('output', '  rm <file>         - Delete a file from workspace');
        addEntry('output', '  open <file>       - Open a file in the editor tab');
        addEntry('output', '  stats             - Display workspace statistics');
        addEntry('output', '  eval <expression> - Execute JavaScript expression');
        addEntry('output', '  echo <text>       - Print text to terminal');
        addEntry('output', '  clear / cls       - Clear terminal screen');
        addEntry('output', '  pwd               - Show workspace path');
        addEntry('output', '  date              - Show current date & time');
        addEntry('output', '  version           - Show CodeStudio version');
        break;

      case 'ls':
      case 'dir':
        if (files.length === 0) {
          addEntry('output', '(empty workspace)');
        } else {
          const list = files
            .map((f) => {
              if (f.type === 'folder') return `📁 ${f.path}/`;
              const size =
                (f.content?.length || 0) > 1024
                  ? `${((f.content?.length || 0) / 1024).toFixed(1)} KB`
                  : `${f.content?.length || 0} B`;
              return `📄 ${f.path.padEnd(28, ' ')} (${size})`;
            })
            .join('\n');
          addEntry('output', list);
        }
        break;

      case 'cat':
        if (!args) {
          addEntry('error', 'Usage: cat <filename>');
          break;
        }
        const fileToRead = files.find(
          (f) =>
            f.name.toLowerCase() === args.toLowerCase() ||
            f.path.toLowerCase() === args.toLowerCase()
        );
        if (!fileToRead) {
          addEntry('error', `File not found: ${args}`);
        } else if (fileToRead.type === 'folder') {
          addEntry('error', `${args} is a directory`);
        } else {
          addEntry('output', fileToRead.content || '(empty file)');
        }
        break;

      case 'touch':
        if (!args) {
          addEntry('error', 'Usage: touch <filename>');
          break;
        }
        createFile(args, null, '');
        addEntry('info', `Created file: ${args}`);
        break;

      case 'rm':
        if (!args) {
          addEntry('error', 'Usage: rm <filename>');
          break;
        }
        const fileToDelete = files.find(
          (f) =>
            f.name.toLowerCase() === args.toLowerCase() ||
            f.path.toLowerCase() === args.toLowerCase()
        );
        if (!fileToDelete) {
          addEntry('error', `File not found: ${args}`);
        } else {
          deleteFileItem(fileToDelete.id);
          addEntry('info', `Removed: ${fileToDelete.name}`);
        }
        break;

      case 'open':
        if (!args) {
          addEntry('error', 'Usage: open <filename>');
          break;
        }
        const targetFile = files.find(
          (f) =>
            f.name.toLowerCase() === args.toLowerCase() ||
            f.path.toLowerCase() === args.toLowerCase()
        );
        if (!targetFile) {
          addEntry('error', `File not found: ${args}`);
        } else if (targetFile.type !== 'file') {
          addEntry('error', `${args} is a folder`);
        } else {
          openFileInTab(targetFile.id);
          addEntry('info', `Opened ${targetFile.name} in editor tab.`);
        }
        break;

      case 'eval':
        if (!args) {
          addEntry('error', 'Usage: eval <javascript expression>');
          break;
        }
        try {
          const result = new Function(`return (${args})`)();
          addEntry('output', String(result));
        } catch (err: any) {
          addEntry('error', `Evaluation Error: ${err.message}`);
        }
        break;

      case 'stats':
        const fileCount = files.filter((f) => f.type === 'file').length;
        const folderCount = files.filter((f) => f.type === 'folder').length;
        const totalChars = files.reduce((acc, f) => acc + (f.content?.length || 0), 0);
        addEntry('output', `Workspace Statistics:`);
        addEntry('output', `  Files:   ${fileCount}`);
        addEntry('output', `  Folders: ${folderCount}`);
        addEntry('output', `  Characters: ${totalChars}`);
        break;

      case 'echo':
        addEntry('output', args);
        break;

      case 'pwd':
        addEntry('output', cwd || '/workspace');
        break;

      case 'date':
        addEntry('output', new Date().toString());
        break;

      case 'version':
        addEntry('output', 'CodeStudio v1.0.3 (React 19 + Monaco + Vite 7 + Electron Shell)');
        break;


      default:
        if (['npm', 'npx', 'yarn', 'pnpm', 'node', 'git', 'python', 'cargo', 'pip'].includes(command)) {
          addEntry(
            'error',
            `⚠️ Native command "${command}" requires system binaries.\n💡 Run CodeStudio via the Windows Desktop App (.exe) for full native shell execution.\nType "help" for browser commands.`
          );
        } else {
          addEntry('error', `Command not found: "${command}". Type "help" for available commands.`);
        }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx] || '');
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Drag resize on top border
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 80 && newHeight < window.innerHeight * 0.7) {
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

  const activeFolderName = cwd
    ? cwd.replace(/\\/g, '/').split('/').filter(Boolean).pop() || cwd
    : 'Workspace';

  return (
    <div
      style={{ height: isMaximized ? '70vh' : `${height}px` }}
      className="flex flex-col bg-[#0d0e15] border-t border-slate-800 text-slate-300 font-mono text-xs select-text relative transition-all duration-75 shadow-inner"
    >
      {/* Top Resize Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="h-1 bg-transparent hover:bg-cyan-500/50 cursor-ns-resize absolute top-0 left-0 right-0 z-10 transition"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#14141f] border-b border-slate-800 select-none text-[11px]">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">TERMINAL</span>
          {isDesktop ? (
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PowerShell
            </span>
          ) : (
            <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[9px] font-mono border border-blue-500/30">
              Web Sandbox
            </span>
          )}

          {/* Clickable Folder Badge */}
          <button
            onClick={() => isDesktop && openSystemFolder()}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded text-[10px] text-amber-300 font-mono transition group cursor-pointer"
            title={`Active Directory: ${cwd || 'Default (Home)'}\nClick to Open / Change Project Folder`}
          >
            <FolderOpen className="w-3 h-3 text-amber-400 group-hover:scale-110 transition" />
            <span className="font-semibold truncate max-w-[160px]">{activeFolderName}</span>
            {isDesktop && <span className="text-[9px] text-slate-500 group-hover:text-slate-300">▾</span>}
          </button>

          {isRunning && (
            <span className="flex items-center gap-1 text-cyan-400 text-[10px]">
              <Loader2 className="w-3 h-3 animate-spin" /> Running...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setEntries([])}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            title="Close Terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output Console Log */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#0a0a10]"
        style={{ scrollbarWidth: 'thin' }}
      >
        {entries.map((e) => (
          <div
            key={e.id}
            className={`leading-relaxed whitespace-pre-wrap ${
              e.type === 'input'
                ? 'text-cyan-400 font-semibold pt-1 border-t border-slate-900/60 first:border-0'
                : e.type === 'error'
                ? 'text-rose-400'
                : e.type === 'info'
                ? 'text-blue-400'
                : 'text-slate-200'
            }`}
          >
            {e.type === 'input' ? (
              <span className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-600 font-sans">[{e.timestamp}]</span>
                <span>{e.text}</span>
              </span>
            ) : (
              <span>{e.text}</span>
            )}
          </div>
        ))}
      </div>

      {/* Command Input Prompt */}
      <div className="flex items-center gap-2 p-2 bg-[#12131c] border-t border-slate-800/80">
        <span className="text-cyan-400 font-bold pl-1 select-none whitespace-nowrap text-[11px] flex items-center gap-1">
          {isDesktop ? (
            <>
              <span className="text-emerald-400 font-bold">PS</span>
              <span className="text-slate-400">{activeFolderName}</span>
              <span className="text-cyan-400">&gt;</span>
            </>
          ) : (
            '❯'
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          placeholder={
            isDesktop
              ? 'Execute real system command (e.g. npm run build, git status, cd .., dir, node)...'
              : "Type a command (ls, cat, touch, rm, open, stats, eval) or 'help'..."
          }
          className="flex-1 bg-transparent text-white outline-none placeholder-slate-600 font-mono text-xs"
          autoFocus
        />
        {isRunning && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin mr-2" />}
      </div>
    </div>
  );
};
