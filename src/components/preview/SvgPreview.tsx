import React, { useEffect, useRef, useState } from 'react';
import { Download, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface SvgPreviewProps {
  content: string;
  onContentChange?: (newContent: string) => void;
  fileName?: string;
}

const extractSvgFromContent = (content: string) => {
  if (!content) return '';
  if (content.startsWith('data:image/svg+xml;base64,')) {
    try {
      return atob(content.split(',')[1] || '');
    } catch {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180"><text x="20" y="90" fill="#94a3b8">Unable to decode SVG</text></svg>';
    }
  }
  return content;
};

export const SvgPreview: React.FC<SvgPreviewProps> = ({ content, fileName }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [content]);

  const svgMarkup = extractSvgFromContent(content);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'image.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#181825]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-300">Live SVG Preview</span>
          <span className="text-[10px] text-slate-500 font-mono">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition" title="Zoom Out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition" title="Zoom In">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleRotate} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition" title="Rotate">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDownload} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition" title="Download SVG">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#0d0e15]">
        <div
          ref={svgRef}
          className="max-w-full transition-transform duration-200 [&_svg]:max-w-full [&_svg]:h-auto"
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      </div>

      {(zoom !== 1 || rotation !== 0) && (
        <button
          onClick={handleReset}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg shadow-lg transition"
        >
          Reset View
        </button>
      )}
    </div>
  );
};
