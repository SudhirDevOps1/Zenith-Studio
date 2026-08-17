import React, { useState, useRef } from 'react';
import {
  Globe,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Home,
  ShieldCheck,
  Bookmark,
  X,
} from 'lucide-react';
import { isElectron } from '../../utils/fileUtils';
import { useToastStore } from '../../stores/useToastStore';

interface SimpleBrowserProps {
  initialUrl?: string;
  onClose?: () => void;
}

const BOOKMARKS = [
  { name: 'Localhost:5173', url: 'http://localhost:5173' },
  { name: 'Localhost:3000', url: 'http://localhost:3000' },
  { name: 'Tailwind Docs', url: 'https://tailwindcss.com/docs' },
  { name: 'React Docs', url: 'https://react.dev' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  { name: 'GitHub', url: 'https://github.com' },
];

export const SimpleBrowserWebview: React.FC<SimpleBrowserProps> = ({
  initialUrl = 'https://zenith-studio-web.pages.dev/',
  onClose,
}) => {

  const [urlInput, setUrlInput] = useState(initialUrl);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewportMode, setViewportMode] = useState<'responsive' | 'mobile' | 'tablet' | 'desktop'>('responsive');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { addToast } = useToastStore();

  const navigateTo = (rawUrl: string) => {
    let target = rawUrl.trim();
    if (!target) return;

    if (!/^https?:\/\//i.test(target) && !target.startsWith('localhost') && !target.startsWith('127.0.0.1')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    } else if (target.startsWith('localhost') || target.startsWith('127.0.0.1')) {
      target = `http://${target}`;
    }

    setUrlInput(target);
    setCurrentUrl(target);
    setIsLoading(true);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(target);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setUrlInput(prev);
      setCurrentUrl(prev);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setUrlInput(next);
      setCurrentUrl(next);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 50);
    }
  };

  const handleOpenExternal = async () => {
    if (isElectron() && (window as any).electronAPI?.openExternal) {
      await (window as any).electronAPI.openExternal(currentUrl);
    } else {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
    addToast({ type: 'info', title: 'Opened in Browser', message: currentUrl });
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '1200px';
      default:
        return '100%';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800 text-slate-200 font-sans overflow-hidden">
      {/* Browser Navigation Toolbar */}
      <div className="p-2 bg-[#181825] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 flex-wrap">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            disabled={historyIndex <= 0}
            onClick={handleBack}
            className="p-1.5 hover:bg-slate-800 disabled:opacity-40 rounded text-slate-400 hover:text-white transition"
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={historyIndex >= history.length - 1}
            onClick={handleForward}
            className="p-1.5 hover:bg-slate-800 disabled:opacity-40 rounded text-slate-400 hover:text-white transition"
            title="Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReload}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Reload Webview"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => navigateTo('https://zenith-studio-web.pages.dev/')}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Home"
          >

            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigateTo(urlInput);
          }}
          className="flex-1 min-w-[200px] relative flex items-center"
        >
          <div className="absolute left-2.5 flex items-center gap-1 text-slate-500">
            {currentUrl.startsWith('https://') ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-blue-400" />
            )}
          </div>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter URL or search internet..."
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-8 pr-16 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-semibold transition"
          >
            Go
          </button>
        </form>

        {/* Viewport Presets & External Open */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setViewportMode('responsive')}
              className={`p-1 rounded transition ${
                viewportMode === 'responsive' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Responsive Viewport (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1 rounded transition ${
                viewportMode === 'tablet' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1 rounded transition ${
                viewportMode === 'mobile' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleOpenExternal}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition"
            title="Open in External Browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition"
              title="Close Webview Browser"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="px-2 py-1 bg-[#14141f] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]" style={{ scrollbarWidth: 'none' }}>
        <span className="text-slate-500 font-semibold uppercase text-[9px] flex items-center gap-1 pl-1">
          <Bookmark className="w-2.5 h-2.5" /> Quick:
        </span>
        {BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => navigateTo(bm.url)}
            className="px-2 py-0.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 whitespace-nowrap transition"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Webview / Iframe Stage */}
      <div className="flex-1 bg-[#090a10] overflow-auto flex items-center justify-center p-2 relative">
        <div
          style={{ width: getViewportWidth(), height: '100%' }}
          className="bg-white rounded-md shadow-2xl overflow-hidden transition-all duration-300 relative border border-slate-800"
        >
          <iframe
            ref={iframeRef}
            src={currentUrl}
            onLoad={() => setIsLoading(false)}
            title="Zenith Studio Webview"

            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            allow="fullscreen; clipboard-read; clipboard-write;"
          />
        </div>
      </div>
    </div>
  );
};
