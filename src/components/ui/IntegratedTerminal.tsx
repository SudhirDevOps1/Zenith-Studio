import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Trash2, Maximize2, Minimize2, Play } from 'lucide-react';

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

  useEffect(() => {
    addEntry('info', '🚀 CodeStudio Terminal Ready');
    addEntry('info', 'Type "help" for available commands.');
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

  const handleCommand = (cmd: string) => {
    addEntry('input', `❯ ${cmd}`);

    const trimmed = cmd.trim().toLowerCase();

    switch (trimmed) {
      case 'help':
        addEntry('output', 'Available Commands:');
        addEntry('output', '  help        - Show this help message');
        addEntry('output', '  clear       - Clear the terminal');
        addEntry('output', '  date        - Show current date/time');
        addEntry('output', '  echo <text> - Print text to console');
        addEntry('output', '  pwd         - Show current directory');
        addEntry('output', '  ls          - List files in workspace');
        addEntry('output', '  whoami      - Show user info');
        addEntry('output', '  version     - Show CodeStudio version');
        addEntry('output', '  theme       - List available themes');
        break;
      case 'clear':
        setEntries([]);
        break;
      case 'date':
        addEntry('output', new Date().toString());
        break;
      case 'pwd':
        addEntry('output', '/codestudio/workspace');
        break;
      case 'ls':
        addEntry('output', 'README.md  index.html  docs/  script.js  package.json');
        break;
      case 'whoami':
        addEntry('output', 'codestudio-developer');
        break;
      case 'version':
        addEntry('output', 'CodeStudio v1.0.0 (React + Monaco + Electron)');
        break;
      case 'theme':
        addEntry('output', 'Available: VS Dark, Dracula, Nord, Monokai, GitHub Dark, Light');
        break;
      default:
        if (trimmed.startsWith('echo ')) {
          addEntry('output', cmd.slice(5));
        } else if (trimmed) {
          addEntry('error', `Command not found: ${trimmed}`);
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

  // Drag resize
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
      className="flex flex-col bg-[#0d0e15] border-t border-slate-800 text-slate-200 font-mono text-xs shrink-0"
    >
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
            title="Maximize"
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
            className={`leading-relaxed ${
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
          placeholder="Type a command or type 'help'..."
          className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-xs font-mono"
        />
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="h-1.5 hover:h-2 bg-slate-800 hover:bg-blue-500/80 cursor-row-resize shrink-0 transition-all"
      />
    </div>
  );
};
