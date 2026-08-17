import React, { useState } from 'react';
import {
  Play,
  Pause,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Square,
  GripHorizontal,
} from 'lucide-react';
import { useDebugStore } from '../../stores/useDebugStore';

export const DebugToolbar: React.FC = () => {
  const {
    sessionState,
    continueExecution,
    pauseExecution,
    stepOver,
    stepInto,
    stepOut,
    restartDebugging,
    stopDebugging,
    activeLineNumber,
  } = useDebugStore();

  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 120, y: 55 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (sessionState === 'inactive') return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 260, e.clientX - dragOffset.x)),
      y: Math.max(40, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 flex items-center gap-1 px-2 py-1.5 bg-[#181926] border border-slate-700 shadow-2xl rounded-xl backdrop-blur-xl text-slate-300 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Drag Grip */}
      <div
        onMouseDown={handleMouseDown}
        className="cursor-move p-1 text-slate-500 hover:text-white transition"
        title="Drag debug toolbar"
      >
        <GripHorizontal className="w-3.5 h-3.5" />
      </div>

      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      {/* Continue / Pause */}
      {sessionState === 'paused' ? (
        <button
          onClick={continueExecution}
          className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-400 hover:text-white transition"
          title="Continue (F5)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
        </button>
      ) : (
        <button
          onClick={pauseExecution}
          className="p-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-400 hover:text-white transition"
          title="Pause (F6)"
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
        </button>
      )}

      {/* Step Over */}
      <button
        onClick={stepOver}
        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
        title="Step Over (F10)"
      >
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Step Into */}
      <button
        onClick={stepInto}
        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
        title="Step Into (F11)"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>

      {/* Step Out */}
      <button
        onClick={stepOut}
        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
        title="Step Out (Shift+F11)"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>

      {/* Restart */}
      <button
        onClick={restartDebugging}
        className="p-1.5 rounded-lg hover:bg-emerald-900/60 text-emerald-400 hover:text-white transition"
        title="Restart (Ctrl+Shift+F5)"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Stop */}
      <button
        onClick={stopDebugging}
        className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white transition"
        title="Stop Debugging (Shift+F5)"
      >
        <Square className="w-3.5 h-3.5 fill-current" />
      </button>

      {/* Active Line indicator */}
      {activeLineNumber && (
        <div className="ml-1 pl-1.5 border-l border-slate-700 text-[11px] font-mono text-amber-400">
          Line {activeLineNumber}
        </div>
      )}
    </div>
  );
};
