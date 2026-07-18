import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2 } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  fileName?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ src, fileName }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = fileName || 'image';
    a.click();
  };

  return (
    <div className={`flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#181825]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-300">Image Preview</span>
          <span className="text-[10px] text-slate-500 font-mono">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRotate}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#0d0e15]">
        <img
          src={src}
          alt={fileName || 'Preview'}
          className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
        />
      </div>

      {/* Reset Button */}
      {(zoom !== 1 || rotation !== 0) && (
        <button
          onClick={handleReset}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg shadow-lg transition"
        >
          Reset View
        </button>
      )}

      {/* Fullscreen Exit */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg shadow-lg transition"
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  );
};
