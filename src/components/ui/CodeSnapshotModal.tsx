import React, { useEffect, useRef, useState } from 'react';
import { Download, Image, X } from 'lucide-react';

interface CodeSnapshotModalProps {
  isOpen: boolean;
  code: string;
  fileName: string;
  onClose: () => void;
}

export const CodeSnapshotModal: React.FC<CodeSnapshotModalProps> = ({ isOpen, code, fileName, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<'blue' | 'purple' | 'emerald'>('blue');

  const drawSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lines = code.split('\n').slice(0, 60);
    const width = 1200;
    const lineHeight = 24;
    const padding = 48;
    const header = 58;
    const height = Math.max(360, padding * 2 + header + lines.length * lineHeight);
    canvas.width = width;
    canvas.height = height;

    const gradients = {
      blue: ['#0f172a', '#1d4ed8'],
      purple: ['#181825', '#7c3aed'],
      emerald: ['#052e2b', '#059669'],
    };
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, gradients[theme][0]);
    gradient.addColorStop(1, gradients[theme][1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
    roundRect(ctx, 32, 32, width - 64, height - 64, 20);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    roundRect(ctx, 32, 32, width - 64, header, 20, true, false);
    ctx.fill();

    ['#ef4444', '#f59e0b', '#10b981'].forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(62 + i * 24, 62, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 18px Inter, sans-serif';
    ctx.fillText(fileName, 140, 68);

    ctx.font = '16px "Fira Code", monospace';
    lines.forEach((line, idx) => {
      const y = padding + header + idx * lineHeight + 46;
      ctx.fillStyle = '#64748b';
      ctx.fillText(String(idx + 1).padStart(2, ' '), 64, y);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(line.slice(0, 110), 110, y);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Generated with CodeStudio by SudhirDevOps1', 64, height - 48);
  };

  useEffect(() => {
    if (isOpen) setTimeout(drawSnapshot, 50);
  }, [isOpen, code, fileName, theme]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `${fileName || 'codestudio'}-snapshot.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[#1e1e2e] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 bg-[#181825] border-b border-slate-800">
          <div className="flex items-center gap-2 text-white text-sm font-semibold"><Image className="w-4 h-4 text-blue-400" /> Code Snapshot</div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center justify-between p-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {(['blue', 'purple', 'emerald'] as const).map((t) => (
              <button key={t} onClick={() => setTheme(t)} className={`px-3 py-1 rounded border ${theme === t ? 'border-white text-white' : 'border-slate-700 text-slate-400'}`}>{t}</button>
            ))}
          </div>
          <button onClick={download} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"><Download className="w-3.5 h-3.5" /> Download PNG</button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-[#0d0e15]">
          <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-2xl" />
        </div>
      </div>
    </div>
  );
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, top = true, bottom = true) {
  ctx.beginPath();
  ctx.moveTo(x + (top ? r : 0), y);
  ctx.lineTo(x + w - (top ? r : 0), y);
  if (top) ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - (bottom ? r : 0));
  if (bottom) ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + (bottom ? r : 0), y + h);
  if (bottom) ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + (top ? r : 0));
  if (top) ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}