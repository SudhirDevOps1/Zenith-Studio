import React from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { ThemeMode, AccentColor } from '../../types/settings';
import { ACCENT_PALETTE } from '../../utils/accentThemes';
import { X, Settings, RotateCcw, Palette, Sliders, Type, Layout, Terminal, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings, resetSettings } = useSettingsStore();

  if (!isSettingsOpen) return null;

  const currentAccent = ACCENT_PALETTE[settings.accentColor] || ACCENT_PALETTE.blue;

  const accentColors: Array<{ id: AccentColor; name: string; bg: string }> = [
    { id: 'blue', name: 'Electric Blue', bg: 'bg-blue-600' },
    { id: 'purple', name: 'Deep Purple', bg: 'bg-purple-600' },
    { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-600' },
    { id: 'amber', name: 'Warm Amber', bg: 'bg-amber-600' },
    { id: 'rose', name: 'Neon Rose', bg: 'bg-rose-600' },
    { id: 'cyan', name: 'Cyan Teal', bg: 'bg-cyan-600' },
  ];

  return (
    <div onClick={() => setSettingsOpen(false)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-[#141524] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden text-slate-200 font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0f1019]">
          <div className="flex items-center gap-2">
            <Settings style={{ color: currentAccent.primary }} className="w-5 h-5" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">CodeStudio Preferences</h2>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Accent Color Section */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-400" /> UI Accent Color
              </span>
              <span style={{ color: currentAccent.primary }} className="text-[11px] font-mono font-bold capitalize">
                Active: {currentAccent.name}
              </span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {accentColors.map((color) => {
                const isSelected = settings.accentColor === color.id;
                const palette = ACCENT_PALETTE[color.id];
                return (
                  <button
                    key={color.id}
                    onClick={() => updateSettings({ accentColor: color.id })}
                    style={
                      isSelected
                        ? {
                            borderColor: palette.primary,
                            backgroundColor: palette.bgSubtle,
                            boxShadow: `0 0 12px ${palette.glow}`,
                          }
                        : {}
                    }
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'scale-105 ring-2 ring-white/20'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full ${color.bg} shadow-md flex items-center justify-center ${isSelected ? 'ring-2 ring-white scale-110' : ''} transition-transform`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className={`text-[10px] capitalize ${isSelected ? 'text-white font-bold' : 'text-slate-400'}`}>{color.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" /> Color Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as ThemeMode })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition font-mono"
            >
              <option value="vs-dark">VS Code Dark (Default)</option>
              <option value="one-dark-pro">One Dark Pro (Atom / Marketplace)</option>
              <option value="catppuccin">Catppuccin Macchiato (Marketplace)</option>
              <option value="tokyo-night">Tokyo Night (Marketplace)</option>
              <option value="synthwave-84">SynthWave '84 (Neon Glow / Marketplace)</option>
              <option value="dracula">Dracula Official</option>
              <option value="nord">Nord Arctic</option>
              <option value="monokai">Monokai Pro</option>
              <option value="github-dark">GitHub Dark</option>
              <option value="light">VS Code Light</option>
            </select>
          </div>

          {/* Font Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-400" /> Editor Typography
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400">Font Size ({settings.fontSize}px)</label>
                <input
                  type="range"
                  min="10"
                  max="28"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Tab Size</label>
                <select
                  value={settings.tabSize}
                  onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400">Font Family</label>
              <input
                type="text"
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Auto-save & Brackets */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-amber-400" /> Editor Behavior
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400">Auto Save Strategy</label>
                <select
                  value={settings.autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="afterDelay">After Delay</option>
                  <option value="off">Off (Manual Save)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Auto Save Interval</label>
                <select
                  value={settings.autoSaveDelay}
                  onChange={(e) => updateSettings({ autoSaveDelay: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition"
                >
                  <option value={1000}>1 Second</option>
                  <option value={2000}>2 Seconds</option>
                  <option value={5000}>5 Seconds</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400">Auto Closing Brackets</label>
                <select
                  value={settings.autoClosingBrackets}
                  onChange={(e) => updateSettings({ autoClosingBrackets: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="always">Always</option>
                  <option value="languageDefined">Language Defined</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Cursor Style</label>
                <select
                  value={settings.cursorStyle}
                  onChange={(e) => updateSettings({ cursorStyle: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="line">Line (|)</option>
                  <option value="block">Block (█)</option>
                  <option value="underline">Underline (_)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-slate-300">Show Minimap Sidebar</span>
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => updateSettings({ minimap: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-slate-300">Enable Word Wrap</span>
              <input
                type="checkbox"
                checked={settings.wordWrap === 'on'}
                onChange={(e) => updateSettings({ wordWrap: e.target.checked ? 'on' : 'off' })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-slate-300">Show Navigation Breadcrumbs</span>
              <input
                type="checkbox"
                checked={settings.showBreadcrumbs}
                onChange={(e) => updateSettings({ showBreadcrumbs: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Code Execution Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" /> Code Execution & Compilers
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-slate-300 block">Native GCC/G++ Runner</span>
                <span className="text-[10px] text-slate-500">Electron desktop only. Requires gcc/g++ installed in PATH.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableNativeCompiler}
                onChange={(e) => updateSettings({ enableNativeCompiler: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-slate-300 block">Python Pyodide Runner</span>
                <span className="text-[10px] text-slate-500">Optional browser Python runner. Loads Pyodide from CDN when first used.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePyodideRunner}
                onChange={(e) => updateSettings({ enablePyodideRunner: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-slate-300 block">Cloudflare Sandbox Connector</span>
                <span className="text-[10px] text-slate-500">Optional serverless execution using your own Worker endpoint.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableCloudflareSandbox}
                onChange={(e) => updateSettings({ enableCloudflareSandbox: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>

            <div className="space-y-1.5">
              <label className="text-slate-400">Cloudflare Sandbox Endpoint</label>
              <input
                type="url"
                value={settings.cloudflareSandboxEndpoint}
                onChange={(e) => updateSettings({ cloudflareSandboxEndpoint: e.target.value })}
                placeholder="https://your-worker.your-subdomain.workers.dev/run"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono outline-none focus:border-blue-500 transition placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#181825]">
          <button
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={() => setSettingsOpen(false)}
            style={{ backgroundColor: currentAccent.primary }}
            className="px-5 py-1.5 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
