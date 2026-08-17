import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useToastStore } from '../../stores/useToastStore';
import {
  Search,
  FileText,
  Replace,
  ChevronDown,
  ChevronRight,
  CaseSensitive,
  WholeWord,
  Regex,
  CheckCheck,
} from 'lucide-react';

interface FileMatchGroup {
  fileId: string;
  fileName: string;
  filePath: string;
  matches: {
    line: number;
    content: string;
    startIndex: number;
    matchText: string;
  }[];
}

export const GlobalSearch: React.FC = () => {
  const { files, openFileInTab, updateFileContent, saveAllFiles } = useFileStore();
  const { addToast } = useToastStore();

  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});

  const getSearchResults = (): FileMatchGroup[] => {
    if (!query.trim()) return [];
    const groups: FileMatchGroup[] = [];

    let regex: RegExp;
    try {
      let pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (matchWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
    } catch {
      return [];
    }

    files.forEach((f) => {
      if (f.type === 'file' && f.content && !f.content.startsWith('data:')) {
        const lines = f.content.split('\n');
        const fileMatches: FileMatchGroup['matches'] = [];

        lines.forEach((lineText, index) => {
          regex.lastIndex = 0;
          let match: RegExpExecArray | null;
          if (regex.test(lineText)) {
            regex.lastIndex = 0;
            while ((match = regex.exec(lineText)) !== null) {
              fileMatches.push({
                line: index + 1,
                content: lineText,
                startIndex: match.index,
                matchText: match[0],
              });
              if (!matchCase && !useRegex) break; // Avoid infinite loops on empty matches
            }
          }
        });

        if (fileMatches.length > 0) {
          groups.push({
            fileId: f.id,
            fileName: f.name,
            filePath: f.path,
            matches: fileMatches,
          });
        }
      }
    });

    return groups;
  };

  const fileGroups = getSearchResults();
  const totalMatchCount = fileGroups.reduce((acc, g) => acc + g.matches.length, 0);

  const toggleFileCollapse = (fileId: string) => {
    setCollapsedFiles((prev) => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const handleReplaceAllInFile = (fileId: string) => {
    const targetFile = files.find((f) => f.id === fileId);
    if (!targetFile || !targetFile.content) return;

    let regex: RegExp;
    try {
      let pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (matchWholeWord) pattern = `\\b${pattern}\\b`;
      regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
    } catch {
      return;
    }

    const newContent = targetFile.content.replace(regex, replaceQuery);
    updateFileContent(fileId, newContent);
    addToast({
      type: 'success',
      title: 'Replaced in File',
      message: `Updated matches in ${targetFile.name}`,
    });
  };

  const handleReplaceAllWorkspace = async () => {
    if (!query.trim() || fileGroups.length === 0) return;

    let regex: RegExp;
    try {
      let pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (matchWholeWord) pattern = `\\b${pattern}\\b`;
      regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
    } catch {
      return;
    }

    let filesModified = 0;
    fileGroups.forEach((g) => {
      const file = files.find((f) => f.id === g.fileId);
      if (file && file.content) {
        const newContent = file.content.replace(regex, replaceQuery);
        updateFileContent(file.id, newContent);
        filesModified++;
      }
    });

    await saveAllFiles();
    addToast({
      type: 'success',
      title: 'Global Replace Complete',
      message: `Replaced ${totalMatchCount} occurrences across ${filesModified} files.`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e] flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Search Workspace</span>
        <button
          onClick={() => setShowReplace(!showReplace)}
          className={`p-1 rounded text-xs transition ${showReplace ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Toggle Replace Mode"
        >
          <Replace className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search & Replace Input Container */}
      <div className="p-3 border-b border-slate-800 space-y-2 bg-[#14141f]">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
          <input
            type="text"
            placeholder="Search across workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-xs pl-8 pr-20 py-1.5 rounded border border-slate-700 focus:border-blue-500 outline-none font-mono"
          />
          {/* Toggles */}
          <div className="absolute right-1 flex items-center gap-0.5">
            <button
              onClick={() => setMatchCase(!matchCase)}
              className={`p-1 rounded text-[10px] transition ${matchCase ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Match Case (Alt+C)"
            >
              <CaseSensitive className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMatchWholeWord(!matchWholeWord)}
              className={`p-1 rounded text-[10px] transition ${matchWholeWord ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Match Whole Word (Alt+W)"
            >
              <WholeWord className="w-3 h-3" />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`p-1 rounded text-[10px] transition ${useRegex ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Use Regular Expression (Alt+R)"
            >
              <Regex className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Replace Bar (Collapsible) */}
        {showReplace && (
          <div className="relative flex items-center animate-fade-in">
            <Replace className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-xs pl-8 pr-20 py-1.5 rounded border border-slate-700 focus:border-cyan-500 outline-none font-mono"
            />
            <button
              onClick={handleReplaceAllWorkspace}
              disabled={!query.trim() || fileGroups.length === 0}
              className="absolute right-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded text-[10px] font-semibold transition flex items-center gap-1"
              title="Replace All across workspace"
            >
              <CheckCheck className="w-3 h-3" /> All
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono pt-1">
          <span>{totalMatchCount} results in {fileGroups.length} files</span>
          {query && (
            <button onClick={() => setQuery('')} className="hover:text-white underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Match Results (Grouped by File) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {query.trim() && fileGroups.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No matching text found</div>
        ) : (
          fileGroups.map((group) => {
            const isCollapsed = collapsedFiles[group.fileId];
            return (
              <div key={group.fileId} className="rounded-lg bg-slate-900/60 border border-slate-800/80 overflow-hidden">
                {/* File Header */}
                <div
                  onClick={() => toggleFileCollapse(group.fileId)}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-[#1e1e2e]/70 hover:bg-slate-800 cursor-pointer transition text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0 font-mono text-slate-200">
                    {isCollapsed ? <ChevronRight className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-semibold truncate">{group.fileName}</span>
                    <span className="text-[10px] text-slate-500 truncate">{group.filePath}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[10px] font-mono">
                      {group.matches.length}
                    </span>
                    {showReplace && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplaceAllInFile(group.fileId);
                        }}
                        className="p-1 hover:bg-blue-600 text-slate-400 hover:text-white rounded text-[10px] transition"
                        title="Replace in this file"
                      >
                        <Replace className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Line Match Snippets */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-800/40 p-1 bg-black/20">
                    {group.matches.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={() => openFileInTab(group.fileId)}
                        className="flex items-start gap-2 px-2 py-1 hover:bg-slate-800/70 cursor-pointer rounded text-[11px] font-mono transition"
                      >
                        <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">:{m.line}</span>
                        <p className="text-slate-300 truncate flex-1">
                          {m.content.trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
