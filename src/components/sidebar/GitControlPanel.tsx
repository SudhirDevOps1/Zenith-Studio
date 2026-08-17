import React, { useState, useEffect, useCallback } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useToastStore } from '../../stores/useToastStore';
import { isElectron } from '../../utils/fileUtils';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  FileCode,
  Plus,
  Minus,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Loader2,
} from 'lucide-react';

interface RealGitCommit {
  id: string;
  msg: string;
  date: string;
  author: string;
}

interface GitFileStatus {
  path: string;
  status: 'M' | 'A' | 'D' | '?' | 'U';
  isStaged: boolean;
}

export const GitControlPanel: React.FC = () => {
  const { files, rootFolderPath, markFileSaved } = useFileStore();
  const { addToast } = useToastStore();

  const [branch, setBranch] = useState<string>('main');
  const [commitMsg, setCommitMsg] = useState('');
  const [gitStatusFiles, setGitStatusFiles] = useState<GitFileStatus[]>([]);
  const [commits, setCommits] = useState<RealGitCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);

  const isDesktop = isElectron();

  // Fetch real Git status & commit logs in Desktop mode
  const fetchGitData = useCallback(async () => {
    if (!isDesktop || !(window as any).electronAPI?.execTerminalCommand) {
      // Web Mode: Map real modified files from store
      const webModified = files
        .filter((f) => f.type === 'file' && f.isModified)
        .map((f) => ({
          path: f.path,
          status: 'M' as const,
          isStaged: false,
        }));
      setGitStatusFiles(webModified);
      return;
    }

    setLoading(true);
    try {
      const cwd = rootFolderPath || undefined;

      // 1. Get real active branch
      const branchRes = await (window as any).electronAPI.execTerminalCommand({
        command: 'git rev-parse --abbrev-ref HEAD',
        cwd,
      });
      if (branchRes.stdout?.trim()) {
        setBranch(branchRes.stdout.trim());
      }

      // 2. Get real git status --porcelain
      const statusRes = await (window as any).electronAPI.execTerminalCommand({
        command: 'git status --porcelain',
        cwd,
      });

      if (statusRes.stdout !== undefined) {
        const lines = statusRes.stdout.split('\n').filter((l: string) => l.trim().length > 0);
        const parsed: GitFileStatus[] = lines.map((line: string) => {
          const indexStatus = line.charAt(0);
          const worktreeStatus = line.charAt(1);
          const filePath = line.slice(3).trim();

          let statusLetter: 'M' | 'A' | 'D' | '?' | 'U' = 'M';
          if (line.includes('??')) statusLetter = '?';
          else if (indexStatus === 'A' || worktreeStatus === 'A') statusLetter = 'A';
          else if (indexStatus === 'D' || worktreeStatus === 'D') statusLetter = 'D';

          const isStaged = indexStatus !== ' ' && indexStatus !== '?';
          return {
            path: filePath,
            status: statusLetter,
            isStaged,
          };
        });
        setGitStatusFiles(parsed);
      }

      // 3. Get real git log
      const logRes = await (window as any).electronAPI.execTerminalCommand({
        command: 'git log -n 10 --pretty=format:"%h||%s||%cr||%an"',
        cwd,
      });

      if (logRes.stdout?.trim()) {
        const commitLines = logRes.stdout.split('\n').filter(Boolean);
        const parsedCommits: RealGitCommit[] = commitLines.map((c: string) => {
          const [id, msg, date, author] = c.split('||');
          return {
            id: id?.trim() || 'commit',
            msg: msg?.trim() || '',
            date: date?.trim() || '',
            author: author?.trim() || '',
          };
        });
        setCommits(parsedCommits);
      } else {
        setCommits([]);
      }
    } catch {
      // Ignore git errors if folder is not a git repo yet
    } finally {
      setLoading(false);
    }
  }, [isDesktop, rootFolderPath, files]);

  useEffect(() => {
    fetchGitData();
  }, [fetchGitData]);

  // Stage or Unstage a single file
  const handleToggleStage = async (file: GitFileStatus) => {
    if (!isDesktop || !(window as any).electronAPI?.execTerminalCommand) {
      setGitStatusFiles((prev) =>
        prev.map((f) => (f.path === file.path ? { ...f, isStaged: !f.isStaged } : f))
      );
      return;
    }

    try {
      const cwd = rootFolderPath || undefined;
      const cmd = file.isStaged
        ? `git restore --staged "${file.path}"`
        : `git add "${file.path}"`;
      await (window as any).electronAPI.execTerminalCommand({ command: cmd, cwd });
      fetchGitData();
    } catch {
      addToast({ type: 'error', title: 'Git Action Failed', message: `Could not stage ${file.path}` });
    }
  };

  // Stage All Files
  const handleStageAll = async () => {
    if (!isDesktop || !(window as any).electronAPI?.execTerminalCommand) {
      setGitStatusFiles((prev) => prev.map((f) => ({ ...f, isStaged: true })));
      return;
    }

    try {
      const cwd = rootFolderPath || undefined;
      await (window as any).electronAPI.execTerminalCommand({ command: 'git add -A', cwd });
      fetchGitData();
      addToast({ type: 'success', title: 'All Changes Staged', message: 'All files added to git index.' });
    } catch {
      addToast({ type: 'error', title: 'Stage All Failed', message: 'Git command failed.' });
    }
  };

  // Real Git Commit
  const handleCommit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commitMsg.trim()) {
      addToast({ type: 'warning', title: 'Commit Message Required', message: 'Please enter a commit message.' });
      return;
    }

    if (gitStatusFiles.length === 0) {
      addToast({ type: 'info', title: 'Nothing to Commit', message: 'Working tree clean.' });
      return;
    }

    if (isDesktop && (window as any).electronAPI?.execTerminalCommand) {
      setLoading(true);
      try {
        const cwd = rootFolderPath || undefined;
        // Auto-stage all if none staged
        const hasStaged = gitStatusFiles.some((f) => f.isStaged);
        if (!hasStaged) {
          await (window as any).electronAPI.execTerminalCommand({ command: 'git add -A', cwd });
        }

        const safeMsg = commitMsg.trim().replace(/"/g, '\\"');
        const res = await (window as any).electronAPI.execTerminalCommand({
          command: `git commit -m "${safeMsg}"`,
          cwd,
        });

        if (res.code === 0) {
          addToast({
            type: 'success',
            title: 'Git Commit Success',
            message: commitMsg.trim(),
          });
          setCommitMsg('');
          fetchGitData();
        } else {
          addToast({
            type: 'error',
            title: 'Commit Failed',
            message: res.stderr || res.stdout || 'Git commit error.',
          });
        }
      } catch (err: any) {
        addToast({ type: 'error', title: 'Commit Failed', message: err.message });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Web Browser Mode: Commit modified files
    const modifiedFileIds = files.filter((f) => f.isModified).map((f) => f.id);
    modifiedFileIds.forEach((id) => markFileSaved(id));

    setCommits((prev) => [
      {
        id: Math.random().toString(16).substring(2, 8),
        msg: commitMsg.trim(),
        date: 'Just now',
        author: 'You (Web Workspace)',
      },
      ...prev,
    ]);
    setCommitMsg('');
    setGitStatusFiles([]);

    addToast({
      type: 'success',
      title: 'Workspace Snapshot Committed',
      message: `Committed ${modifiedFileIds.length} file(s).`,
    });
  };

  // Real Git Push
  const handlePush = async () => {
    if (!isDesktop || !(window as any).electronAPI?.execTerminalCommand) {
      addToast({ type: 'info', title: 'Web Mode', message: 'Git remote push requires Desktop Electron app.' });
      return;
    }

    setPushing(true);
    try {
      const cwd = rootFolderPath || undefined;
      const res = await (window as any).electronAPI.execTerminalCommand({
        command: 'git push',
        cwd,
      });

      if (res.code === 0) {
        addToast({ type: 'success', title: 'Git Push Succeeded', message: 'Remote repository updated.' });
        fetchGitData();
      } else {
        addToast({
          type: 'error',
          title: 'Git Push Failed',
          message: res.stderr || res.stdout || 'Check remote repository credentials.',
        });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Push Failed', message: err.message });
    } finally {
      setPushing(false);
    }
  };

  // Real Git Pull
  const handlePull = async () => {
    if (!isDesktop || !(window as any).electronAPI?.execTerminalCommand) {
      addToast({ type: 'info', title: 'Web Mode', message: 'Git remote pull requires Desktop Electron app.' });
      return;
    }

    setPulling(true);
    try {
      const cwd = rootFolderPath || undefined;
      const res = await (window as any).electronAPI.execTerminalCommand({
        command: 'git pull',
        cwd,
      });

      if (res.code === 0) {
        addToast({ type: 'success', title: 'Git Pull Succeeded', message: 'Synced with latest remote changes.' });
        fetchGitData();
      } else {
        addToast({
          type: 'error',
          title: 'Git Pull Failed',
          message: res.stderr || res.stdout || 'Could not pull remote changes.',
        });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Pull Failed', message: err.message });
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-orange-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
            Source Control
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30 flex items-center gap-1">
            <GitBranch className="w-2.5 h-2.5" /> {branch}
          </span>
          <button
            onClick={fetchGitData}
            disabled={loading}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Refresh Git Status"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4 text-xs">
        {/* Remote Sync Buttons (Push / Pull) */}
        {isDesktop && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePull}
              disabled={pulling}
              className="flex items-center justify-center gap-1 py-1 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded font-medium text-[11px] transition shadow-sm"
              title="Pull from remote (git pull)"
            >
              {pulling ? <Loader2 className="w-3 h-3 animate-spin text-cyan-400" /> : <DownloadCloud className="w-3 h-3 text-cyan-400" />}
              <span>Pull</span>
            </button>
            <button
              onClick={handlePush}
              disabled={pushing}
              className="flex items-center justify-center gap-1 py-1 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded font-medium text-[11px] transition shadow-sm"
              title="Push to remote (git push)"
            >
              {pushing ? <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> : <UploadCloud className="w-3 h-3 text-emerald-400" />}
              <span>Push</span>
            </button>
          </div>
        )}

        {/* Commit Form */}
        <form onSubmit={handleCommit} className="space-y-2">
          <textarea
            rows={2}
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder="Commit message (e.g. feat: add terminal)..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded p-2 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 font-mono transition resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold shadow transition cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCommit className="w-3.5 h-3.5" />}
            <span>Commit ({gitStatusFiles.length})</span>
          </button>
        </form>

        {/* Changes List Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Changes ({gitStatusFiles.length})</span>
            {gitStatusFiles.length > 0 && (
              <button
                onClick={handleStageAll}
                className="hover:text-orange-400 p-0.5 text-[10px] underline cursor-pointer"
                title="Stage all changes (git add -A)"
              >
                Stage All
              </button>
            )}
          </div>

          {gitStatusFiles.length === 0 ? (
            <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Working tree clean</span>
            </div>
          ) : (
            <div className="space-y-1">
              {gitStatusFiles.map((file) => (
                <div
                  key={file.path}
                  className={`flex items-center justify-between p-2 rounded text-xs transition border ${
                    file.isStaged
                      ? 'bg-orange-950/30 border-orange-800/60 text-white'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 font-mono text-[11px]">
                    <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate" title={file.path}>
                      {file.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        file.status === 'M'
                          ? 'text-amber-400'
                          : file.status === 'A' || file.status === '?'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {file.status}
                    </span>
                    <button
                      onClick={() => handleToggleStage(file)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition cursor-pointer"
                      title={file.isStaged ? 'Unstage file' : 'Stage file'}
                    >
                      {file.isStaged ? (
                        <Minus className="w-3 h-3 text-orange-400" />
                      ) : (
                        <Plus className="w-3 h-3 text-emerald-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
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
            {commits.length === 0 ? (
              <div className="p-2 text-center text-slate-500 text-[11px]">
                No recent commits found.
              </div>
            ) : (
              commits.map((c) => (
                <div
                  key={c.id}
                  className="p-2 bg-slate-900/40 border border-slate-800/80 rounded text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-orange-400 font-bold">
                      {c.id}
                    </span>
                    <span className="text-[10px] text-slate-500">{c.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 truncate">{c.msg}</p>
                  {c.author && (
                    <div className="text-[9px] text-slate-500">by {c.author}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
