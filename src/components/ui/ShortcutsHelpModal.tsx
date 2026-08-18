import React from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { X, Keyboard } from 'lucide-react';

export const ShortcutsHelpModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useSettingsStore();

  if (!isShortcutsModalOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navigation & Command Palette',
      shortcuts: [
        { key: 'Ctrl + P', desc: 'Quick Open File Switcher' },
        { key: 'Ctrl + G', desc: 'Go to Line Number (:line)' },
        { key: 'Ctrl + Shift + P', desc: 'Open Command Palette' },
        { key: 'Ctrl + R', desc: 'Switch Workspace / Recent Projects' },
        { key: 'Ctrl + B', desc: 'Toggle Primary Sidebar' },
        { key: 'Ctrl + ,', desc: 'Open Settings Preferences' },
        { key: 'Ctrl + Shift + X', desc: 'Extensions Marketplace' },
        { key: 'Ctrl + Shift + E', desc: 'Focus Explorer Sidebar' },
        { key: 'Ctrl + Shift + F', desc: 'Focus Global Search' },
        { key: 'Ctrl + Shift + G', desc: 'Focus Source Control (Git)' },
        { key: 'Ctrl + Shift + D', desc: 'Focus Run & Debugger' },
        { key: 'Ctrl + `', desc: 'Toggle Integrated Terminal' },
        { key: 'Ctrl + Shift + `', desc: 'Create New Terminal Session' },
        { key: 'F1 / Ctrl + /', desc: 'Show Keyboard Shortcuts' },
      ],
    },
    {
      title: 'Editor & File Actions',
      shortcuts: [
        { key: 'Ctrl + N', desc: 'New Untitled File' },
        { key: 'Ctrl + O', desc: 'Open File from System' },
        { key: 'Ctrl + Shift + O', desc: 'Open Folder from System' },
        { key: 'Ctrl + S', desc: 'Save Active File' },
        { key: 'Ctrl + Shift + S', desc: 'Save File As... (Choose Location)' },
        { key: 'Ctrl + W', desc: 'Close Active Tab' },
        { key: 'Ctrl + F', desc: 'Find in File' },
        { key: 'Ctrl + H', desc: 'Find & Replace in File' },
        { key: 'Shift + Alt + F', desc: 'Format Code / Document' },
        { key: 'Ctrl + I / Ctrl + Shift + I', desc: 'AI Composer Assistant' },
        { key: 'F5', desc: 'Start Debugging / Continue' },
        { key: 'Esc', desc: 'Close Modal / Exit Zen Mode' },
      ],
    },
    {
      title: 'Monaco Editor & Multi-Cursor',
      shortcuts: [
        { key: 'Alt + Click', desc: 'Add Multi-Cursor' },
        { key: 'Ctrl + Alt + Up/Down', desc: 'Add Line Above/Below' },
        { key: 'Ctrl + /', desc: 'Toggle Line Comment' },
        { key: 'Shift + Alt + Down', desc: 'Duplicate Line Down' },
      ],
    },
  ];

  return (
    <div onClick={() => setShortcutsModalOpen(false)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded-xl overflow-hidden font-sans text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#181825]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Keyboard Shortcuts Cheat Sheet</h2>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{group.title}</h3>
              <div className="space-y-1">
                {group.shortcuts.map((sc, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-900/60 rounded border border-slate-800 text-xs font-mono">
                    <span className="text-slate-300">{sc.desc}</span>
                    <kbd className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#181825]">
          <span className="text-[11px] text-slate-500">Press Esc to close window</span>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
