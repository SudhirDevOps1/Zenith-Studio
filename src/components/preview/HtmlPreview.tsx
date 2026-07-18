import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ExternalLink, Monitor, Tablet, Smartphone, Code } from 'lucide-react';

interface HtmlPreviewProps {
  htmlContent: string;
}

type DeviceWidth = '100%' | '1024px' | '768px' | '375px';

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ htmlContent }) => {
  const [deviceWidth, setDeviceWidth] = useState<DeviceWidth>('100%');
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Hot reload iframe content
    setKey(prev => prev + 1);
  }, [htmlContent]);

  const handleManualRefresh = () => {
    setKey(prev => prev + 1);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden">
      {/* Controls Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-orange-400" />
          <span className="font-semibold text-slate-200">HTML Live Sandbox Preview</span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded border border-slate-800">
          <button
            onClick={() => setDeviceWidth('100%')}
            className={`p-1 rounded transition ${deviceWidth === '100%' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'}`}
            title="Desktop Full Width"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceWidth('768px')}
            className={`p-1 rounded transition ${deviceWidth === '768px' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'}`}
            title="Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceWidth('375px')}
            className={`p-1 rounded transition ${deviceWidth === '375px' ? 'bg-blue-600 text-white' : 'hover:text-slate-200'}`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition border border-slate-700/50"
            title="Reload Frame"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition border border-slate-700/50"
            title="Open frame in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-slate-950 flex justify-center items-center p-2 overflow-auto">
        <div
          style={{ width: deviceWidth, transition: 'width 0.3s ease' }}
          className="h-full bg-white rounded shadow-2xl overflow-hidden border border-slate-800"
        >
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={htmlContent}
            title="HTML Preview Frame"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
