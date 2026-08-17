import { useSettingsStore } from '../../stores/useSettingsStore';
import { useFileStore } from '../../stores/useFileStore';
import { useExtensionStore } from '../../stores/useExtensionStore';
import { createZipFromFiles, isElectron } from '../../utils/fileUtils';
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
  } = useSettingsStore();

  const { files } = useFileStore();

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
    <div className="w-12 h-full min-h-0 bg-[#14141f] border-r border-slate-800/80 flex flex-col justify-between items-center py-2 text-slate-400 select-none shrink-0 z-20 overflow-hidden">
      {/* Top Main Section */}
      <div className="flex flex-col items-center gap-1.5 overflow-y-auto pr-0.5 min-h-0 w-full px-1" style={{ scrollbarWidth: 'thin' }}>
        {/* Logo Icon */}
        <div
          onClick={() => setActiveSidebarTab('explorer')}
          className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md mb-2 cursor-pointer hover:scale-105 transition"
          title="CodeStudio Home"
        >
          CS
        </div>

        {/* Explorer */}
        <button
          onClick={() => setActiveSidebarTab('explorer')}
          className={`p-2.5 rounded-lg transition relative ${
            activeSidebarTab === 'explorer'
              ? 'bg-slate-800 text-blue-400 border-l-2 border-blue-500'
              : 'hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="File Explorer (Ctrl+Shift+E)"
        >
          <Files className="w-5 h-5" />
        </button>

        {/* Search */}
        <button
          onClick={() => setActiveSidebarTab('search')}
          className={`p-2.5 rounded-lg transition relative ${
            activeSidebarTab === 'search'
              ? 'bg-slate-800 text-blue-400 border-l-2 border-blue-500'
              : 'hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Search in Workspace (Ctrl+Shift+F)"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Git Control */}
        <button
          onClick={() => setActiveSidebarTab('git')}
          className={`p-2.5 rounded-lg transition relative ${
            activeSidebarTab === 'git'
              ? 'bg-slate-800 text-orange-400 border-l-2 border-orange-500'
              : 'hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Source Control / Git"
        >
          <GitBranch className="w-5 h-5" />
          {modifiedCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          )}
        </button>

        {/* Snippets Library */}
        <button
          onClick={() => setActiveSidebarTab('snippets')}
          className={`p-2.5 rounded-lg transition relative ${
            activeSidebarTab === 'snippets'
              ? 'bg-slate-800 text-purple-400 border-l-2 border-purple-500'
              : 'hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Snippet Library"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Extensions Marketplace */}
        <button
          onClick={() => setActiveSidebarTab('extensions')}
          className={`p-2.5 rounded-lg transition relative ${
            activeSidebarTab === 'extensions'
              ? 'bg-slate-800 text-cyan-400 border-l-2 border-cyan-500'
              : 'hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Extensions Marketplace (Ctrl+Shift+X)"
        >
          <Blocks className="w-5 h-5" />
          {installedExtensionsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>

        {/* Command Palette */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-2.5 rounded-lg hover:text-slate-200 hover:bg-slate-800/60 transition"
          title="Command Palette (Ctrl+Shift+P)"
        >
          <Terminal className="w-5 h-5" />
        </button>

        {/* Info */}
        <button
          onClick={() => setActiveSidebarTab('info')}
          className={`p-2.5 rounded-lg transition relative ${
            activeSidebarTab === 'info'
              ? 'bg-slate-800 text-blue-400 border-l-2 border-blue-500'
              : 'hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Workspace & Platform Info"
        >
          <Info className="w-5 h-5" />
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
