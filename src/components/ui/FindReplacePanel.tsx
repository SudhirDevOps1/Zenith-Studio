import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown, Replace, ReplaceAll, ArrowRightLeft } from 'lucide-react';

interface FindReplacePanelProps {
  content: string;
  editorRef: any;
  monacoRef: any;
  onClose: () => void;
}

export const FindReplacePanel: React.FC<FindReplacePanelProps> = ({
  content,
  editorRef,
  monacoRef,
  onClose,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showReplace, setShowReplace] = useState(false);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!content || !findText) {
      setMatchCount(0);
      return;
    }

    const flags = isCaseSensitive ? 'g' : 'gi';
    const pattern = isRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(pattern, flags);
      const matches = content.match(regex);
      setMatchCount(matches ? matches.length : 0);
      setCurrentMatchIndex(0);
    } catch {
      setMatchCount(0);
    }
  }, [findText, isCaseSensitive, isRegex, content]);

  // Use Monaco's built-in find widget if monaco is available
  const triggerFind = () => {
    if (editorRef.current && monacoRef.current) {
      editorRef.current.trigger('keyboard', 'actions.find');
      onClose();
      return;
    }
  };

  const findNext = () => {
    if (editorRef.current && monacoRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.nextMatchFindAction');
    }
  };

  const findPrev = () => {
    if (editorRef.current && monacoRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.previousMatchFindAction');
    }
  };

  const handleReplace = () => {
    if (editorRef.current && monacoRef.current && findText) {
      editorRef.current.trigger('keyboard', 'editor.action.replace');
    }
  };

  const handleReplaceAll = () => {
    if (editorRef.current && monacoRef.current && findText) {
      editorRef.current.trigger('keyboard', 'editor.action.replaceAll');
    }
  };

  return (
    <div className="absolute top-0 right-4 z-40 w-96 bg-[#1e1e2e] border border-slate-700 shadow-2xl rounded-b-lg animate-fade-in-up font-mono text-xs text-slate-200">
      {/* Find Row */}
      <div className="flex items-center gap-1.5 p-2 border-b border-slate-800">
        <input
          ref={findInputRef}
          type="text"
          placeholder="Search..."
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none focus:border-blue-500 transition placeholder-slate-500"
        />
        {matchCount > 0 && (
          <span className="text-[11px] text-slate-400 shrink-0">{currentMatchIndex + 1} / {matchCount}</span>
        )}
        <button
          onClick={findPrev}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          title="Previous Match"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={findNext}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          title="Next Match"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsCaseSensitive(!isCaseSensitive)}
          className={`px-1.5 py-1 rounded text-[10px] font-bold transition ${
            isCaseSensitive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Case Sensitive"
        >
          Aa
        </button>
        <button
          onClick={() => setIsRegex(!isRegex)}
          className={`px-1.5 py-1 rounded text-[10px] font-bold transition ${
            isRegex ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Use Regex"
        >
          .*
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Replace Row */}
      {showReplace && (
        <div className="flex items-center gap-1.5 p-2 border-b border-slate-800 animate-fade-in-up">
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white outline-none focus:border-blue-500 transition placeholder-slate-500"
          />
          <button
            onClick={handleReplace}
            className="flex items-center gap-1 p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Replace"
          >
            <Replace className="w-3.5 h-3.5" />
            <span className="text-[10px]">Replace</span>
          </button>
          <button
            onClick={handleReplaceAll}
            className="flex items-center gap-1 p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Replace All"
          >
            <ReplaceAll className="w-3.5 h-3.5" />
            <span className="text-[10px]">All</span>
          </button>
        </div>
      )}

      {/* Toggle Replace Button */}
      <div className="flex items-center justify-between p-1.5 px-2 bg-[#181825]">
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
        >
          <ArrowRightLeft className="w-3 h-3" />
          {showReplace ? 'Hide Replace' : 'Show Replace'}
        </button>
        <button
          onClick={triggerFind}
          className="text-[10px] text-slate-500 hover:text-slate-300 underline transition"
        >
          Open Native Find (Ctrl+F)
        </button>
      </div>
    </div>
  );
};
