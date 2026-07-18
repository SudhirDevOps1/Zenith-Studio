import React from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useToastStore } from '../../stores/useToastStore';
import { getLanguageFromExtension, isElectron } from '../../utils/fileUtils';
import { Terminal, Check, RefreshCw, Cpu, HardDrive, Columns, Maximize2, FileCode2 } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { files, activeFileId, saveCurrentFile, setActivePreviewMode, activePreviewMode } = useFileStore();
  const { settings, toggleZenMode, setCommandPaletteOpen } = useSettingsStore();
  const { addToast } = useToastStore();

  const activeFile = files.find(f => f.id === activeFileId);
  const language = activeFile ? getLanguageFromExtension(activeFile.extension || '') : 'Plain Text';
  const charCount = activeFile?.content?.length || 0;
  const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 0;
  const isDesktop = isElectron();

  const handleSave = () => {
    saveCurrentFile();
    addToast({ type: 'success', title: 'File Saved', message: `Saved ${activeFile?.name || 'file'} to local storage.` });
  };

  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] font-mono select-none shrink-0 z-20">
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
          <div className="flex items-center gap-2 text-blue-100">
            <span className="flex items-center gap-1">
              <FileCode2 className="w-3 h-3" /> Lines: {lineCount}
            </span>
            <span>Chars: {charCount}</span>
          </div>
        )}
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3 text-blue-100">
        {activeFile && (
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition" onClick={handleSave}>
            {activeFile.isModified ? (
              <span className="flex items-center gap-1 text-amber-200">
                <RefreshCw className="w-3 h-3 animate-spin-slow" /> Unsaved — Click to Save
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-200">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
        )}

        <span className="cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition">Spaces: {settings.tabSize}</span>
        <span>UTF-8</span>

        {/* Language Badge */}
        <span
          className="uppercase font-semibold bg-white/20 px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-white/30 transition"
          title={`Editing in ${language}`}
        >
          {language}
        </span>

        {/* Split View Indicators */}
        {activeFile && (activeFile.extension === 'md' || activeFile.extension === 'html' || activeFile.extension === 'js' || activeFile.extension === 'ts') && (
          <>
            <button
              onClick={() => setActivePreviewMode(activePreviewMode === 'off' ? 'auto' : 'off')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition ${
                activePreviewMode !== 'off' ? 'bg-white/30 font-bold' : 'bg-white/10 hover:bg-white/20'
              }`}
              title={activePreviewMode === 'off' ? 'Enable Preview' : 'Disable Preview'}
            >
              <Columns className="w-3 h-3" />
              Preview
            </button>
            <button
              onClick={() => setActivePreviewMode(activePreviewMode === 'split-edit' ? 'auto' : 'split-edit')}
              className={`px-1.5 py-0.5 rounded text-[10px] transition ${
                activePreviewMode === 'split-edit' ? 'bg-white/30 font-bold' : 'bg-white/10 hover:bg-white/20'
              }`}
              title="Split Code & Preview"
            >
              <Maximize2 className="w-3 h-3 inline" />
            </button>
          </>
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
