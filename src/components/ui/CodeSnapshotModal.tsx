import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Download, Copy, Check, X, Sparkles, Layers } from 'lucide-react';
import { useToastStore } from '../../stores/useToastStore';

interface CodeSnapshotModalProps {
  isOpen: boolean;
  code: string;
  fileName: string;
  onClose: () => void;
}

type GradientTheme =
  | 'purple'
  | 'sunset'
  | 'cyberpunk'
  | 'emerald'
  | 'midnight'
  | 'cyan'
  | 'amber'
  | 'dark';

interface Token {
  text: string;
  color: string;
  isItalic?: boolean;
}

export const CodeSnapshotModal: React.FC<CodeSnapshotModalProps> = ({
  isOpen,
  code,
  fileName,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addToast } = useToastStore();

  const [theme, setTheme] = useState<GradientTheme>('purple');
  const [padding, setPadding] = useState<number>(48);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [showDots, setShowDots] = useState<boolean>(true);
  const [showLangTag, setShowLangTag] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const language = useMemo(() => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      ts: 'TYPESCRIPT',
      tsx: 'REACT TSX',
      js: 'JAVASCRIPT',
      jsx: 'REACT JSX',
      py: 'PYTHON',
      html: 'HTML',
      css: 'CSS',
      cpp: 'C++',
      c: 'C',
      rs: 'RUST',
      go: 'GO',
      json: 'JSON',
      md: 'MARKDOWN',
      sql: 'SQL',
      sh: 'BASH',
    };
    return map[ext] || (ext ? ext.toUpperCase() : 'CODE');
  }, [fileName]);

  const gradients: Record<GradientTheme, { name: string; stops: [string, string, string?] }> = {
    purple: { name: 'Cosmic Purple', stops: ['#6366f1', '#a855f7', '#ec4899'] },
    sunset: { name: 'Sunset Rose', stops: ['#f43f5e', '#fb923c'] },
    cyberpunk: { name: 'Cyberpunk Neon', stops: ['#06b6d4', '#3b82f6', '#9333ea'] },
    emerald: { name: 'Emerald Forest', stops: ['#052e2b', '#10b981', '#34d399'] },
    midnight: { name: 'Midnight Slate', stops: ['#0f172a', '#1e293b', '#334155'] },
    cyan: { name: 'Electric Cyan', stops: ['#0ea5e9', '#6366f1'] },
    amber: { name: 'Solar Amber', stops: ['#ea580c', '#eab308'] },
    dark: { name: 'Pure Dark', stops: ['#12131c', '#181825'] },
  };

  // Syntax Highlighter Tokenizer for JS/TS/Py/HTML/CSS/Rust/C++
  const tokenizeLine = (line: string): Token[] => {
    const tokens: Token[] = [];

    // Comments check
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*')) {
      return [{ text: line, color: '#6e7681', isItalic: true }];
    }

    const regex =
      /(\b(?:import|export|from|default|const|let|var|function|return|class|extends|interface|type|async|await|if|else|for|while|switch|case|try|catch|def|self|struct|impl|fn|pub|use|package|new|typeof|instanceof|void|yield|null|undefined|true|false)\b)|(\b(?:React|StrictMode|createRoot|useState|useEffect|useMemo|useCallback|useRef|console|document|window|Math|Array|Object|String|Number|Boolean|Promise)\b)|(".*?"|'.*?'|`.*?`)|(\/\/.*$)|(\b\d+(?:\.\d+)?\b)|(<\/?[\w$-]+(?:>|\s)|>|\/>)|(\b[A-Za-z_$][\w$]*(?=\s*\())|([{}()[\].,;:?&|!=<>+\-*/%~^]+)|(\b[A-Z][\w$]*\b)|([A-Za-z_$][\w$]*)|(\s+)/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      const [, kw, builtin, str, comment, num, tag, fnName, punct, typeName, ident, space] = match;

      if (kw) {
        tokens.push({ text: kw, color: '#c678dd' }); // Purple
      } else if (builtin) {
        tokens.push({ text: builtin, color: '#61afef' }); // Cyan
      } else if (str) {
        tokens.push({ text: str, color: '#98c379' }); // Green
      } else if (comment) {
        tokens.push({ text: comment, color: '#6e7681', isItalic: true }); // Muted Gray Italic
      } else if (num) {
        tokens.push({ text: num, color: '#d19a66' }); // Orange
      } else if (tag) {
        tokens.push({ text: tag, color: '#e06c75' }); // Red / Coral
      } else if (fnName) {
        tokens.push({ text: fnName, color: '#61afef' }); // Blue
      } else if (typeName) {
        tokens.push({ text: typeName, color: '#e5c07b' }); // Gold
      } else if (punct) {
        tokens.push({ text: punct, color: '#abb2bf' }); // Light Gray
      } else if (ident) {
        tokens.push({ text: ident, color: '#abb2bf' }); // White/Gray
      } else if (space) {
        tokens.push({ text: space, color: '#abb2bf' });
      }
    }

    if (tokens.length === 0 && line.length > 0) {
      tokens.push({ text: line, color: '#abb2bf' });
    }

    return tokens;
  };

  const drawSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rawLines = code.split('\n').slice(0, 80);
    const scale = 2; // 2x Retina DPI
    const outerPadding = padding * scale;
    const headerHeight = 52 * scale;
    const footerHeight = showWatermark ? 44 * scale : 20 * scale;
    const lineHeight = 26 * scale;
    const fontSize = 15 * scale;
    const fontName = '"JetBrains Mono", "Fira Code", monospace';

    // Calculate maximum code line width
    ctx.font = `${fontSize}px ${fontName}`;
    let maxLineWidth = 0;
    rawLines.forEach((line) => {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    });

    const gutterWidth = showLineNumbers ? 56 * scale : 20 * scale;
    const innerContentWidth = Math.max(540 * scale, gutterWidth + maxLineWidth + 48 * scale);
    const innerContentHeight = headerHeight + rawLines.length * lineHeight + footerHeight;

    const canvasWidth = innerContentWidth + outerPadding * 2;
    const canvasHeight = innerContentHeight + outerPadding * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 1. Draw Outer Background Gradient
    const gStops = gradients[theme].stops;
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, gStops[0]);
    if (gStops[2]) {
      grad.addColorStop(0.5, gStops[1]);
      grad.addColorStop(1, gStops[2]);
    } else {
      grad.addColorStop(1, gStops[1]);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Draw Code Window Container with Deep Drop Shadow
    const winX = outerPadding;
    const winY = outerPadding;
    const winW = innerContentWidth;
    const winH = innerContentHeight;
    const cornerRadius = 14 * scale;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 40 * scale;
    ctx.shadowOffsetY = 20 * scale;
    ctx.fillStyle = '#1e1e2e'; // Dark code window background
    roundRect(ctx, winX, winY, winW, winH, cornerRadius);
    ctx.fill();
    ctx.restore();

    // 3. Draw Header Border & macOS Dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, winX, winY, winW, headerHeight, cornerRadius, true, false);
    ctx.fill();

    // Header bottom line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(winX, winY + headerHeight);
    ctx.lineTo(winX + winW, winY + headerHeight);
    ctx.stroke();

    if (showDots) {
      const dotRadius = 6 * scale;
      const dotY = winY + headerHeight / 2;
      const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
      dotColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(winX + 24 * scale + i * 20 * scale, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 4. Draw Language Tag / Header Title
    if (showLangTag) {
      ctx.fillStyle = '#f59e0b'; // Gold Language text
      ctx.font = `800 ${11 * scale}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '1.5px';
      ctx.fillText(language, winX + winW - 24 * scale, winY + headerHeight / 2);
      ctx.letterSpacing = '0px';
      ctx.textAlign = 'left';
    }

    // 5. Draw Syntax-Highlighted Code Lines
    ctx.font = `${fontSize}px ${fontName}`;
    ctx.textBaseline = 'alphabetic';

    rawLines.forEach((line, idx) => {
      const y = winY + headerHeight + (idx + 1) * lineHeight;

      // Line number
      if (showLineNumbers) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.font = `500 ${13 * scale}px ${fontName}`;
        ctx.textAlign = 'right';
        ctx.fillText(String(idx + 1), winX + 42 * scale, y);
        ctx.textAlign = 'left';
      }

      // Syntax tokens
      let currentX = winX + gutterWidth + 8 * scale;
      const tokens = tokenizeLine(line);

      tokens.forEach((token) => {
        ctx.fillStyle = token.color;
        ctx.font = `${token.isItalic ? 'italic' : 'normal'} ${fontSize}px ${fontName}`;
        ctx.fillText(token.text, currentX, y);
        currentX += ctx.measureText(token.text).width;
      });
    });

    // 6. Draw Watermark
    if (showWatermark) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = `600 ${10 * scale}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        'Generated with CodeStudio by SudhirDevOps1',
        winX + winW / 2,
        winY + winH - 18 * scale
      );
      ctx.textAlign = 'left';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawSnapshot, 60);
    }
  }, [isOpen, code, fileName, theme, padding, showLineNumbers, showDots, showLangTag, showWatermark]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    const baseName = fileName.replace(/\.[^/.]+$/, '') || 'codestudio';
    a.download = `${baseName}-snapshot.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    addToast({
      type: 'success',
      title: 'Image Downloaded',
      message: `${baseName}-snapshot.png saved in high resolution.`,
    });
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        addToast({
          type: 'success',
          title: 'Copied to Clipboard',
          message: 'Code snapshot copied directly to clipboard as PNG image.',
        });
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy image to clipboard. Please use Download PNG instead.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[92vh] bg-[#181825] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col font-sans animate-scale-up"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e1e2e] border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Code Snapshot Generator (Carbon / Ray.so Style)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="p-3 bg-[#14141f] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Gradient Theme Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Theme:
            </span>
            {(Object.keys(gradients) as GradientTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition border ${
                  theme === t
                    ? 'border-white text-white shadow-md'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${gradients[t].stops[0]}, ${gradients[t].stops[1]})`,
                }}
              >
                {gradients[t].name}
              </button>
            ))}
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-3 text-slate-300">
            {/* Padding */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400">Pad:</span>
              {[24, 48, 64].map((p) => (
                <button
                  key={p}
                  onClick={() => setPadding(p)}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    padding === p ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Line Numbers Toggle */}
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`px-2 py-1 rounded border text-[10px] transition ${
                showLineNumbers
                  ? 'bg-blue-600/30 border-blue-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              # Lines
            </button>

            {/* macOS Dots Toggle */}
            <button
              onClick={() => setShowDots(!showDots)}
              className={`px-2 py-1 rounded border text-[10px] transition ${
                showDots
                  ? 'bg-blue-600/30 border-blue-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              Dots
            </button>

            {/* Language Tag Toggle */}
            <button
              onClick={() => setShowLangTag(!showLangTag)}
              className={`px-2 py-1 rounded border text-[10px] transition ${
                showLangTag
                  ? 'bg-blue-600/30 border-blue-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              Tag ({language})
            </button>

            {/* Watermark Toggle */}
            <button
              onClick={() => setShowWatermark(!showWatermark)}
              className={`px-2 py-1 rounded border text-[10px] transition ${
                showWatermark
                  ? 'bg-blue-600/30 border-blue-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              Watermark
            </button>

            {/* Export Buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleCopyImage}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-md transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download 2x PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="flex-1 overflow-auto p-6 bg-[#0a0a12] flex items-center justify-center min-h-[400px]">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[580px] object-contain rounded-xl shadow-2xl transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  top = true,
  bottom = true
) {
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
