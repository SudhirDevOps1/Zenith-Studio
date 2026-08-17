import React, { useState, useRef, useEffect } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useToastStore } from '../../stores/useToastStore';
import { useUpdateStore } from '../../stores/useUpdateStore';
import { useDiagnosticsStore } from '../../stores/useDiagnosticsStore';
import { getLanguageFromExtension, isElectron } from '../../utils/fileUtils';
import {
  Terminal,
  Check,
  RefreshCw,
  Cpu,
  HardDrive,
  FileCode2,
  WrapText,
  Sparkles,
  GitBranch,
  Zap,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';


interface StatusBarProps {
  onOpenGoToLine?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ onOpenGoToLine }) => {
  const { files, activeFileId, saveCurrentFile } = useFileStore();
  const { settings, toggleZenMode, setCommandPaletteOpen, updateSettings, setSettingsOpen, increaseZoom, decreaseZoom, resetZoom } = useSettingsStore();
  const { addToast } = useToastStore();
  const { hasUpdate, latestVersion, openUpdateModal } = useUpdateStore();
  const { diagnostics, toggleProblemsOpen } = useDiagnosticsStore();

  const [showIndentMenu, setShowIndentMenu] = useState(false);
  const indentMenuRef = useRef<HTMLDivElement>(null);

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

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
    <div className="h-6.5 bg-[#090a10] border-t border-slate-800/80 text-slate-400 flex items-center justify-between px-3 text-[11px] font-mono select-none shrink-0 z-20 relative">
      {/* Left items */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 hover:bg-slate-800 hover:text-white px-2 py-0.5 rounded-md transition text-slate-300"
          title="Command Palette (Ctrl+Shift+P)"
        >
          <Terminal className="w-3 h-3 text-blue-400" />
          <span className="font-semibold">CodeStudio</span>
        </button>

        {/* Git Branch Chip */}
        <div className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded transition">
          <GitBranch className="w-3 h-3 text-orange-400" />
          <span>main</span>
        </div>

        {/* Problems / Diagnostics Pill */}
        <button
          onClick={toggleProblemsOpen}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition cursor-pointer border ${
            errorCount > 0
              ? 'bg-red-950/60 border-red-800/60 text-red-300 hover:bg-red-900/60'
              : warningCount > 0
              ? 'bg-amber-950/60 border-amber-800/60 text-amber-300 hover:bg-amber-900/60'
              : 'border-transparent hover:bg-slate-800/60 text-slate-400'
          }`}
          title="Toggle Problems Panel (Errors & Warnings)"
        >
          <div className="flex items-center gap-1">
            <AlertCircle className={`w-3 h-3 ${errorCount > 0 ? 'text-red-400' : 'text-slate-500'}`} />
            <span>{errorCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className={`w-3 h-3 ${warningCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>{warningCount}</span>
          </div>
        </button>


        {activeFile && (
          <button
            onClick={onOpenGoToLine}
            className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 px-2 py-0.5 rounded-md transition cursor-pointer"
            title="Go to Line (Ctrl+G)"
          >
            <span className="flex items-center gap-1 text-slate-300">
              <FileCode2 className="w-3 h-3 text-cyan-400" /> Ln {lineCount}
            </span>
            <span>Col 1</span>
            <span className="text-slate-500 hidden md:inline">({charCount} chars)</span>
          </button>
        )}
      </div>

      {/* Right items */}
      <div className="flex items-center gap-2 text-slate-400 relative overflow-x-auto no-scrollbar">
        {activeFile && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-800/80 px-2 py-0.5 rounded-md transition" onClick={handleSave}>
            {activeFile.isModified ? (
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <RefreshCw className="w-3 h-3 animate-spin" /> Unsaved
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
        )}

        {/* Emmet Status Chip */}
        <div className="hidden lg:flex items-center gap-1 bg-purple-950/40 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-md text-[10px] font-semibold" title="Universal Emmet engine active">
          <Zap className="w-2.5 h-2.5 text-purple-400" />
          <span>Emmet</span>
        </div>

        {/* Indent & Wrap Selector */}
        <div className="relative hidden sm:block" ref={indentMenuRef}>
          <button
            onClick={() => setShowIndentMenu(!showIndentMenu)}
            className="cursor-pointer hover:bg-slate-800/80 hover:text-white px-1.5 py-0.5 rounded-md transition flex items-center gap-1 text-slate-300"
            title="Change Indentation and Wrap"
          >
            <span>Spaces: {settings.tabSize}</span>
          </button>


          {showIndentMenu && (
            <div className="absolute right-0 bottom-full mb-1 w-44 bg-[#141524]/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-xl py-1 z-50 text-slate-200 text-xs font-sans">
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

        <span className="text-slate-500">UTF-8</span>

        {/* Language Badge */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="uppercase font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md text-[10px] cursor-pointer transition border border-slate-700/60"
          title={`Language: ${language}. Click to configure settings`}
        >
          {language}
        </button>

        {/* Zoom Controls */}
        {(() => {
          const zoomLevel = settings.editorZoom ?? 0;
          const baseFontSize = settings.fontSize ?? 14;
          const effectiveFontSize = Math.max(8, Math.min(72, baseFontSize + zoomLevel));
          const zoomPercent = Math.round((effectiveFontSize / baseFontSize) * 100);
          return (
            <div className="flex items-center gap-0.5 bg-slate-900/80 border border-slate-800 rounded-md px-1 py-0.5 text-[10px]">
              <button
                onClick={decreaseZoom}
                className="px-1 py-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
                title="Zoom Out (Ctrl+-)"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                onClick={resetZoom}
                className="px-1.5 py-0.5 hover:bg-slate-700 rounded font-mono text-slate-200 hover:text-white transition min-w-[36px] text-center"
                title="Reset Zoom (Ctrl+0)"
              >
                {zoomPercent}%
              </button>
              <button
                onClick={increaseZoom}
                className="px-1 py-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
                title="Zoom In (Ctrl+=)"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          );
        })()}

        {/* Update Notification Badge */}
        {hasUpdate && (
          <button
            onClick={openUpdateModal}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse hover:scale-105 transition shadow-md shadow-amber-500/20 cursor-pointer"
            title={`CodeStudio v${latestVersion} is available! Click to update.`}
          >
            <Sparkles className="w-3 h-3" />
            <span>v{latestVersion} Ready</span>
          </button>
        )}

        {/* Zen Mode */}
        <button
          onClick={toggleZenMode}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] hover:bg-slate-800 hover:text-white transition text-slate-400"
          title="Toggle Zen Mode"
        >
          Zen
        </button>

        {/* Platform Badge */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded-md text-[10px]">
          {isDesktop ? (
            <>
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300">Desktop</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-300">Web VFS</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

