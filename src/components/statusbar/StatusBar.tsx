import React, { useState, useRef, useEffect } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useToastStore } from '../../stores/useToastStore';
import { useUpdateStore } from '../../stores/useUpdateStore';
import { getLanguageFromExtension, isElectron } from '../../utils/fileUtils';
import { Terminal, Check, RefreshCw, Cpu, HardDrive, FileCode2, WrapText, Sparkles } from 'lucide-react';

interface StatusBarProps {
  onOpenGoToLine?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ onOpenGoToLine }) => {
  const { files, activeFileId, saveCurrentFile } = useFileStore();
  const { settings, toggleZenMode, setCommandPaletteOpen, updateSettings, setSettingsOpen } = useSettingsStore();
  const { addToast } = useToastStore();
  const { hasUpdate, latestVersion, openUpdateModal } = useUpdateStore();

  const [showIndentMenu, setShowIndentMenu] = useState(false);
  const indentMenuRef = useRef<HTMLDivElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId);
  const language = activeFile ? getLanguageFromExtension(activeFile.extension || '') : 'Plain Text';
  const charCount = activeFile?.content?.length || 0;
  const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 0;
  const isDesktop = isElectron();

  const handleSave = () => {
    saveCurrentFile();
    addToast({ type: 'success', title: 'File Saved', message: `Saved ${activeFile?.name || 'file'} to local storage.` });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (indentMenuRef.current && !indentMenuRef.current.contains(e.target as Node)) {
        setShowIndentMenu(false);
      }
    };
    if (showIndentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showIndentMenu]);

  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] font-mono select-none shrink-0 z-20 relative">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 py-0.5 rounded transition"
          title="Command Palette (Ctrl+Shift+P)"
        >
          <Terminal className="w-3 h-3" />
          <span>CodeStudio</span>
        </button>

        {activeFile && (
          <button
            onClick={onOpenGoToLine}
            className="flex items-center gap-2 text-blue-100 hover:text-white hover:bg-white/10 px-1.5 py-0.5 rounded transition cursor-pointer"
            title="Go to Line (Ctrl+G)"
          >
            <span className="flex items-center gap-1">
              <FileCode2 className="w-3 h-3 text-cyan-200" /> Ln {lineCount}
            </span>
            <span>Col 1</span>
            <span className="text-blue-200">({charCount} chars)</span>
          </button>
        )}
      </div>

      {/* Right items */}
      <div className="flex items-center gap-2.5 text-blue-100 relative">
        {activeFile && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition" onClick={handleSave}>
            {activeFile.isModified ? (
              <span className="flex items-center gap-1 text-amber-200 font-semibold">
                <RefreshCw className="w-3 h-3 animate-spin-slow" /> Unsaved (Ctrl+S)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-200">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
        )}

        {/* Indent & Wrap Selector */}
        <div className="relative" ref={indentMenuRef}>
          <button
            onClick={() => setShowIndentMenu(!showIndentMenu)}
            className="cursor-pointer hover:bg-white/15 px-1.5 py-0.5 rounded transition flex items-center gap-1"
            title="Change Indentation and Wrap"
          >
            <span>Spaces: {settings.tabSize}</span>
          </button>

          {showIndentMenu && (
            <div className="absolute right-0 bottom-full mb-1 w-44 bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded-lg py-1 z-50 text-slate-200 text-xs font-sans">
              <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                Indentation Size
              </div>
              <button
                onClick={() => {
                  updateSettings({ tabSize: 2 });
                  setShowIndentMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition ${settings.tabSize === 2 ? 'text-cyan-400 font-semibold' : ''}`}
              >
                2 Spaces
              </button>
              <button
                onClick={() => {
                  updateSettings({ tabSize: 4 });
                  setShowIndentMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition ${settings.tabSize === 4 ? 'text-cyan-400 font-semibold' : ''}`}
              >
                4 Spaces
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => {
                  updateSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' });
                  setShowIndentMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <WrapText className="w-3.5 h-3.5 text-amber-400" /> Word Wrap
                </span>
                <span className="text-[10px] text-slate-400">{settings.wordWrap === 'on' ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}
        </div>

        <span>UTF-8</span>

        {/* Language Badge */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="uppercase font-semibold bg-white/20 px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-white/30 transition"
          title={`Language: ${language}. Click to configure settings`}
        >
          {language}
        </button>

        {/* Update Notification Badge */}
        {hasUpdate && (
          <button
            onClick={openUpdateModal}
            className="flex items-center gap-1 bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse hover:bg-amber-300 transition shadow-sm cursor-pointer"
            title={`CodeStudio v${latestVersion} is available! Click to update.`}
          >
            <Sparkles className="w-3 h-3" />
            <span>v{latestVersion} Available</span>
          </button>
        )}

        {/* Zen Mode */}
        <button
          onClick={toggleZenMode}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 transition"
          title="Toggle Zen Mode"
        >
          Zen
        </button>

        {/* Platform Badge */}
        <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
          {isDesktop ? (
            <>
              <Cpu className="w-3 h-3 text-emerald-300" />
              <span>Electron</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3 h-3 text-cyan-300" />
              <span>VFS Web</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
