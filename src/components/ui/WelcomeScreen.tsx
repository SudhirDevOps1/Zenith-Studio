import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useDialogStore } from '../../stores/useDialogStore';
import {
  Code2,
  FileText,
  LayoutTemplate,
  Terminal,
  Palette,
  Shield,
  FilePlus,
  FolderOpen,
  Upload,
  Globe,
  Moon,
  Command,
  FileCode2,
  Type,
  FileArchive,
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { createFile, createFolder, files, openFileInTab, importFilesFromOS } = useFileStore();
  const { openDialog } = useDialogStore();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      id: 'editor',
      icon: <Code2 className="w-6 h-6 text-blue-400" />,
      title: 'VS Code Monaco Editor',
      desc: 'Full IntelliSense, syntax highlighting, and 100+ languages supported.',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      border: 'border-blue-500/20',
    },
    {
      id: 'markdown',
      icon: <Type className="w-6 h-6 text-sky-400" />,
      title: 'Markdown + Mermaid',
      desc: 'Live preview with synchronized scroll and beautiful diagram rendering.',
      gradient: 'from-sky-500/10 to-teal-500/10',
      border: 'border-sky-500/20',
    },
    {
      id: 'html-sandbox',
      icon: <LayoutTemplate className="w-6 h-6 text-orange-400" />,
      title: 'HTML Live Sandbox',
      desc: 'Instant preview with mobile, tablet, and desktop viewport testing.',
      gradient: 'from-orange-500/10 to-red-500/10',
      border: 'border-orange-500/20',
    },
    {
      id: 'js-console',
      icon: <Terminal className="w-6 h-6 text-emerald-400" />,
      title: 'Interactive JS Console',
      desc: 'Run JavaScript & TypeScript code with live logging and benchmarks.',
      gradient: 'from-emerald-500/10 to-green-500/10',
      border: 'border-emerald-500/20',
    },
    {
      id: 'themes',
      icon: <Palette className="w-6 h-6 text-purple-400" />,
      title: '6 Premium Themes',
      desc: 'VS Dark, Dracula, Nord, Monokai, GitHub Dark, and Light mode.',
      gradient: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-500/20',
    },
    {
      id: 'filesystem',
      icon: <Shield className="w-6 h-6 text-cyan-400" />,
      title: 'File System & Export',
      desc: 'IndexedDB persistence, drag-drop upload, ZIP auto-extract support.',
      gradient: 'from-cyan-500/10 to-blue-500/10',
      border: 'border-cyan-500/20',
    },
  ];

  const handleCreateFile = async () => {
    const result = await openDialog({
      type: 'file',
      title: 'Create New File',
      message: 'Enter the filename with extension',
      placeholder: 'app.tsx',
      confirmText: 'Create',
      cancelText: 'Cancel',
    });

    if (result) {
      createFile(result, null);
    }
  };

  const handleCreateFolder = async () => {
    const result = await openDialog({
      type: 'folder',
      title: 'Create New Folder',
      message: 'Enter the folder name',
      placeholder: 'my-project',
      confirmText: 'Create',
      cancelText: 'Cancel',
    });

    if (result) {
      createFolder(result, null);
    }
  };

  const handleUploadFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';
    input.onchange = async (e: any) => {
      const files = e.target.files;
      if (files) {
        importFilesFromOS(files);
      }
    };
    input.click();
  };

  const recentFiles = files
    .filter((f: any) => f.type === 'file')
    .slice(-4)
    .reverse();

  const shortcuts = [
    { keys: 'Ctrl+Shift+P', label: 'Command Palette' },
    { keys: 'Ctrl+S', label: 'Save File' },
    { keys: 'Ctrl+W', label: 'Close Tab' },
    { keys: 'Ctrl+F', label: 'Find & Replace' },
    { keys: 'Ctrl+Shift+E', label: 'Explorer' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto bg-gradient-to-br from-[#0f0f1a] via-[#14141f] to-[#0f0f1a]">
      <div className="max-w-4xl w-full p-8 space-y-10 animate-fade-in-up">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-blue-500/20 mb-2">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              CodeStudio
            </span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Next-gen universal code editor powered by <span className="text-blue-400 font-semibold">Monaco</span>,{' '}
            <span className="text-purple-400 font-semibold">React</span>, and{' '}
            <span className="text-emerald-400 font-semibold">Tailwind CSS</span>. Works in browser and as a desktop app.
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-slate-500">
            <span className="px-2 py-0.5 bg-slate-800/80 rounded-full border border-slate-700/60">v1.0.0</span>
            <span className="px-2 py-0.5 bg-slate-800/80 rounded-full border border-slate-700/60 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 text-blue-400" /> Web Ready
            </span>
            <span className="px-2 py-0.5 bg-slate-800/80 rounded-full border border-slate-700/60 flex items-center gap-1">
              <Moon className="w-2.5 h-2.5 text-purple-400" /> Dark Theme
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleCreateFile}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#252535] border border-slate-800 hover:border-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition shadow-md hover:shadow-lg"
          >
            <FilePlus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
            <span>New File</span>
          </button>
          <button
            onClick={handleCreateFolder}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#252535] border border-slate-800 hover:border-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition shadow-md hover:shadow-lg"
          >
            <FolderOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
            <span>New Folder</span>
          </button>
          <button
            onClick={handleUploadFiles}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#1e1e2e] hover:bg-[#252535] border border-slate-800 hover:border-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition shadow-md hover:shadow-lg"
          >
            <Upload className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            <span>Upload / ZIP</span>
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-4">
            ✨ Core Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((f) => (
              <div
                key={f.id}
                onMouseEnter={() => setHoveredCard(f.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-4 rounded-xl border ${f.border} bg-gradient-to-br ${f.gradient} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default`}
              >
                <div className={`mb-2 transition-transform duration-300 ${hoveredCard === f.id ? 'scale-110' : ''}`}>
                  {f.icon}
                </div>
                <h3 className="text-xs font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files + Shortcuts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Files */}
          {recentFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5" /> Recent Files
              </h3>
              {recentFiles.map((file: any) => (
                <button
                  key={file.id}
                  onClick={() => openFileInTab(file.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[#181825] hover:bg-[#1e1e2e] border border-slate-800/60 hover:border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition text-left group"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition" />
                  <span className="truncate flex-1 font-mono">{file.name}</span>
                  {file.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </button>
              ))}
            </div>
          )}

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5" /> Quick Shortcuts
            </h3>
            <div className="space-y-1">
              {shortcuts.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-[#181825] rounded-lg border border-slate-800/40">
                  <span className="text-[11px] text-slate-300">{s.label}</span>
                  <kbd className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ZIP Upload Info */}
        <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-lg flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <FileArchive className="w-4 h-4 text-amber-400" />
          <span>Tip: You can drag & drop ZIP files to auto-extract them!</span>
        </div>

        {/* Bottom Footer */}
        <div className="text-center text-[10px] text-slate-600 space-y-1">
          <p>Built with React 19 • Vite 7 • Tailwind CSS 4 • Monaco Editor</p>
          <p>Works offline • Zero backend • Privacy-first • All client-side</p>
        </div>
      </div>
    </div>
  );
};
