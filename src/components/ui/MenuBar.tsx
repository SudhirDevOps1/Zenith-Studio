import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useDialogStore } from '../../stores/useDialogStore';
import { createZipFromFiles, isElectron } from '../../utils/fileUtils';
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
} from 'lucide-react';

export const MenuBar: React.FC = () => {
  const { createFile, createFolder, saveCurrentFile, saveAllFiles, resetToDefaultFiles, files, setActivePreviewMode, openSystemFile, openSystemFolder } = useFileStore();
  const { setSettingsOpen, setCommandPaletteOpen, toggleZenMode, setActiveSidebarTab } = useSettingsStore();
  const { openDialog } = useDialogStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const isDesktop = isElectron();

  const handleExportZip = async () => {
    const blob = await createZipFromFiles(files);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codestudio-workspace.zip';
    a.click();
    setOpenMenu(null);
  };

  const closeMenus = () => setOpenMenu(null);

  return (
    <div
      onClick={closeMenus}
      className="h-9 bg-[#14141f] border-b border-slate-800 flex items-center justify-between px-3 text-xs text-slate-300 select-none shrink-0 z-30"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left App Brand & Top Menu Items */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="flex items-center gap-2 font-bold text-white mr-3">
          <Code2 className="w-4 h-4 text-blue-500" />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-mono text-sm">
            CodeStudio
          </span>
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
                  const name = await openDialog({ type: 'file', title: 'Create New File', message: 'Enter filename with extension.', placeholder: 'index.ts', confirmText: 'Create File', cancelText: 'Cancel' });
                  if (name) createFile(name, null);
                  closeMenus();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition text-left"
              >
                <FilePlus className="w-3.5 h-3.5 text-blue-400" /> New File
              </button>

              <button
                onClick={async () => {
                  const name = await openDialog({ type: 'folder', title: 'Create New Folder', message: 'Enter folder name.', placeholder: 'src', confirmText: 'Create Folder', cancelText: 'Cancel' });
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

      {/* Center title indicator */}
      <div className="text-[11px] text-slate-400 font-mono hidden md:block">
        CodeStudio - Web &amp; Desktop Universal Code Editor
      </div>

      {/* Right Native Window Actions for Electron Desktop */}
      {isDesktop && (
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button
            onClick={() => (window as any).electronAPI?.minimizeWindow?.()}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => (window as any).electronAPI?.maximizeWindow?.()}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => (window as any).electronAPI?.closeWindow?.()}
            className="p-1.5 hover:bg-red-600 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
