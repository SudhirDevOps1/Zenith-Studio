import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Layers,
  Sliders,
  Edit3,
  Eye,
} from 'lucide-react';
import { useToastStore } from '../../stores/useToastStore';

interface CodeSnapshotModalProps {
  isOpen: boolean;
  code: string;
  fileName: string;
  selectedCode?: string | null;
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
  | 'dark'
  | 'transparent';

type QualityScale = 1 | 2 | 3 | 4 | 5;
type WindowWidthMode = 'auto' | 'compact' | 'medium' | 'wide';

interface Token {
  text: string;
  color: string;
  isItalic?: boolean;
}

export const CodeSnapshotModal: React.FC<CodeSnapshotModalProps> = ({
  isOpen,
  code,
  fileName,
  selectedCode,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addToast } = useToastStore();

  const totalLines = useMemo(() => code.split('\n').length, [code]);

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [theme, setTheme] = useState<GradientTheme>('purple');
  const [padding, setPadding] = useState<number>(32);
  const [fontSize, setFontSize] = useState<number>(15);
  const [quality, setQuality] = useState<QualityScale>(2);
  const [windowWidthMode, setWindowWidthMode] = useState<WindowWidthMode>('auto');
  const [shadowStyle, setShadowStyle] = useState<'deep' | 'soft' | 'none'>('deep');

  const [rangeMode, setRangeMode] = useState<'all' | 'range' | 'custom'>(
    selectedCode ? 'custom' : 'all'
  );
  const [startLine, setStartLine] = useState<number>(1);
  const [endLine, setEndLine] = useState<number>(Math.min(totalLines, 30));
  const [customText, setCustomText] = useState<string>(selectedCode || code);

  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [showDots, setShowDots] = useState<boolean>(true);
  const [showLangTag, setShowLangTag] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCode) {
      setCustomText(selectedCode);
      setRangeMode('custom');
    } else {
      setCustomText(code);
      setStartLine(1);
      setEndLine(Math.min(totalLines, 35));
    }
  }, [code, selectedCode, totalLines, isOpen]);

  const rawLines = useMemo(() => {
    if (rangeMode === 'custom') {
      return customText.split('\n');
    }
    const all = code.split('\n');
    if (rangeMode === 'range') {
      const s = Math.max(1, startLine) - 1;
      const e = Math.min(all.length, Math.max(startLine, endLine));
      return all.slice(s, e);
    }
    return all.slice(0, 100);
  }, [code, customText, rangeMode, startLine, endLine]);

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

  const gradients: Record<
    GradientTheme,
    { name: string; stops: [string, string, string?]; isTransparent?: boolean }
  > = {
    purple: { name: 'Cosmic Purple', stops: ['#6366f1', '#a855f7', '#ec4899'] },
    sunset: { name: 'Sunset Rose', stops: ['#f43f5e', '#fb923c'] },
    cyberpunk: { name: 'Cyberpunk Neon', stops: ['#06b6d4', '#3b82f6', '#9333ea'] },
    emerald: { name: 'Emerald Forest', stops: ['#052e2b', '#10b981', '#34d399'] },
    midnight: { name: 'Midnight Slate', stops: ['#0f172a', '#1e293b', '#334155'] },
    cyan: { name: 'Electric Cyan', stops: ['#0ea5e9', '#6366f1'] },
    amber: { name: 'Solar Amber', stops: ['#ea580c', '#eab308'] },
    dark: { name: 'Pure Dark', stops: ['#12131c', '#181825'] },
    transparent: { name: 'Transparent', stops: ['transparent', 'transparent'], isTransparent: true },
  };

  // Syntax Highlighter Tokenizer
  const tokenizeLine = (line: string): Token[] => {
    const tokens: Token[] = [];
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('#') ||
      line.trim().startsWith('/*')
    ) {
      return [{ text: line, color: '#6e7681', isItalic: true }];
    }

    const regex =
      /(\b(?:import|export|from|default|const|let|var|function|return|class|extends|interface|type|async|await|if|else|for|while|switch|case|try|catch|def|self|struct|impl|fn|pub|use|package|new|typeof|instanceof|void|yield|null|undefined|true|false)\b)|(\b(?:React|StrictMode|createRoot|useState|useEffect|useMemo|useCallback|useRef|console|document|window|Math|Array|Object|String|Number|Boolean|Promise)\b)|(".*?"|'.*?'|`.*?`)|(\/\/.*$)|(\b\d+(?:\.\d+)?\b)|(<\/?[\w$-]+(?:>|\s)|>|\/>)|(\b[A-Za-z_$][\w$]*(?=\s*\())|([{}()[\].,;:?&|!=<>+\-*/%~^]+)|(\b[A-Z][\w$]*\b)|([A-Za-z_$][\w$]*)|(\s+)/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      const [, kw, builtin, str, comment, num, tag, fnName, punct, typeName, ident, space] = match;

      if (kw) tokens.push({ text: kw, color: '#c678dd' });
      else if (builtin) tokens.push({ text: builtin, color: '#61afef' });
      else if (str) tokens.push({ text: str, color: '#98c379' });
      else if (comment) tokens.push({ text: comment, color: '#6e7681', isItalic: true });
      else if (num) tokens.push({ text: num, color: '#d19a66' });
      else if (tag) tokens.push({ text: tag, color: '#e06c75' });
      else if (fnName) tokens.push({ text: fnName, color: '#61afef' });
      else if (typeName) tokens.push({ text: typeName, color: '#e5c07b' });
      else if (punct) tokens.push({ text: punct, color: '#abb2bf' });
      else if (ident) tokens.push({ text: ident, color: '#abb2bf' });
      else if (space) tokens.push({ text: space, color: '#abb2bf' });
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

    const scale = quality; // Multiplier: 1x, 2x, 3x, 4x, 5x
    const outerPad = padding * scale;
    const headerHeight = 48 * scale;
    const footerHeight = showWatermark ? 40 * scale : 16 * scale;
    const lineHeight = (fontSize + 10) * scale;
    const renderFontSize = fontSize * scale;
    const fontName = '"JetBrains Mono", "Fira Code", monospace';

    // Calculate maximum code line width
    ctx.font = `${renderFontSize}px ${fontName}`;
    let maxLineWidth = 0;
    rawLines.forEach((line) => {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    });

    const gutterWidth = showLineNumbers ? 50 * scale : 16 * scale;
    let innerContentWidth = gutterWidth + maxLineWidth + 44 * scale;

    // Window width modes
    if (windowWidthMode === 'compact') {
      innerContentWidth = Math.max(480 * scale, innerContentWidth);
    } else if (windowWidthMode === 'medium') {
      innerContentWidth = Math.max(680 * scale, innerContentWidth);
    } else if (windowWidthMode === 'wide') {
      innerContentWidth = Math.max(920 * scale, innerContentWidth);
    } else {
      // Auto-fit tight width
      innerContentWidth = Math.max(420 * scale, innerContentWidth);
    }

    const innerContentHeight = headerHeight + rawLines.length * lineHeight + footerHeight;

    const canvasWidth = innerContentWidth + outerPad * 2;
    const canvasHeight = innerContentHeight + outerPad * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Outer Background
    const currentGrad = gradients[theme];
    if (!currentGrad.isTransparent) {
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      grad.addColorStop(0, currentGrad.stops[0]);
      if (currentGrad.stops[2]) {
        grad.addColorStop(0.5, currentGrad.stops[1]);
        grad.addColorStop(1, currentGrad.stops[2]);
      } else {
        grad.addColorStop(1, currentGrad.stops[1]);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 2. Code Window Container
    const winX = outerPad;
    const winY = outerPad;
    const winW = innerContentWidth;
    const winH = innerContentHeight;
    const cornerRadius = 14 * scale;

    ctx.save();
    if (shadowStyle === 'deep') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 36 * scale;
      ctx.shadowOffsetY = 18 * scale;
    } else if (shadowStyle === 'soft') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 18 * scale;
      ctx.shadowOffsetY = 8 * scale;
    }

    ctx.fillStyle = '#1e1e2e';
    roundRect(ctx, winX, winY, winW, winH, cornerRadius);
    ctx.fill();
    ctx.restore();

    // 3. Header Bar & macOS Dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    roundRect(ctx, winX, winY, winW, headerHeight, cornerRadius, true, false);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(winX, winY + headerHeight);
    ctx.lineTo(winX + winW, winY + headerHeight);
    ctx.stroke();

    if (showDots) {
      const dotRadius = 5.5 * scale;
      const dotY = winY + headerHeight / 2;
      const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
      dotColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(winX + 20 * scale + i * 18 * scale, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 4. Language Badge
    if (showLangTag) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = `800 ${10.5 * scale}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '1.5px';
      ctx.fillText(language, winX + winW - 20 * scale, winY + headerHeight / 2);
      ctx.letterSpacing = '0px';
      ctx.textAlign = 'left';
    }

    // 5. Code Lines
    ctx.font = `${renderFontSize}px ${fontName}`;
    ctx.textBaseline = 'alphabetic';

    const lineOffset = rangeMode === 'range' ? startLine : 1;

    rawLines.forEach((line, idx) => {
      const y = winY + headerHeight + (idx + 1) * lineHeight;

      // Line numbers
      if (showLineNumbers) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = `500 ${renderFontSize - 2 * scale}px ${fontName}`;
        ctx.textAlign = 'right';
        ctx.fillText(String(lineOffset + idx), winX + 38 * scale, y);
        ctx.textAlign = 'left';
      }

      // Tokens
      let currentX = winX + gutterWidth + 6 * scale;
      const tokens = tokenizeLine(line);

      tokens.forEach((token) => {
        ctx.fillStyle = token.color;
        ctx.font = `${token.isItalic ? 'italic' : 'normal'} ${renderFontSize}px ${fontName}`;
        ctx.fillText(token.text, currentX, y);
        currentX += ctx.measureText(token.text).width;
      });
    });

    // 6. Watermark
    if (showWatermark) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.font = `600 ${9.5 * scale}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        'Generated with Zenith Studio by SudhirDevOps1',
        winX + winW / 2,
        winY + winH - 16 * scale
      );
      ctx.textAlign = 'left';
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(drawSnapshot, 50);
      return () => clearTimeout(timer);
    }
  }, [
    isOpen,
    rawLines,
    theme,
    padding,
    fontSize,
    quality,
    windowWidthMode,
    shadowStyle,
    showLineNumbers,
    showDots,
    showLangTag,
    showWatermark,
  ]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    const baseName = fileName.replace(/\.[^/.]+$/, '') || 'zenith-studio';
    a.download = `${baseName}-snapshot-${quality}x.png`;

    a.href = canvas.toDataURL('image/png');
    a.click();
    addToast({
      type: 'success',
      title: 'Snapshot Downloaded',
      message: `Exported at ${quality}x resolution.`,
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
          message: 'Code snapshot copied directly as PNG image.',
        });
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy image directly. Please use Download PNG.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[94vh] bg-[#181825] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col font-sans animate-scale-up"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1e1e2e] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Code Snapshot Studio</span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Snippet
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Controls Toolbar */}
        <div className="p-3 bg-[#14141f] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Theme Gradients */}
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
                  background: gradients[t].isTransparent
                    ? '#1f2430'
                    : `linear-gradient(135deg, ${gradients[t].stops[0]}, ${gradients[t].stops[1]})`,
                }}
              >
                {gradients[t].name}
              </button>
            ))}
          </div>

          {/* Quality & Action Buttons */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Resolution Multiplier Selector (1x, 2x, 3x, 4x, 5x) */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">Quality:</span>
              {([1, 2, 3, 4, 5] as QualityScale[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    quality === q
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`${q}x Resolution`}
                >
                  {q}x
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyImage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {quality}x PNG</span>
            </button>
          </div>
        </div>

        {/* Secondary Customization & Line Range Bar */}
        <div className="px-4 py-2 bg-[#12131c] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Line Selection / Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> Lines:
            </span>
            <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800 text-[10px]">
              <button
                onClick={() => setRangeMode('all')}
                className={`px-2 py-0.5 rounded ${
                  rangeMode === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRangeMode('range')}
                className={`px-2 py-0.5 rounded ${
                  rangeMode === 'range' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Range
              </button>
              <button
                onClick={() => setRangeMode('custom')}
                className={`px-2 py-0.5 rounded ${
                  rangeMode === 'custom' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Custom / Selection
              </button>
            </div>

            {rangeMode === 'range' && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <span>From</span>
                <input
                  type="number"
                  min={1}
                  max={totalLines}
                  value={startLine}
                  onChange={(e) => setStartLine(Number(e.target.value))}
                  className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white"
                />
                <span>to</span>
                <input
                  type="number"
                  min={1}
                  max={totalLines}
                  value={endLine}
                  onChange={(e) => setEndLine(Number(e.target.value))}
                  className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white"
                />
              </div>
            )}
          </div>

          {/* Width & Sizing Options */}
          <div className="flex items-center gap-3">
            {/* Width Mode */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400">Width:</span>
              {(['auto', 'compact', 'medium', 'wide'] as WindowWidthMode[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setWindowWidthMode(w)}
                  className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                    windowWidthMode === w ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* Padding */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400">Pad:</span>
              {[16, 32, 48, 64].map((p) => (
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

            {/* Font Size */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400">Font:</span>
              {[13, 15, 17].map((f) => (
                <button
                  key={f}
                  onClick={() => setFontSize(f)}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    fontSize === f ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}px
                </button>
              ))}
            </div>

            {/* Shadow Style */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400">Shadow:</span>
              {(['deep', 'soft', 'none'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setShadowStyle(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                    shadowStyle === s ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`px-2 py-0.5 rounded border text-[10px] transition ${
                  showLineNumbers
                    ? 'bg-blue-600/30 border-blue-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                # Lines
              </button>
              <button
                onClick={() => setShowDots(!showDots)}
                className={`px-2 py-0.5 rounded border text-[10px] transition ${
                  showDots
                    ? 'bg-blue-600/30 border-blue-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                Dots
              </button>
              <button
                onClick={() => setShowLangTag(!showLangTag)}
                className={`px-2 py-0.5 rounded border text-[10px] transition ${
                  showLangTag
                    ? 'bg-blue-600/30 border-blue-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                Tag
              </button>
              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className={`px-2 py-0.5 rounded border text-[10px] transition ${
                  showWatermark
                    ? 'bg-blue-600/30 border-blue-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                Watermark
              </button>
            </div>
          </div>
        </div>

        {/* Main Body: Preview or Code Editor */}
        <div className="flex-1 overflow-auto p-6 bg-[#0a0a12] flex items-center justify-center min-h-[420px]">
          {activeTab === 'preview' ? (
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[600px] object-contain rounded-xl shadow-2xl transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col max-w-4xl bg-[#1e1e2e] border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-2.5 bg-[#181825] border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Edit Code Snippet (Updates snapshot live)</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {customText.split('\n').length} lines
                </span>
              </div>
              <textarea
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setRangeMode('custom');
                }}
                className="flex-1 p-4 bg-[#14141f] text-slate-200 font-mono text-xs outline-none resize-none"
                placeholder="Paste or type code snippet to snapshot..."
                rows={16}
              />
            </div>
          )}
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
