import React from 'react';
import { Play, Sparkles, Sliders } from 'lucide-react';
import { useTerminalStore } from '../../stores/useTerminalStore';

interface TerminalQuickBarProps {
  onRunCommand: (command: string) => void;
  onOpenSettings: () => void;
}

export const TerminalQuickBar: React.FC<TerminalQuickBarProps> = ({
  onRunCommand,
  onOpenSettings,
}) => {
  const { settings } = useTerminalStore();

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1019] border-t border-slate-800/80 overflow-x-auto no-scrollbar shrink-0 text-xs select-none">
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 shrink-0">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Quick Run:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto flex-1 no-scrollbar">
        {settings.quickCommands.map((qc) => (
          <button
            key={qc.id}
            onClick={() => onRunCommand(qc.command)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border transition-all hover:scale-[1.02] active:scale-95 shrink-0 ${
              qc.color || 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title={`Run: ${qc.command}`}
          >
            <Play className="w-2.5 h-2.5 fill-current opacity-70" />
            <span>{qc.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenSettings}
        className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition shrink-0 ml-1"
        title="Customize Terminal & Quick Runners"
      >
        <Sliders className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
