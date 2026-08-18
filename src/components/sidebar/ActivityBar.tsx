import React from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useFileStore } from '../../stores/useFileStore';
import { useExtensionStore } from '../../stores/useExtensionStore';
import { createZipFromFiles, isElectron } from '../../utils/fileUtils';
import { ACCENT_PALETTE } from '../../utils/accentThemes';
import {
  Files,
  Search,
  Settings,
  Terminal,
  Download,
  Maximize2,
  Minimize2,
  Info,
  Laptop,
  Globe,
  GitBranch,
  Sparkles,
  Keyboard,
  Blocks,
  Bot,
  Bug,
  Command,
} from 'lucide-react';
import { useComposerStore } from '../../stores/useComposerStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { ZenithLogo } from '../ui/ZenithLogo';




export const ActivityBar: React.FC = () => {
  const {
    activeSidebarTab,
    setActiveSidebarTab,
    sidebarOpen,
    setSidebarOpen,
    setSettingsOpen,
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    isZenMode,
    toggleZenMode,
    settings,
  } = useSettingsStore();

  const handleTabClick = (tab: any) => {
    if (activeSidebarTab === tab && sidebarOpen) {
      setSidebarOpen(false);
    } else {
      setActiveSidebarTab(tab);
      setSidebarOpen(true);
    }
  };

  const { files } = useFileStore();
  const currentAccent = ACCENT_PALETTE[settings.accentColor] || ACCENT_PALETTE.blue;

  const handleExportZip = async () => {
    try {
      const blob = await createZipFromFiles(files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenith-studio-workspace-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Zip generation error:', err);
    }
  };

  const isDesktopEnv = isElectron();
  const modifiedCount = files.filter((f) => f.type === 'file' && f.isModified).length;
  const installedExtensionsCount = useExtensionStore((s) => s.extensions.filter((e) => e.installed).length);

  return (
    <div style={{ width: '52px' }} className="h-full min-h-0 bg-[#0c0d14] border-r border-slate-800/80 flex flex-col justify-between items-center py-2.5 text-slate-400 select-none shrink-0 z-20 overflow-hidden">
      {/* Top Main Section */}
      <div className="flex flex-col items-center gap-2 overflow-y-auto pr-0.5 min-h-0 w-full px-1.5" style={{ scrollbarWidth: 'thin' }}>
        {/* Logo Icon */}
        <div
          onClick={() => handleTabClick('explorer')}
          className="cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 mb-2.5"
          title="Zenith Studio Home"
        >
          <ZenithLogo size={34} className="rounded-xl border border-cyan-500/40 p-0.5 bg-slate-900 shadow-lg" />
        </div>

        {/* Explorer */}
        <button
          onClick={() => handleTabClick('explorer')}
          style={activeSidebarTab === 'explorer' && sidebarOpen ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'explorer' && sidebarOpen
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="File Explorer (Ctrl+Shift+E / Ctrl+B)"
        >
          {activeSidebarTab === 'explorer' && sidebarOpen && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Files style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Search */}
        <button
          onClick={() => handleTabClick('search')}
          style={activeSidebarTab === 'search' && sidebarOpen ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'search' && sidebarOpen
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Search in Workspace (Ctrl+Shift+F)"
        >
          {activeSidebarTab === 'search' && sidebarOpen && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Search style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Git Control */}
        <button
          onClick={() => handleTabClick('git')}
          style={activeSidebarTab === 'git' && sidebarOpen ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'git' && sidebarOpen
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Source Control / Git (Ctrl+Shift+G)"
        >
          {activeSidebarTab === 'git' && sidebarOpen && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <GitBranch style={{ width: "18px", height: "18px" }} />
          {modifiedCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-[#0c0d14] animate-pulse" />
          )}
        </button>

        {/* Snippets Library */}
        <button
          onClick={() => handleTabClick('snippets')}
          style={activeSidebarTab === 'snippets' && sidebarOpen ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'snippets' && sidebarOpen
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Snippet Library"
        >
          {activeSidebarTab === 'snippets' && sidebarOpen && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Sparkles style={{ width: "18px", height: "18px" }} />
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => handleTabClick('ai')}
          style={activeSidebarTab === 'ai' && sidebarOpen ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'ai' && sidebarOpen
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Zenith Studio AI Assistant"
        >
          {activeSidebarTab === 'ai' && sidebarOpen && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Bot style={{ width: "18px", height: "18px" }} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        {/* Run & Debug */}
        <button
          onClick={() => handleTabClick('debug')}
          style={activeSidebarTab === 'debug' && sidebarOpen ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'debug' && sidebarOpen
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Run & Debug (Ctrl+Shift+D)"
        >
          {activeSidebarTab === 'debug' && sidebarOpen && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Bug style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Extensions Marketplace */}
        <button
          onClick={() => handleTabClick('extensions')}
          style={activeSidebarTab === 'extensions' && sidebarOpen ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'extensions' && sidebarOpen
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Extensions Marketplace (Ctrl+Shift+X)"
        >
          {activeSidebarTab === 'extensions' && sidebarOpen && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Blocks style={{ width: "18px", height: "18px" }} />
          {installedExtensionsCount > 0 && (
            <span style={{ backgroundColor: currentAccent.primary }} className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[#0c0d14]" />
          )}
        </button>

        {/* AI Multi-File Composer */}
        <button
          onClick={() => useComposerStore.getState().setIsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:text-cyan-300 hover:bg-cyan-950/40 transition-all text-cyan-400 border border-cyan-500/30 shadow-sm"
          title="AI Composer (Multi-File Agent) — Ctrl+Shift+I"
        >
          <Sparkles style={{ width: "18px", height: "18px" }} />
        </button>



        {/* Integrated Terminal Button */}
        <button
          onClick={() => useTerminalStore.getState().toggleOpen()}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:text-cyan-300 hover:bg-slate-800/50 transition-all text-slate-400"
          title="Integrated Terminal (Ctrl+`)"
        >
          <Terminal style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Command Palette Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:text-slate-100 hover:bg-slate-800/50 transition-all text-slate-400"
          title="Command Palette (Ctrl+Shift+P)"
        >
          <Command style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Info */}
        <button
          onClick={() => setActiveSidebarTab('info')}
          style={activeSidebarTab === 'info' ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'info'
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Workspace & Platform Info"
        >
          {activeSidebarTab === 'info' && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Info style={{ width: "18px", height: "18px" }} />
        </button>
      </div>

      {/* Bottom Controls Section */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 max-h-[38vh] overflow-y-auto px-1" style={{ scrollbarWidth: 'thin' }}>
        {/* Keyboard Shortcuts Modal trigger */}
        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="p-2.5 rounded-lg hover:text-indigo-400 hover:bg-slate-800/60 transition"
          title="Keyboard Shortcuts Cheatsheet (F1)"
        >
          <Keyboard className="w-5 h-5" />
        </button>

        {/* Export Zip */}
        <button
          onClick={handleExportZip}
          className="p-2.5 rounded-lg hover:text-emerald-400 hover:bg-slate-800/60 transition"
          title="Download Workspace Zip"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Zen Mode Toggle */}
        <button
          onClick={toggleZenMode}
          className={`p-2.5 rounded-lg transition ${
            isZenMode ? 'text-amber-400 bg-slate-800' : 'hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
        >
          {isZenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2.5 rounded-lg hover:text-slate-200 hover:bg-slate-800/60 transition"
          title="Editor Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Platform badge */}
        <div className="pt-2 border-t border-slate-800 text-slate-500">
          {isDesktopEnv ? (
            <div title="Running natively in Desktop Electron">
              <Laptop className="w-4 h-4 text-emerald-400" />
            </div>
          ) : (
            <div title="Running in Web Browser (OPFS / IndexedDB)">
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
