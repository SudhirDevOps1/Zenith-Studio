import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { FileIcon } from '../filetree/FileIcon';
import { ACCENT_PALETTE } from '../../utils/accentThemes';
import { X, ChevronRight, Split, Layers, Columns, Globe, Folder, Play } from 'lucide-react';

export const TabsBar: React.FC = () => {
  const { openTabs, activeFileId, setActiveFile, closeTab, closeOtherTabs, closeAllTabs, files, activePreviewMode, setActivePreviewMode } = useFileStore();
  const { settings } = useSettingsStore();
  const [tabContextMenu, setTabContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

  const currentAccent = ACCENT_PALETTE[settings.accentColor] || ACCENT_PALETTE.blue;
  const activeFile = files.find(f => f.id === activeFileId);
  const ext = activeFile?.extension?.toLowerCase() || '';
  const isRunnable = ['js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'cc', 'cxx', 'rs', 'go'].includes(ext);

  // Split path into breadcrumb tokens
  const breadcrumbItems = activeFile ? activeFile.path.split('/') : [];

  const handleTabContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setTabContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  return (
    <div className="flex flex-col bg-[#0d0e15] border-b border-slate-800/80 text-slate-300 select-none font-sans">
      {/* Scrollable Tabs row */}
      <div className="flex items-center justify-between border-b border-slate-800/60 bg-[#0f1019] overflow-x-auto">
        <div className="flex items-center overflow-x-auto flex-1 no-scrollbar pt-1 px-1 gap-1">
          {openTabs.map((tab) => {
            const isActive = tab.fileId === activeFileId;
            return (
              <div
                key={tab.fileId}
                onClick={() => setActiveFile(tab.fileId)}
                onContextMenu={(e) => handleTabContextMenu(e, tab.fileId)}
                style={isActive ? { borderTopColor: currentAccent.primary } : {}}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-t-lg border-t-2 cursor-pointer text-xs transition-all min-w-[130px] max-w-[210px] shrink-0 font-mono ${
                  isActive
                    ? 'bg-[#141522] text-white font-medium shadow-md'
                    : 'bg-transparent text-slate-400 hover:bg-[#141522]/50 hover:text-slate-200 border-t-transparent'
                }`}
              >
                <FileIcon name={tab.title} className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate text-xs">{tab.title}</span>
                {tab.isModified && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 group-hover:hidden shrink-0" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.fileId);
                  }}
                  className="p-0.5 hover:bg-slate-700/80 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-slate-400 hover:text-white shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Preview & Run Code Toggle Controls */}
        {activeFile && (
          <div className="flex items-center gap-1 px-2.5 py-1 border-l border-slate-800/80 bg-[#0f1019] text-slate-400 shrink-0">
            {isRunnable && (
              <button
                onClick={() => setActivePreviewMode(activePreviewMode === 'split-edit' ? 'off' : 'split-edit')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  activePreviewMode === 'split-edit'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400'
                }`}
                title={`Run ${activeFile.name} (GCC / Python / JS)`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Run</span>
              </button>
            )}

            <button
              onClick={() => setActivePreviewMode(activePreviewMode === 'off' ? 'auto' : 'off')}
              className={`p-1.5 rounded-lg transition-all ${activePreviewMode !== 'off' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'hover:bg-slate-800 hover:text-slate-200'}`}
              title={activePreviewMode === 'off' ? 'Enable Preview Pane' : 'Disable Preview Pane'}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActivePreviewMode('split-edit')}
              className={`p-1.5 rounded-lg transition-all ${activePreviewMode === 'split-edit' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'hover:bg-slate-800 hover:text-slate-200'}`}
              title="Split Code & Preview Mode"
            >
              <Split className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActivePreviewMode('preview-only')}
              className={`p-1.5 rounded-lg transition-all ${activePreviewMode === 'preview-only' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'hover:bg-slate-800 hover:text-slate-200'}`}
              title="Preview Only Mode"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActivePreviewMode(activePreviewMode === 'webview' ? 'auto' : 'webview')}
              className={`p-1.5 rounded-lg transition-all ${activePreviewMode === 'webview' ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40' : 'hover:bg-slate-800 hover:text-emerald-300'}`}
              title="Open Simple Browser Webview (Internet & Localhost)"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb Path navigation */}
      {settings.showBreadcrumbs && activeFile && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#12131e] text-[11px] font-mono text-slate-400 border-b border-slate-800/40">
          <Folder className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="text-slate-400">workspace</span>
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className={idx === breadcrumbItems.length - 1 ? 'text-cyan-300 font-semibold flex items-center gap-1' : 'text-slate-400'}>
                {idx === breadcrumbItems.length - 1 && <FileIcon name={item} className="w-3 h-3 inline shrink-0" />}
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Tab Context Menu */}
      {tabContextMenu && (
        <div
          style={{ top: `${tabContextMenu.y}px`, left: `${tabContextMenu.x}px` }}
          className="fixed z-50 w-48 bg-[#141524]/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-xl py-1 text-xs text-slate-200"
          onClick={() => setTabContextMenu(null)}
        >
          <button
            onClick={() => closeTab(tabContextMenu.fileId)}
            className="w-full text-left px-3.5 py-1.5 hover:bg-blue-600 hover:text-white transition rounded-md"
          >
            Close Tab
          </button>
          <button
            onClick={() => closeOtherTabs(tabContextMenu.fileId)}
            className="w-full text-left px-3.5 py-1.5 hover:bg-blue-600 hover:text-white transition rounded-md"
          >
            Close Other Tabs
          </button>
          <button
            onClick={closeAllTabs}
            className="w-full text-left px-3.5 py-1.5 hover:bg-red-600/80 hover:text-white text-red-400 transition rounded-md"
          >
            Close All Tabs
          </button>
        </div>
      )}
    </div>
  );
};
