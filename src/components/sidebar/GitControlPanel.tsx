import React, { useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useToastStore } from '../../stores/useToastStore';
import { GitBranch, GitCommit, GitPullRequest, FileCode, Plus, Minus, CheckCircle2 } from 'lucide-react';

export const GitControlPanel: React.FC = () => {
  const { files, markFileSaved } = useFileStore();
  const { addToast } = useToastStore();
  const [commitMsg, setCommitMsg] = useState('');
  const [stagedIds, setStagedIds] = useState<string[]>([]);
  const [commits, setCommits] = useState<Array<{ id: string; msg: string; date: string; filesCount: number }>>([
    { id: 'c1a2f3', msg: 'Initial commit — CodeStudio workspace setup', date: '2 hours ago', filesCount: 5 },
  ]);

  const modifiedFiles = files.filter(f => f.type === 'file' && f.isModified);

  const toggleStage = (id: string) => {
    if (stagedIds.includes(id)) {
      setStagedIds(stagedIds.filter(i => i !== id));
    } else {
      setStagedIds([...stagedIds, id]);
    }
  };

  const stageAll = () => {
    setStagedIds(modifiedFiles.map(f => f.id));
  };

  const handleCommit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commitMsg.trim()) {
      addToast({ type: 'warning', title: 'Commit Message Required', message: 'Please enter a commit summary.' });
      return;
    }

    const targetIds = stagedIds.length > 0 ? stagedIds : modifiedFiles.map(f => f.id);
    if (targetIds.length === 0) {
      addToast({ type: 'info', title: 'Nothing to Commit', message: 'No modified files to commit.' });
      return;
    }

    // Mark committed files as saved
    targetIds.forEach(id => markFileSaved(id));

    const newCommit = {
      id: Math.random().toString(16).substr(2, 6),
      msg: commitMsg.trim(),
      date: 'Just now',
      filesCount: targetIds.length,
    };

    setCommits([newCommit, ...commits]);
    setCommitMsg('');
    setStagedIds([]);

    addToast({
      type: 'success',
      title: 'Git Commit Success',
      message: `Committed ${targetIds.length} files [${newCommit.id}].`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-orange-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Source Control</span>
        </div>
        <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30 flex items-center gap-1">
          <GitBranch className="w-2.5 h-2.5" /> main
        </span>
      </div>

      <div className="p-3 space-y-4">
        {/* Commit Form */}
        <form onSubmit={handleCommit} className="space-y-2">
          <textarea
            rows={2}
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder="Message (e.g., feat: add mermaid preview)"
            className="w-full bg-slate-900 border border-slate-700/80 rounded p-2 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 font-mono transition resize-none"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold shadow transition"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit ({stagedIds.length > 0 ? stagedIds.length : modifiedFiles.length})</span>
          </button>
        </form>

        {/* Changes List Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Changes ({modifiedFiles.length})</span>
            {modifiedFiles.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={stageAll}
                  className="hover:text-white p-0.5 text-[10px] underline"
                  title="Stage All"
                >
                  Stage All
                </button>
              </div>
            )}
          </div>

          {modifiedFiles.length === 0 ? (
            <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Working tree clean</span>
            </div>
          ) : (
            <div className="space-y-1">
              {modifiedFiles.map((file) => {
                const isStaged = stagedIds.includes(file.id);
                return (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-2 rounded text-xs transition border ${
                      isStaged
                        ? 'bg-orange-950/30 border-orange-800/60 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 font-mono text-[11px]">
                      <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-amber-400 font-mono font-bold">M</span>
                      <button
                        onClick={() => toggleStage(file.id)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                        title={isStaged ? 'Unstage' : 'Stage'}
                      >
                        {isStaged ? <Minus className="w-3 h-3 text-orange-400" /> : <Plus className="w-3 h-3 text-emerald-400" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Commit Log History */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Commit History</span>
            <GitPullRequest className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="space-y-1.5">
            {commits.map((c) => (
              <div key={c.id} className="p-2 bg-slate-900/40 border border-slate-800/80 rounded text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-orange-400 font-bold">{c.id}</span>
                  <span className="text-[10px] text-slate-500">{c.date}</span>
                </div>
                <p className="text-[11px] text-slate-200 truncate">{c.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
