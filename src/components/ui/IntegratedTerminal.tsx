import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Trash2, Maximize2, Minimize2, Play } from 'lucide-react';
import { useFileStore } from '../../stores/useFileStore';

interface TerminalEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  text: string;
  timestamp: string;
}

export const IntegratedTerminal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [height, setHeight] = useState(220);
  const [isDragging, setIsDragging] = useState(false);
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { files, createFile, deleteFileItem, openFileInTab } = useFileStore();

  useEffect(() => {
    addEntry('info', '🚀 CodeStudio Integrated Terminal Ready');
    addEntry('info', 'Type "help" for available commands (ls, cat, touch, rm, open, stats, eval).');
    addEntry('output', '');
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries]);

  const addEntry = (type: TerminalEntry['type'], text: string) => {
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type,
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleCommand = (rawCmd: string) => {
    addEntry('input', `❯ ${rawCmd}`);
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case 'help':
        addEntry('output', 'Available Commands:');
        addEntry('output', '  ls / dir          - List files and folders in workspace');
        addEntry('output', '  cat <file>        - View contents of a workspace file');
        addEntry('output', '  touch <file>      - Create a new empty file in workspace');
        addEntry('output', '  rm <file>         - Delete a file from workspace');
        addEntry('output', '  open <file>       - Open a file in the editor tab');
        addEntry('output', '  stats             - Display workspace statistics');
        addEntry('output', '  eval <expression> - Execute JavaScript expression');
        addEntry('output', '  echo <text>       - Print text to terminal');
        addEntry('output', '  clear             - Clear terminal screen');
        addEntry('output', '  pwd               - Show workspace path');
        addEntry('output', '  date              - Show current date & time');
        addEntry('output', '  theme             - Show available themes');
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
              const size = (f.content?.length || 0) > 1024 ? `${((f.content?.length || 0) / 1024).toFixed(1)} KB` : `${f.content?.length || 0} B`;
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
        const fileToRead = files.find((f) => f.name.toLowerCase() === args.toLowerCase() || f.path.toLowerCase() === args.toLowerCase());
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
        const fileToDelete = files.find((f) => f.name.toLowerCase() === args.toLowerCase() || f.path.toLowerCase() === args.toLowerCase());
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
        const targetFile = files.find((f) => f.name.toLowerCase() === args.toLowerCase() || f.path.toLowerCase() === args.toLowerCase());
        if (!targetFile) {
          addEntry('error', `File not found: ${args}`);
        } else if (targetFile.type !== 'file') {
          addEntry('error', `${args} is a folder`);
        } else {
          openFileInTab(targetFile.id);
          addEntry('info', `Opened ${targetFile.name} in editor tab.`);
        }
        break;

      case 'stats':
        const fileCount = files.filter((f) => f.type === 'file').length;
        const folderCount = files.filter((f) => f.type === 'folder').length;
        const totalChars = files.reduce((acc, f) => acc + (f.content?.length || 0), 0);
        addEntry('output', `Workspace Statistics:`);
        addEntry('output', `  Files:   ${fileCount}`);
        addEntry('output', `  Folders: ${folderCount}`);
        addEntry('output', `  Size:    ${(totalChars / 1024).toFixed(2)} KB (${totalChars} chars)`);
        break;

      case 'eval':
        if (!args) {
          addEntry('error', 'Usage: eval <javascript expression>');
          break;
        }
        try {
          const res = new Function(`return (${args});`)();
          addEntry('output', typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res));
        } catch (err: any) {
          addEntry('error', `Eval Error: ${err.message}`);
        }
        break;

      case 'clear':
        setEntries([]);
        break;

      case 'date':
        addEntry('output', new Date().toString());
        break;

      case 'pwd':
        addEntry('output', '/workspace');
        break;

      case 'whoami':
        addEntry('output', 'developer@codestudio');
        break;

      case 'version':
        addEntry('output', 'CodeStudio v1.0.0 (React 19 + Monaco + Vite 7 + Electron)');
        break;

      case 'theme':
        addEntry('output', 'Available themes: VS Dark, Dracula, Nord, Monokai, GitHub Dark, Light');
        break;

      default:
        if (command === 'echo') {
          addEntry('output', args);
        } else {
          addEntry('error', `Command not found: "${command}". Type "help" for a list of commands.`);
        }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input) {
      handleCommand(input);
      setInput('');
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

  return (
    <div
      style={{ height: isMaximized ? '100%' : `${height}px` }}
      className="flex flex-col bg-[#0d0e15] border-t border-slate-800 text-slate-200 font-mono text-xs shrink-0 relative"
    >
      {/* Top Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="h-1.5 hover:h-2 bg-slate-800 hover:bg-blue-500 cursor-row-resize shrink-0 transition-all"
        title="Drag to resize terminal"
      />

      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181825] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-[11px] text-slate-300 uppercase tracking-wider">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEntries([])}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Clear Terminal"
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
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition"
            title="Close Terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-3 space-y-0.5"
        onClick={() => inputRef.current?.focus()}
      >
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`leading-relaxed whitespace-pre-wrap ${
              entry.type === 'input'
                ? 'text-cyan-300 font-semibold'
                : entry.type === 'error'
                ? 'text-red-400'
                : entry.type === 'info'
                ? 'text-blue-300'
                : 'text-slate-300'
            }`}
          >
            <span className="text-[9px] text-slate-600 mr-2">[{entry.timestamp}]</span>
            {entry.text}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#181825] border-t border-slate-800 shrink-0">
        <Play className="w-3 h-3 text-emerald-400" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command (ls, cat, touch, rm, open, stats, eval) or 'help'..."
          className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-xs font-mono"
        />
      </div>
    </div>
  );
};
