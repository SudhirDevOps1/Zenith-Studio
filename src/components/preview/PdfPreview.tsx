import React, { useState } from 'react';
import { Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface PdfPreviewProps {
  url: string;
  fileName?: string;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ url, fileName }) => {
  const [scale, setScale] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1; // Mock total pages

  const handleZoomIn = () => setScale((s) => Math.min(s + 25, 200));
  const handleZoomOut = () => setScale((s) => Math.max(s - 25, 50));

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document.pdf';
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#181825]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-400" />
          <span className="text-[11px] font-semibold text-slate-300">PDF Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 rounded px-2 py-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-300 font-mono min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-400 font-mono min-w-[40px] text-center">{scale}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-[#2a2a2a] flex items-center justify-center p-4">
        <iframe
          src={`${url}#page=${currentPage}&zoom=${scale}`}
          className="w-full h-full bg-white shadow-2xl"
          style={{ maxWidth: `${scale}%` }}
          title="PDF Preview"
        />
      </div>
    </div>
  );
};
