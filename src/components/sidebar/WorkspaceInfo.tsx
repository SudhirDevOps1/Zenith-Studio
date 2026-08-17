import React from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { isElectron } from '../../utils/fileUtils';
import { Laptop, Globe, Command, ShieldCheck, Database, FileCode, GitBranch, Star } from 'lucide-react';

export const WorkspaceInfo: React.FC = () => {
  const { files } = useFileStore();

  const totalFiles = files.filter(f => f.type === 'file').length;
  const totalFolders = files.filter(f => f.type === 'folder').length;
  const totalSizeChars = files.reduce((acc, curr) => acc + (curr.content?.length || 0), 0);

  const isDesktop = isElectron();

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800 text-slate-300 font-sans select-none overflow-y-auto">
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Environment & Info</span>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Environment Badge */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-100">
            {isDesktop ? <Laptop className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4 text-blue-400" />}
            <span>Mode: {isDesktop ? 'Native Desktop (Electron)' : 'Browser Mode (Web)'}</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {isDesktop
              ? 'Connected directly to Node.js filesystem APIs with native file open/save dialog support.'
              : 'Using IndexedDB and Virtual Origin Private File System for fast offline persistence in the browser.'}
          </p>
        </div>

        {/* Developer Profile */}
        <div className="p-3 bg-gradient-to-br from-blue-950/40 to-cyan-950/20 border border-blue-800/40 rounded-lg space-y-2">
          <div className="flex items-center gap-2 font-semibold text-white">
            <GitBranch className="w-4 h-4 text-cyan-300" />
            <span>Developer: SudhirDevOps1</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Official CodeStudio repository configured for GitHub profile SudhirDevOps1.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://codestudio-web-app.pages.dev/"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[10px] text-white font-medium transition flex items-center gap-1 shadow-sm"
            >
              <Globe className="w-3 h-3" /> Live Web App
            </a>
            <a
              href="https://github.com/SudhirDevOps1"
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-200 transition"
            >
              GitHub Profile
            </a>
            <a
              href="https://github.com/SudhirDevOps1/CodeStudio"
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] text-white transition flex items-center gap-1"
            >
              <Star className="w-3 h-3" /> Star Repo
            </a>
          </div>
        </div>

        {/* Workspace Stats */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Workspace Stats</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-white">{totalFiles}</div>
                <div className="text-[10px] text-slate-400">Total Files</div>
              </div>
            </div>
            <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-white">{totalFolders}</div>
                <div className="text-[10px] text-slate-400">Total Folders</div>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 px-1">
            Total content size: <span className="text-slate-200 font-mono">{(totalSizeChars / 1024).toFixed(1)} KB</span>
          </div>
        </div>

        {/* Shortcuts Cheat Sheet */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Command className="w-3.5 h-3.5 text-indigo-400" />
            <span>Shortcuts Cheatsheet</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between items-center bg-slate-900/50 p-1.5 rounded">
              <span>Command Palette</span>
              <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">Ctrl+Shift+P</kbd>
            </div>
            <div className="flex justify-between items-center bg-slate-900/50 p-1.5 rounded">
              <span>Save Active File</span>
              <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">Ctrl+S</kbd>
            </div>
            <div className="flex justify-between items-center bg-slate-900/50 p-1.5 rounded">
              <span>Quick Search</span>
              <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">Ctrl+F</kbd>
            </div>
            <div className="flex justify-between items-center bg-slate-900/50 p-1.5 rounded">
              <span>Close Tab</span>
              <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">Ctrl+W</kbd>
            </div>
          </div>
        </div>

        {/* Security & System Info */}
        <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg flex items-start gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>CodeStudio runs completely client-side in browser memory with zero server-side storage telemetry.</span>
        </div>
      </div>
    </div>
  );
};
