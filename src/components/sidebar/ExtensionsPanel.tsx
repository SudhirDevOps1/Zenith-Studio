import React, { useState } from 'react';
import { PackagePlus, CheckCircle2, Power, Search, ShieldCheck, Image, FileSpreadsheet, Terminal, Code2, Cloud } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useToastStore } from '../../stores/useToastStore';

interface ExtensionItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  builtIn: boolean;
  action?: () => void;
}

export const ExtensionsPanel: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { addToast } = useToastStore();
  const [query, setQuery] = useState('');

  const extensions: ExtensionItem[] = [
    {
      id: 'monaco-core',
      name: 'Monaco Editor Core',
      description: 'VS Code editor engine, syntax highlighting, minimap, multi-cursor.',
      icon: <Code2 className="w-4 h-4 text-blue-400" />,
      enabled: true,
      builtIn: true,
    },
    {
      id: 'media-preview',
      name: 'Media Preview Pack',
      description: 'Image, PDF, SVG, CSV, TSV, JSON, Excel previews built in.',
      icon: <Image className="w-4 h-4 text-purple-400" />,
      enabled: true,
      builtIn: true,
    },
    {
      id: 'spreadsheet',
      name: 'Spreadsheet Viewer',
      description: 'Preview CSV, TSV, JSON and XLSX data as fast virtual tables.',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
      enabled: true,
      builtIn: true,
    },
    {
      id: 'native-compiler',
      name: 'Native GCC / G++ Runner',
      description: 'Electron desktop only. Uses system gcc/g++ to compile and run C/C++.',
      icon: <Terminal className="w-4 h-4 text-orange-400" />,
      enabled: settings.enableNativeCompiler,
      builtIn: true,
      action: () => updateSettings({ enableNativeCompiler: !settings.enableNativeCompiler }),
    },
    {
      id: 'pyodide',
      name: 'Python Pyodide Runner',
      description: 'Optional offline-style Python execution in browser via Pyodide CDN.',
      icon: <Terminal className="w-4 h-4 text-yellow-400" />,
      enabled: settings.enablePyodideRunner,
      builtIn: true,
      action: () => updateSettings({ enablePyodideRunner: !settings.enablePyodideRunner }),
    },
    {
      id: 'cloudflare-sandbox',
      name: 'Cloudflare Sandbox Connector',
      description: 'Optional serverless sandbox endpoint for advanced secure code execution.',
      icon: <Cloud className="w-4 h-4 text-cyan-400" />,
      enabled: settings.enableCloudflareSandbox,
      builtIn: true,
      action: () => updateSettings({ enableCloudflareSandbox: !settings.enableCloudflareSandbox }),
    },
  ];

  const filtered = extensions.filter((ext) =>
    ext.name.toLowerCase().includes(query.toLowerCase()) ||
    ext.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none overflow-y-auto">
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e] flex items-center gap-2">
        <PackagePlus className="w-4 h-4 text-cyan-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Extensions</span>
      </div>

      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search built-in extensions..."
            className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="p-3 space-y-2">
        {filtered.map((ext) => (
          <div key={ext.id} className="p-3 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-lg space-y-2 transition">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">{ext.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-white truncate">{ext.name}</h3>
                  {ext.builtIn && (
                    <span className="text-[9px] uppercase bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 rounded px-1.5 py-0.5">
                      Built-in
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{ext.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className={`flex items-center gap-1 text-[10px] ${ext.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                {ext.enabled ? <CheckCircle2 className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                {ext.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                disabled={!ext.action}
                onClick={() => {
                  ext.action?.();
                  addToast({ type: 'info', title: 'Extension Preference Updated', message: `${ext.name} preference changed.` });
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded text-[10px] transition"
              >
                {ext.action ? (ext.enabled ? 'Disable' : 'Enable') : 'Core'}
              </button>
            </div>
          </div>
        ))}

        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-start gap-2 text-[11px] text-emerald-200">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>All built-in extensions run locally. Optional Cloudflare Sandbox works only when you add your own endpoint in Settings.</span>
        </div>
      </div>
    </div>
  );
};