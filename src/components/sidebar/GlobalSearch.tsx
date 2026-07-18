import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { Search, FileText } from 'lucide-react';

interface MatchItem {
  fileId: string;
  fileName: string;
  filePath: string;
  line: number;
  content: string;
}

export const GlobalSearch: React.FC = () => {
  const { files, openFileInTab } = useFileStore();
  const [query, setQuery] = useState('');

  const getSearchResults = (): MatchItem[] => {
    if (!query.trim()) return [];
    const results: MatchItem[] = [];

    files.forEach(f => {
      if (f.type === 'file' && f.content) {
        const lines = f.content.split('\n');
        lines.forEach((lineText, index) => {
          if (lineText.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              fileId: f.id,
              fileName: f.name,
              filePath: f.path,
              line: index + 1,
              content: lineText.trim(),
            });
          }
        });
      }
    });

    return results;
  };

  const matches = getSearchResults();

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none">
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Search Workspace</span>
      </div>

      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search across all files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-xs pl-8 pr-3 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none transition font-mono"
          />
        </div>
        <div className="text-[11px] text-slate-400 flex justify-between">
          <span>Results: {matches.length} matches</span>
          {query && (
            <button onClick={() => setQuery('')} className="hover:text-white underline">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {query.trim() && matches.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">No matching text found</div>
        ) : (
          matches.map((match, idx) => (
            <div
              key={idx}
              onClick={() => openFileInTab(match.fileId)}
              className="p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 cursor-pointer transition space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-mono">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">{match.filePath}</span>
                <span className="text-slate-500 text-[10px] ml-auto">Line {match.line}</span>
              </div>
              <p className="text-[11px] font-mono text-slate-300 bg-black/30 p-1 rounded truncate">
                {match.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
