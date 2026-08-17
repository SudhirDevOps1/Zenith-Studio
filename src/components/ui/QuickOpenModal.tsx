import React, { useState, useEffect, useRef } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { FileIcon } from '../filetree/FileIcon';
import { Search, CornerDownLeft, Hash } from 'lucide-react';

interface QuickOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'file' | 'line';
  editorRef?: React.MutableRefObject<any>;
}

export const QuickOpenModal: React.FC<QuickOpenModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'file',
  editorRef,
}) => {
  const { files, openFileInTab, setActiveFile, activeFileId } = useFileStore();
  const [query, setQuery] = useState(initialMode === 'line' ? ':' : '');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialMode === 'line' ? ':' : '');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const isLineMode = query.startsWith(':');
  const lineQueryNumber = isLineMode ? parseInt(query.slice(1).trim(), 10) : NaN;

  // Filter files
  const fileList = files.filter((f) => f.type === 'file');
  const filteredFiles = query.trim() && !isLineMode
    ? fileList.filter((f) => {
        const q = query.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
      })
    : fileList;

  const handleSelectFile = (fileId: string) => {
    openFileInTab(fileId);
    setActiveFile(fileId);
    onClose();
  };

  const handleGoToLine = (lineNumber: number) => {
    if (isNaN(lineNumber) || lineNumber < 1) return;
    if (editorRef?.current) {
      editorRef.current.revealLineInCenter(lineNumber);
      editorRef.current.setPosition({ lineNumber, column: 1 });
      editorRef.current.focus();
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isLineMode) {
        setSelectedIndex((prev) => (prev < filteredFiles.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isLineMode) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isLineMode) {
        handleGoToLine(lineQueryNumber);
      } else if (filteredFiles.length > 0 && filteredFiles[selectedIndex]) {
        handleSelectFile(filteredFiles[selectedIndex].id);
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded-xl overflow-hidden text-slate-200 flex flex-col font-sans animate-scale-up"
      >
        {/* Search Bar Input */}
        <div className="p-3 border-b border-slate-700/80 flex items-center gap-3 bg-[#181825]">
          {isLineMode ? (
            <Hash className="w-5 h-5 text-cyan-400 shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isLineMode ? 'Type line number to navigate (e.g. :45)...' : 'Type to search files (or :line to go to line)...'}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none font-mono"
          />
          <kbd className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        {isLineMode ? (
          <div className="p-6 text-center text-slate-400 space-y-2">
            {!isNaN(lineQueryNumber) && lineQueryNumber > 0 ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-cyan-300 font-medium">
                  Press <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded font-mono text-xs">Enter</kbd> to jump to line <strong className="text-white">{lineQueryNumber}</strong>
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Enter a valid line number like <code className="text-cyan-400">:25</code></p>
            )}
          </div>
        ) : (
          <div ref={listRef} className="max-h-80 overflow-y-auto p-1.5 divide-y divide-slate-800/40">
            {filteredFiles.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No matching files found for &quot;{query}&quot;
              </div>
            ) : (
              filteredFiles.map((file, idx) => {
                const isSelected = idx === selectedIndex;
                const isActive = file.id === activeFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-blue-600/30 text-white border border-blue-500/50'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileIcon name={file.name} className="w-4 h-4 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className={`font-medium truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate font-mono">
                          {file.path}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isActive && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                          Active
                        </span>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="px-3 py-2 bg-[#14141f] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
          <span>Navigate with <kbd className="text-slate-400">↑</kbd> <kbd className="text-slate-400">↓</kbd></span>
          <span><kbd className="text-slate-400">:line</kbd> to jump to line</span>
        </div>
      </div>
    </div>
  );
};
