import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Type,
  Terminal,
  Plus,
  Trash2,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  useTerminalStore,
  TERMINAL_THEMES,
  TerminalThemeId,
} from '../../stores/useTerminalStore';

interface TerminalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalSettingsModal: React.FC<TerminalSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, addQuickCommand, removeQuickCommand, resetSettings } =
    useTerminalStore();

  const [newCmdLabel, setNewCmdLabel] = useState('');
  const [newCmdCode, setNewCmdCode] = useState('');

  if (!isOpen) return null;

  const handleAddQuickCmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmdLabel.trim() || !newCmdCode.trim()) return;
    addQuickCommand(newCmdLabel.trim(), newCmdCode.trim());
    setNewCmdLabel('');
    setNewCmdCode('');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0e0f17] border border-cyan-500/40 shadow-2xl rounded-2xl flex flex-col overflow-hidden text-slate-200 font-sans animate-fade-in-up"
        style={{
          boxShadow: '0 0 40px rgba(6, 182, 212, 0.15), 0 20px 40px -15px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#12131f] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Terminal Customization
              </h2>
              <p className="text-[11px] text-slate-400">
                Customize themes, typography, prompt glyphs, and 1-click runners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div
          className="p-5 space-y-5 overflow-y-auto max-h-[72vh] text-xs"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* 1. THEMES */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              Terminal Color Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(TERMINAL_THEMES) as TerminalThemeId[]).map((themeKey) => {
                const t = TERMINAL_THEMES[themeKey];
                const isSelected = settings.theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => updateSettings({ theme: themeKey })}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                        : 'border-slate-800 bg-[#141522] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: t.promptColor }}
                      />
                      {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200 truncate">
                      {t.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. TYPOGRAPHY */}
          <div className="space-y-3 p-3.5 bg-[#141522] border border-slate-800/80 rounded-xl">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              Typography &amp; Cursor
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Font Family */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Font Family</span>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                  className="w-full bg-[#181a2b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="'Fira Code', 'Cascadia Code', monospace">Fira Code</option>
                  <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                  <option value="'Cascadia Code', monospace">Cascadia Code</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="monospace">Default Monospace</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Font Size</span>
                  <span className="text-[10px] font-mono text-cyan-400">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={18}
                  step={1}
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Cursor Style */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Cursor Style</span>
                <select
                  value={settings.cursorStyle}
                  onChange={(e) =>
                    updateSettings({
                      cursorStyle: e.target.value as 'block' | 'line' | 'underline',
                    })
                  }
                  className="w-full bg-[#181a2b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="block">Block (█)</option>
                  <option value="line">Line (|)</option>
                  <option value="underline">Underline (_)</option>
                </select>
              </div>

              {/* Prompt Symbol */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Prompt Symbol</span>
                <div className="flex items-center gap-1.5">
                  {['❯', '➜', '$', '>', 'λ', '⚡'].map((glyph) => (
                    <button
                      key={glyph}
                      type="button"
                      onClick={() => updateSettings({ promptGlyph: glyph })}
                      className={`flex-1 py-1 rounded-md text-center text-xs font-mono font-bold transition ${
                        settings.promptGlyph === glyph
                          ? 'bg-cyan-500 text-black shadow'
                          : 'bg-[#181a2b] hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {glyph}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timestamps toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-300">Show Output Timestamps</span>
              <button
                type="button"
                onClick={() => updateSettings({ showTimestamps: !settings.showTimestamps })}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.showTimestamps ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.showTimestamps ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. QUICK COMMANDS MANAGER */}
          <div className="space-y-2.5 p-3.5 bg-[#141522] border border-slate-800/80 rounded-xl">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Quick Command Runners
            </label>

            {/* Add New Command Form */}
            <form onSubmit={handleAddQuickCmd} className="flex gap-2">
              <input
                type="text"
                value={newCmdLabel}
                onChange={(e) => setNewCmdLabel(e.target.value)}
                placeholder="Button Label (e.g. Git Pull)"
                className="w-1/3 bg-[#181a2b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={newCmdCode}
                onChange={(e) => setNewCmdCode(e.target.value)}
                placeholder="Command (e.g. git pull origin main)"
                className="flex-1 bg-[#181a2b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!newCmdLabel.trim() || !newCmdCode.trim()}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            {/* List of current quick commands */}
            <div className="space-y-1 max-h-36 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {settings.quickCommands.map((qc) => (
                <div
                  key={qc.id}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-[#181a2b] rounded-lg border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-cyan-300">{qc.label}</span>
                    <span className="text-slate-500 font-mono text-[10px] truncate">
                      {qc.command}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuickCommand(qc.id)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded transition shrink-0"
                    title="Delete runner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#12131f] flex items-center justify-between">
          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
