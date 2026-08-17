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
} from 'lucide-react';


export const ActivityBar: React.FC = () => {
  const {
    activeSidebarTab,
    setActiveSidebarTab,
    setSettingsOpen,
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    isZenMode,
    toggleZenMode,
    settings,
  } = useSettingsStore();

  const { files } = useFileStore();
  const currentAccent = ACCENT_PALETTE[settings.accentColor] || ACCENT_PALETTE.blue;

  const handleExportZip = async () => {
    try {
      const blob = await createZipFromFiles(files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codestudio-workspace-${Date.now()}.zip`;
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
          onClick={() => setActiveSidebarTab('explorer')}
          style={{ background: `linear-gradient(135deg, ${currentAccent.primary}, #4f46e5)`, width: '34px', height: '34px' }}
          className="rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg mb-2.5 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200"
          title="CodeStudio Home"
        >
          CS
        </div>

        {/* Explorer */}
        <button
          onClick={() => setActiveSidebarTab('explorer')}
          style={activeSidebarTab === 'explorer' ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'explorer'
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="File Explorer (Ctrl+Shift+E)"
        >
          {activeSidebarTab === 'explorer' && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Files style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Search */}
        <button
          onClick={() => setActiveSidebarTab('search')}
          style={activeSidebarTab === 'search' ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'search'
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Search in Workspace (Ctrl+Shift+F)"
        >
          {activeSidebarTab === 'search' && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Search style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Git Control */}
        <button
          onClick={() => setActiveSidebarTab('git')}
          style={activeSidebarTab === 'git' ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'git'
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Source Control / Git"
        >
          {activeSidebarTab === 'git' && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <GitBranch style={{ width: "18px", height: "18px" }} />
          {modifiedCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-[#0c0d14] animate-pulse" />
          )}
        </button>

        {/* Snippets Library */}
        <button
          onClick={() => setActiveSidebarTab('snippets')}
          style={activeSidebarTab === 'snippets' ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'snippets'
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Snippet Library"
        >
          {activeSidebarTab === 'snippets' && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Sparkles style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Extensions Marketplace */}
        <button
          onClick={() => setActiveSidebarTab('extensions')}
          style={activeSidebarTab === 'extensions' ? { backgroundColor: currentAccent.bgSubtle, borderColor: currentAccent.borderSubtle, color: currentAccent.primary } : {}}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative border ${
            activeSidebarTab === 'extensions'
              ? 'shadow-inner'
              : 'border-transparent hover:text-slate-100 hover:bg-slate-800/50 text-slate-400'
          }`}
          title="Extensions Marketplace (Ctrl+Shift+X)"
        >
          {activeSidebarTab === 'extensions' && (
            <span style={{ backgroundColor: currentAccent.primary, boxShadow: `0 0 8px ${currentAccent.glow}` }} className="absolute -left-1.5 top-2 bottom-2 w-1 rounded-r-full shadow-sm" />
          )}
          <Blocks style={{ width: "18px", height: "18px" }} />
          {installedExtensionsCount > 0 && (
            <span style={{ backgroundColor: currentAccent.primary }} className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[#0c0d14]" />
          )}
        </button>

        {/* Command Palette */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:text-slate-100 hover:bg-slate-800/50 transition-all text-slate-400"
          title="Command Palette (Ctrl+Shift+P)"
        >
          <Terminal style={{ width: "18px", height: "18px" }} />
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
