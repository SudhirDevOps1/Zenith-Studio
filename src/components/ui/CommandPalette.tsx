import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useFileStore } from '../../stores/useFileStore';
import { useExtensionStore } from '../../stores/useExtensionStore';
import { useDialogStore } from '../../stores/useDialogStore';
import { ThemeMode } from '../../types/settings';
import { createZipFromFiles } from '../../utils/fileUtils';
import {
  Terminal,
  FilePlus,
  FolderPlus,
  Save,
  Maximize2,
  Settings,
  Download,
  RotateCcw,
  Sun,
  X,
  Layers,
  Blocks,
  Globe,
  Bot,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

import { useDiagnosticsStore } from '../../stores/useDiagnosticsStore';
import { formatCode } from '../../utils/codeFormatter';
import { AiSetupModal } from './AiSetupModal';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  action: () => void | Promise<void>;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, setSettingsOpen, toggleZenMode, updateSettings, setActiveSidebarTab, settings } = useSettingsStore();
  const { createFile, createFolder, saveCurrentFile, saveAllFiles, resetToDefaultFiles, files, closeTab, closeAllTabs, activeFileId, updateFileContent, setActivePreviewMode, openSystemFile, openSystemFolder } = useFileStore();
  const { setActiveTab } = useExtensionStore();
  const { toggleProblemsOpen } = useDiagnosticsStore();
  const { openDialog } = useDialogStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAiSetup, setShowAiSetup] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId);

  const commands: CommandItem[] = [
    {
      id: 'ai-assistant',
      title: 'AI: Open Zenith Studio AI Assistant Chat',
      category: 'AI & Copilot',

      icon: <Bot className="w-4 h-4 text-cyan-400" />,
      shortcut: 'Ctrl+Shift+A',
      action: () => {
        setActiveSidebarTab('ai');
      },
    },
    {
      id: 'ai-setup',
      title: 'AI: Setup Provider, API Keys & Auto-Detect Models...',
      category: 'AI & Copilot',
      icon: <SlidersHorizontal className="w-4 h-4 text-purple-400" />,
      action: () => {
        setShowAiSetup(true);
      },
    },

    {
      id: 'format-document',
      title: 'Format: Format Document (Prettier Engine)',
      category: 'Format',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      shortcut: 'Shift+Alt+F',
      action: () => {
        if (activeFile && activeFile.content) {
          const res = formatCode(activeFile.content, activeFile.extension || 'js', settings.tabSize || 2);
          if (res.formatted) {
            updateFileContent(activeFile.id, res.formatted);
          }
        }
      },
    },

    {
      id: 'problems-panel',
      title: 'View: Toggle Problems & Diagnostics Panel',
      category: 'View',
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
      action: () => {
        toggleProblemsOpen();
      },
    },

    {
      id: 'open-webview',
      title: 'Simple Browser: Show / Open Webview (Internet & Localhost)',
      category: 'View',
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActivePreviewMode('webview');
      },
    },
    {
      id: 'open-extensions',
      title: 'Extensions: Open Extensions Marketplace',
      category: 'Extensions',
      icon: <Blocks className="w-4 h-4 text-cyan-400" />,
      shortcut: 'Ctrl+Shift+X',
      action: () => {
        setActiveSidebarTab('extensions');
        setActiveTab('marketplace');
      },
    },
    {
      id: 'show-installed-extensions',
      title: 'Extensions: Show Installed Extensions',
      category: 'Extensions',
      icon: <Blocks className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveSidebarTab('extensions');
        setActiveTab('installed');
      },
    },
    {
      id: 'quick-open',
      title: 'File: Quick Open, Go to File...',
      category: 'File Operations',
      icon: <FilePlus className="w-4 h-4 text-cyan-400" />,
      shortcut: 'Ctrl+P',
      action: () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', ctrlKey: true }));
      },
    },
    {
      id: 'goto-line',
      title: 'Go to Line Number in Editor (:line)...',
      category: 'Navigation',
      icon: <Terminal className="w-4 h-4 text-amber-400" />,
      shortcut: 'Ctrl+G',
      action: () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true }));
      },
    },
    {
      id: 'workspace-search',
      title: 'Search: Find and Replace in Files',
      category: 'Search',
      icon: <Terminal className="w-4 h-4 text-blue-400" />,
      shortcut: 'Ctrl+Shift+F',
      action: () => {
        setActiveSidebarTab('search');
      },
    },
    {
      id: 'open-file',
      title: 'Open File from System...',
      category: 'File Operations',
      icon: <FilePlus className="w-4 h-4 text-cyan-400" />,
      shortcut: 'Ctrl+O',
      action: () => openSystemFile(),
    },
    {
      id: 'open-folder',
      title: 'Open Folder from System...',
      category: 'File Operations',
      icon: <FolderPlus className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Ctrl+Shift+O',
      action: () => openSystemFolder(),
    },
    {
      id: 'new-file',
      title: 'Create New File',
      category: 'File Operations',
      icon: <FilePlus className="w-4 h-4 text-blue-400" />,
      action: async () => {
        const filename = await openDialog({ type: 'file', title: 'Create New File', message: 'Enter filename with extension.', placeholder: 'app.tsx', confirmText: 'Create File', cancelText: 'Cancel' });
        if (filename) createFile(filename, null);
      },
    },
    {
      id: 'new-folder',
      title: 'Create New Folder',
      category: 'File Operations',
      icon: <FolderPlus className="w-4 h-4 text-amber-400" />,
      action: async () => {
        const folderName = await openDialog({ type: 'folder', title: 'Create New Folder', message: 'Enter folder name.', placeholder: 'components', confirmText: 'Create Folder', cancelText: 'Cancel' });
        if (folderName) createFolder(folderName, null);
      },
    },
    {
      id: 'save-file',
      title: 'Save Active File',
      category: 'File Operations',
      icon: <Save className="w-4 h-4 text-emerald-400" />,
      shortcut: 'Ctrl+S',
      action: () => saveCurrentFile(),
    },
    {
      id: 'save-all',
      title: 'Save All Modified Files',
      category: 'File Operations',
      icon: <Save className="w-4 h-4 text-emerald-500" />,
      action: () => saveAllFiles(),
    },
    {
      id: 'toggle-zen',
      title: 'Toggle Zen Mode (Distraction-Free)',
      category: 'View',
      icon: <Maximize2 className="w-4 h-4 text-purple-400" />,
      action: () => toggleZenMode(),
    },
    {
      id: 'open-settings',
      title: 'Open Settings & Preferences',
      category: 'Preferences',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      action: () => setSettingsOpen(true),
    },
    {
      id: 'export-zip',
      title: 'Export Workspace as ZIP Archive',
      category: 'Export',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      action: async () => {
        const blob = await createZipFromFiles(files);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zenith-studio-workspace.zip';
        a.click();
      },
    },
    {
      id: 'split-preview',
      title: 'Set Preview Mode to Split Edit',
      category: 'View',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      action: () => setActivePreviewMode('split-edit'),
    },
    {
      id: 'preview-only',
      title: 'Set Preview Mode to Full Preview',
      category: 'View',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      action: () => setActivePreviewMode('preview-only'),
    },
    {
      id: 'theme-dracula',
      title: 'Theme: Dracula',
      category: 'Themes',
      icon: <Sun className="w-4 h-4 text-pink-400" />,
      action: () => updateSettings({ theme: 'dracula' as ThemeMode }),
    },
    {
      id: 'theme-vs-dark',
      title: 'Theme: VS Code Dark',
      category: 'Themes',
      icon: <Sun className="w-4 h-4 text-blue-400" />,
      action: () => updateSettings({ theme: 'vs-dark' as ThemeMode }),
    },
    {
      id: 'theme-nord',
      title: 'Theme: Nord',
      category: 'Themes',
      icon: <Sun className="w-4 h-4 text-teal-400" />,
      action: () => updateSettings({ theme: 'nord' as ThemeMode }),
    },
    {
      id: 'close-tab',
      title: 'Close Active Tab',
      category: 'Tabs',
      icon: <X className="w-4 h-4 text-rose-400" />,
      shortcut: 'Ctrl+W',
      action: () => {
        if (activeFileId) closeTab(activeFileId);
      },
    },
    {
      id: 'close-all-tabs',
      title: 'Close All Tabs',
      category: 'Tabs',
      icon: <X className="w-4 h-4 text-rose-400" />,
      action: () => closeAllTabs(),
    },
    {
      id: 'reset-workspace',
      title: 'Reset Workspace to Default Sample Project',
      category: 'System',
      icon: <RotateCcw className="w-4 h-4 text-amber-400" />,
      action: async () => {
        const ok = await openDialog({ type: 'confirm', title: 'Reset Workspace', message: 'Reset virtual files to the default Zenith Studio sample project?', confirmText: 'Reset', cancelText: 'Cancel' });
        if (ok !== null) {
          resetToDefaultFiles();
        }
      },
    },

  ];

  const filteredCommands = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setCommandPaletteOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div onClick={() => setCommandPaletteOpen(false)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded-xl overflow-hidden font-sans text-slate-200">
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-[#181825]">
          <Terminal className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-white placeholder-slate-500 outline-none text-sm font-mono"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Close Command Palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No commands matching &quot;{query}&quot;</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setCommandPaletteOpen(false);
                    setQuery('');
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition ${
                    isSelected ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cmd.icon}
                    <span>{cmd.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AiSetupModal isOpen={showAiSetup} onClose={() => setShowAiSetup(false)} />
    </div>
  );
};

