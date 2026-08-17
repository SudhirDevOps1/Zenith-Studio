import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { MermaidRenderer } from './MermaidRenderer';
import { Printer, Copy, Check } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
  scrollPercentage?: number;
  extension?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, scrollPercentage, extension }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const trimmed = content.trim();
  const isPureMermaid =
    extension === 'mermaid' ||
    extension === 'mmd' ||
    /^(sequenceDiagram|graph\s|flowchart\s|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap)/i.test(trimmed);

  // Sync scroll from Monaco editor
  useEffect(() => {
    if (scrollPercentage !== undefined && containerRef.current) {
      const container = containerRef.current;
      const targetScrollTop = (container.scrollHeight - container.clientHeight) * scrollPercentage;
      container.scrollTop = targetScrollTop;
    }
  }, [scrollPercentage]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Markdown Export - Zenith Studio</title>

          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            pre { background: #f4f4f5; padding: 15px; border-radius: 6px; overflow-x: auto; }
            code { font-family: monospace; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background: #f8f9fa; }
            blockquote { border-left: 4px solid #3b82f6; margin: 0; padding-left: 16px; color: #555; }
          </style>
        </head>
        <body>
          ${containerRef.current?.innerHTML || ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const copyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden text-slate-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#181825] text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Live Markdown & Mermaid Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition border border-slate-700"
            title="Export / Print to PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Export / Print</span>
          </button>
        </div>
      </div>

      {/* Main Render View */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 markdown-body text-slate-300 font-sans leading-relaxed selection:bg-blue-600 selection:text-white"
      >
        {trimmed === '' ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm italic">
            <span>Empty Document</span>
            <span className="text-xs text-slate-600 mt-1">Start typing in the editor to render live preview</span>
          </div>
        ) : isPureMermaid ? (
          <div className="max-w-4xl mx-auto py-4">
            <MermaidRenderer code={trimmed} />
          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : '';
                const codeString = String(children).replace(/\n$/, '');

                if (lang === 'mermaid') {
                  return <MermaidRenderer code={codeString} />;
                }

                if (!match) {
                  return (
                    <code className="bg-slate-800/70 text-pink-400 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700/50" {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="group relative my-3 rounded-lg overflow-hidden border border-slate-800 bg-[#181825]">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1e2e] border-b border-slate-800 text-[11px] font-mono text-slate-400">
                      <span>{lang}</span>
                      <button
                        onClick={() => copyCodeToClipboard(codeString)}
                        className="flex items-center gap-1 hover:text-white transition"
                      >
                        {copiedCode === codeString ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};
