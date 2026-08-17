import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useDialogStore } from '../../stores/useDialogStore';
import { useUpdateStore } from '../../stores/useUpdateStore';
import { useDiagnosticsStore } from '../../stores/useDiagnosticsStore';
import { createZipFromFiles, isElectron } from '../../utils/fileUtils';
import { formatCode } from '../../utils/codeFormatter';
import {
  Code2,
  FilePlus,
  FolderPlus,
  Save,
  Download,
  Terminal,
  Settings,
  RotateCcw,
  Maximize2,
  Columns,
  Minus,
  Square,
  X,
  Blocks,
  Globe,
  Sparkles,
  Bot,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Search,
} from 'lucide-react';
import { AiSetupModal } from './AiSetupModal';

export const MenuBar: React.FC = () => {
  const { createFile, createFolder, saveCurrentFile, saveAllFiles, resetToDefaultFiles, files, setActivePreviewMode, openSystemFile, openSystemFolder, rootFolderPath, activeFileId, updateFileContent } = useFileStore();
  const { setSettingsOpen, setCommandPaletteOpen, toggleZenMode, setActiveSidebarTab, increaseZoom, decreaseZoom, resetZoom, settings } = useSettingsStore();
  const { toggleProblemsOpen } = useDiagnosticsStore();
  const { openDialog } = useDialogStore();
  const { checkForUpdates, hasUpdate } = useUpdateStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAiSetup, setShowAiSetup] = useState(false);


  const isDesktop = isElectron();
  const activeFile = files.find(f => f.id === activeFileId);
  const folderName = rootFolderPath ? rootFolderPath.split(/[\\/]/).filter(Boolean).pop() : 'Zenith Studio Workspace';

  const handleExportZip = async () => {
    const blob = await createZipFromFiles(files);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zenith-studio-workspace.zip';
    a.click();
    setOpenMenu(null);
  };

  const handleFormat = () => {
    if (activeFile && activeFile.content) {
      const res = formatCode(activeFile.content, activeFile.extension || 'js', settings.tabSize || 2);
      if (res.formatted) {
        updateFileContent(activeFile.id, res.formatted);
      }
    }
    closeMenus();
  };

  const closeMenus = () => setOpenMenu(null);

  return (
    <div
      onClick={closeMenus}
      className="h-9 bg-[#0e0f18]/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-3 text-xs text-slate-300 select-none shrink-0 z-30 font-sans"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left App Brand & Top Menu Items */}
      <div className="flex items-center gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="flex items-center gap-2 font-bold text-white mr-2.5 px-1 py-0.5 rounded-lg hover:bg-white/5 transition cursor-pointer">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-sm">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Zenith Studio
          </span>
          <span className="text-[10px] text-slate-400 font-mono font-normal">v1.0.3</span>
        </div>





        {/* File Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === 'file' ? null : 'file');
            }}
            className={`px-2.5 py-1 rounded transition ${openMenu === 'file' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/80'}`}
          >
            File
          </button>

          {openMenu === 'file' && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded py-1 z-50 text-slate-200">
              <button
                onClick={async () => {
                  const name = await openDialog({ type: 'file', title: 'New File', message: 'Enter file name with extension:', placeholder: 'newFile.ts' });
                  if (name) createFile(name, null);
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <FilePlus className="w-3.5 h-3.5 text-blue-400" /> New File
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+N</kbd>
              </button>

              <button
                onClick={async () => {
                  const name = await openDialog({ type: 'folder', title: 'New Folder', message: 'Enter folder name:', placeholder: 'components' });
                  if (name) createFolder(name, null);
                  closeMenus();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" /> New Folder
              </button>


              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  openSystemFile();
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <FilePlus className="w-3.5 h-3.5 text-cyan-400" /> Open File...
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+O</kbd>
              </button>

              <button
                onClick={() => {
                  openSystemFolder();
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5 text-indigo-400" /> Open Folder...
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+O</kbd>
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  saveCurrentFile();
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-emerald-400" /> Save Active File
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+S</kbd>
              </button>

              <button
                onClick={() => {
                  saveAllFiles();
                  closeMenus();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <Save className="w-3.5 h-3.5 text-emerald-500" /> Save All Files
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={handleExportZip}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" /> Export Workspace ZIP
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === 'edit' ? null : 'edit');
            }}
            className={`px-2.5 py-1 rounded transition ${openMenu === 'edit' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/80'}`}
          >
            Edit
          </button>

          {openMenu === 'edit' && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded py-1 z-50 text-slate-200">
              <button
                onClick={handleFormat}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Format Document
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Shift+Alt+F</kbd>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarTab('search');
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-blue-400" /> Find &amp; Replace
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+F</kbd>
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === 'view' ? null : 'view');
            }}
            className={`px-2.5 py-1 rounded transition ${openMenu === 'view' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/80'}`}
          >
            View
          </button>

          {openMenu === 'view' && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded py-1 z-50 text-slate-200">
              <button
                onClick={() => {
                  setActiveSidebarTab('ai');
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" /> AI Assistant (Gemini)
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+A</kbd>
              </button>

              <button
                onClick={() => {
                  toggleProblemsOpen();
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Problems &amp; Diagnostics
                </span>
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  setActiveSidebarTab('extensions');
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Blocks className="w-3.5 h-3.5 text-cyan-400" /> Extensions
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+X</kbd>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarTab('explorer');
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" /> Explorer
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+E</kbd>
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  increaseZoom();
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <ZoomIn className="w-3.5 h-3.5 text-slate-400" /> Zoom In
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+=</kbd>
              </button>

              <button
                onClick={() => {
                  decreaseZoom();
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <ZoomOut className="w-3.5 h-3.5 text-slate-400" /> Zoom Out
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+-</kbd>
              </button>

              <button
                onClick={() => {
                  resetZoom();
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset Zoom
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+0</kbd>
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  setActivePreviewMode('webview');
                  closeMenus();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Simple Browser / Webview
              </button>

              <button
                onClick={() => {
                  setActivePreviewMode('split-edit');
                  closeMenus();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <Columns className="w-3.5 h-3.5 text-indigo-400" /> Split Code &amp; Preview
              </button>

              <button
                onClick={() => {
                  toggleZenMode();
                  closeMenus();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <Maximize2 className="w-3.5 h-3.5 text-purple-400" /> Zen Mode
              </button>
            </div>
          )}
        </div>

        {/* Tools Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === 'tools' ? null : 'tools');
            }}
            className={`px-2.5 py-1 rounded transition ${openMenu === 'tools' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/80'}`}
          >
            Tools
          </button>

          {openMenu === 'tools' && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded py-1 z-50 text-slate-200">
              <button
                onClick={() => {
                  setCommandPaletteOpen(true);
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" /> Command Palette
                </span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+P</kbd>
              </button>

              <button
                onClick={() => {
                  setSettingsOpen(true);
                  closeMenus();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
              </button>

              <button
                onClick={() => {
                  setShowAiSetup(true);
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 text-slate-200">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" /> AI Setup &amp; Model Config...
                </span>
                <kbd className="text-[10px] text-cyan-300 font-mono">Setup</kbd>
              </button>

              <button
                onClick={() => {
                  checkForUpdates(true);
                  closeMenus();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Check for Updates...
                </span>
                {hasUpdate && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={async () => {
                  const ok = await openDialog({ type: 'confirm', title: 'Reset Workspace', message: 'Reset workspace to default sample files? This keeps the app intact but replaces current virtual files.', confirmText: 'Reset', cancelText: 'Cancel' });
                  if (ok !== null) resetToDefaultFiles();
                  closeMenus();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-amber-400 transition text-left"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Workspace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Project / Workspace Badge */}
      <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-800/80 rounded-full text-[11px] font-mono text-slate-300 shadow-inner hidden md:flex" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-400">workspace:</span>
        <span className="font-semibold text-white truncate max-w-[180px]">{folderName}</span>
        {activeFile && (
          <>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-300 font-bold truncate max-w-[160px]">{activeFile.name}</span>
          </>
        )}
      </div>

      {/* Right Native Window Actions for Electron Desktop */}
      {isDesktop && (
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button
            onClick={() => (window as any).electronAPI?.minimizeWindow?.()}
            className="p-1.5 hover:bg-slate-800/90 rounded-lg text-slate-400 hover:text-white transition"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => (window as any).electronAPI?.maximizeWindow?.()}
            className="p-1.5 hover:bg-slate-800/90 rounded-lg text-slate-400 hover:text-white transition"
            title="Maximize / Restore"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => (window as any).electronAPI?.closeWindow?.()}
            className="p-1.5 hover:bg-red-600/90 rounded-lg text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Setup Configuration Modal */}
      <AiSetupModal isOpen={showAiSetup} onClose={() => setShowAiSetup(false)} />
    </div>
  );
};


