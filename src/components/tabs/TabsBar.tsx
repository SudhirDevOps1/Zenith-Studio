import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { FileIcon } from '../filetree/FileIcon';
import { X, ChevronRight, Split, Layers, Columns, Globe } from 'lucide-react';

export const TabsBar: React.FC = () => {
  const { openTabs, activeFileId, setActiveFile, closeTab, closeOtherTabs, closeAllTabs, files, activePreviewMode, setActivePreviewMode } = useFileStore();
  const { settings } = useSettingsStore();
  const [tabContextMenu, setTabContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  // Split path into breadcrumb tokens
  const breadcrumbItems = activeFile ? activeFile.path.split('/') : [];

  const handleTabContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setTabContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  return (
    <div className="flex flex-col bg-[#1e1e2e] border-b border-slate-800/80 text-slate-300 select-none">
      {/* Scrollable Tabs row */}
      <div className="flex items-center justify-between border-b border-slate-800/60 bg-[#181825] overflow-x-auto">
        <div className="flex items-center overflow-x-auto flex-1 no-scrollbar">
          {openTabs.map((tab) => {
            const isActive = tab.fileId === activeFileId;
            return (
              <div
                key={tab.fileId}
                onClick={() => setActiveFile(tab.fileId)}
                onContextMenu={(e) => handleTabContextMenu(e, tab.fileId)}
                className={`group flex items-center gap-2 px-3 py-2 border-r border-slate-800/80 cursor-pointer text-xs transition min-w-[120px] max-w-[200px] shrink-0 font-mono ${
                  isActive
                    ? 'bg-[#1e1e2e] text-white font-medium border-t-2 border-t-blue-500'
                    : 'bg-[#11111b]/60 text-slate-400 hover:bg-[#1e1e2e]/50 hover:text-slate-200'
                }`}
              >
                <FileIcon name={tab.title} className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1">{tab.title}</span>

                {/* Modified dot vs close button */}
                {tab.isModified ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 group-hover:hidden" />
                ) : null}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.fileId);
                  }}
                  className={`p-0.5 rounded hover:bg-slate-700/80 hover:text-white text-slate-400 transition ${
                    tab.isModified ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Preview Split View Toggle Controls */}
        {activeFile && (
          <div className="flex items-center gap-1 px-3 border-l border-slate-800/80 bg-[#181825] text-slate-400 shrink-0">
            <button
              onClick={() => setActivePreviewMode(activePreviewMode === 'off' ? 'auto' : 'off')}
              className={`p-1.5 rounded transition ${activePreviewMode !== 'off' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-slate-200'}`}
              title={activePreviewMode === 'off' ? 'Enable Preview Pane' : 'Disable Preview Pane'}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActivePreviewMode('split-edit')}
              className={`p-1.5 rounded transition ${activePreviewMode === 'split-edit' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-slate-200'}`}
              title="Split Code & Preview Mode"
            >
              <Split className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActivePreviewMode('preview-only')}
              className={`p-1.5 rounded transition ${activePreviewMode === 'preview-only' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-slate-200'}`}
              title="Preview Only Mode"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActivePreviewMode(activePreviewMode === 'webview' ? 'auto' : 'webview')}
              className={`p-1.5 rounded transition ${activePreviewMode === 'webview' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-emerald-300'}`}
              title="Open Simple Browser Webview (Internet & Localhost)"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb Path navigation */}
      {settings.showBreadcrumbs && activeFile && (
        <div className="flex items-center gap-1 px-3 py-1 bg-[#181825]/80 text-[11px] font-mono text-slate-400 border-b border-slate-800/40">
          <span className="text-slate-500">codestudio</span>
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className={idx === breadcrumbItems.length - 1 ? 'text-slate-200 font-medium' : 'text-slate-400'}>
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
          className="fixed z-50 w-44 bg-[#1e1e2e] border border-slate-700 shadow-xl rounded py-1 text-xs text-slate-200"
          onClick={() => setTabContextMenu(null)}
        >
          <button
            onClick={() => closeTab(tabContextMenu.fileId)}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
          >
            Close Tab
          </button>
          <button
            onClick={() => closeOtherTabs(tabContextMenu.fileId)}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
          >
            Close Other Tabs
          </button>
          <button
            onClick={closeAllTabs}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white transition"
          >
            Close All Tabs
          </button>
        </div>
      )}
    </div>
  );
};
