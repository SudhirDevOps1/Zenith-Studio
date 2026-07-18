import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface MermaidRendererProps {
  code: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const id = `mermaid_${Math.random().toString(36).substring(2, 9)}`;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: "'Fira Code', 'Inter', monospace",
      themeVariables: {
        darkMode: true,
        background: '#181825',
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        tertiaryColor: '#06b6d4',
        mainBkg: '#1e1e2e',
        nodeBorder: '#45475a',
        lineColor: '#89b4fa',
      },
    });

    const renderDiagram = async () => {
      try {
        setError(null);
        const { svg } = await mermaid.render(id, code.trim());
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Mermaid render error:', err);
          setError(err?.message || 'Failed to render Mermaid diagram.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      // Remove stale mermaid temp nodes from document body if any
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    };
  }, [code, renderCount]);

  const handleCopySvg = () => {
    if (svgContent) {
      navigator.clipboard.writeText(svgContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="p-4 my-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-200 font-mono text-xs">
        <div className="flex items-center gap-2 mb-2 font-semibold text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>Mermaid Diagram Syntax Error</span>
          <button
            onClick={() => setRenderCount(c => c + 1)}
            className="ml-auto flex items-center gap-1 text-xs px-2 py-1 bg-red-900/50 hover:bg-red-800 text-red-100 rounded border border-red-700 transition"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
        <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] text-red-300 bg-black/30 p-2 rounded">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div className="group relative my-4 bg-[#181825] border border-slate-800 rounded-lg p-4 overflow-x-auto shadow-md">
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10 bg-slate-900/80 backdrop-blur px-2 py-1 rounded border border-slate-700">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Mermaid</span>
        <button
          onClick={handleCopySvg}
          className="p-1 hover:text-white text-slate-400 hover:bg-slate-800 rounded transition"
          title="Copy SVG code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div
        ref={containerRef}
        className="mermaid-svg-container flex justify-center items-center overflow-x-auto min-h-[100px]"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
