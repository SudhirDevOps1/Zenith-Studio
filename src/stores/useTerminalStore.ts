import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TerminalShellType = 'powershell' | 'cmd' | 'bash' | 'node' | 'python' | 'sandbox';

export type TerminalThemeId =
  | 'vscode'
  | 'matrix'
  | 'cyberpunk'
  | 'dracula'
  | 'monokai'
  | 'solarized'
  | 'nord'
  | 'pureblack';

export interface TerminalEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  text: string;
  timestamp: string;
}

export interface TerminalSession {
  id: string;
  name: string;
  type: TerminalShellType;
  entries: TerminalEntry[];
  history: string[];
  historyIdx: number;
  cwd: string;
  isRunning: boolean;
  createdAt: number;
}

export interface QuickCommand {
  id: string;
  label: string;
  command: string;
  icon?: string;
  color?: string;
}

export interface TerminalSettings {
  theme: TerminalThemeId;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  cursorStyle: 'block' | 'line' | 'underline';
  cursorBlink: boolean;
  promptGlyph: string;
  showTimestamps: boolean;
  clearOnRestart: boolean;
  quickCommands: QuickCommand[];
}

export const TERMINAL_THEMES: Record<
  TerminalThemeId,
  {
    name: string;
    background: string;
    foreground: string;
    promptColor: string;
    inputColor: string;
    outputColor: string;
    errorColor: string;
    infoColor: string;
    borderColor: string;
    activeTabBg: string;
  }
> = {
  vscode: {
    name: 'VS Code Dark (Default)',
    background: '#0d0e17',
    foreground: '#d4d4d4',
    promptColor: '#38bdf8',
    inputColor: '#ffffff',
    outputColor: '#cbd5e1',
    errorColor: '#f87171',
    infoColor: '#60a5fa',
    borderColor: '#1e293b',
    activeTabBg: '#1e2030',
  },
  matrix: {
    name: 'Matrix Hacker Green',
    background: '#050c06',
    foreground: '#22c55e',
    promptColor: '#4ade80',
    inputColor: '#86efac',
    outputColor: '#22c55e',
    errorColor: '#ef4444',
    infoColor: '#10b981',
    borderColor: '#064e3b',
    activeTabBg: '#062d14',
  },
  cyberpunk: {
    name: 'Cyberpunk Neon Synth',
    background: '#0a0618',
    foreground: '#e0e7ff',
    promptColor: '#06b6d4',
    inputColor: '#f43f5e',
    outputColor: '#c084fc',
    errorColor: '#fb7185',
    infoColor: '#38bdf8',
    borderColor: '#4c1d95',
    activeTabBg: '#1e1035',
  },
  dracula: {
    name: 'Dracula Official',
    background: '#181926',
    foreground: '#f8f8f2',
    promptColor: '#50fa7b',
    inputColor: '#f1fa8c',
    outputColor: '#bd93f9',
    errorColor: '#ff5555',
    infoColor: '#8be9fd',
    borderColor: '#44475a',
    activeTabBg: '#282a36',
  },
  monokai: {
    name: 'Monokai Pro',
    background: '#19181a',
    foreground: '#fcfcfa',
    promptColor: '#ffd866',
    inputColor: '#a9dc76',
    outputColor: '#e0dfdb',
    errorColor: '#ff6188',
    infoColor: '#78dce8',
    borderColor: '#3a383d',
    activeTabBg: '#2d2a2e',
  },
  solarized: {
    name: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    promptColor: '#268bd2',
    inputColor: '#93a1a1',
    outputColor: '#657b83',
    errorColor: '#dc322f',
    infoColor: '#2aa198',
    borderColor: '#073642',
    activeTabBg: '#073642',
  },
  nord: {
    name: 'Nord Frost',
    background: '#1e222a',
    foreground: '#d8dee9',
    promptColor: '#88c0d0',
    inputColor: '#eceff4',
    outputColor: '#e5e9f0',
    errorColor: '#bf616a',
    infoColor: '#81a1c1',
    borderColor: '#2e3440',
    activeTabBg: '#2e3440',
  },
  pureblack: {
    name: 'OLED Pure Black',
    background: '#000000',
    foreground: '#e2e8f0',
    promptColor: '#00f0ff',
    inputColor: '#ffffff',
    outputColor: '#94a3b8',
    errorColor: '#ff3366',
    infoColor: '#38bdf8',
    borderColor: '#18181b',
    activeTabBg: '#121214',
  },
};

export const DEFAULT_QUICK_COMMANDS: QuickCommand[] = [
  { id: 'dev', label: 'npm run dev', command: 'npm run dev', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' },
  { id: 'build', label: 'npm run build', command: 'npm run build', color: 'bg-blue-600/30 text-blue-300 border-blue-500/40' },
  { id: 'test', label: 'npm test', command: 'npm test', color: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' },
  { id: 'git-status', label: 'git status', command: 'git status', color: 'bg-amber-600/30 text-amber-300 border-amber-500/40' },
  { id: 'git-log', label: 'git log', command: 'git log --oneline -n 5', color: 'bg-purple-600/30 text-purple-300 border-purple-500/40' },
  { id: 'python', label: 'python --version', command: 'python --version', color: 'bg-yellow-600/30 text-yellow-300 border-yellow-500/40' },
  { id: 'gcc', label: 'gcc --version', command: 'gcc --version', color: 'bg-cyan-600/30 text-cyan-300 border-cyan-500/40' },
  { id: 'cls', label: 'clear', command: 'clear', color: 'bg-slate-700/50 text-slate-300 border-slate-600/40' },
];

interface TerminalState {
  sessions: TerminalSession[];
  activeSessionId: string;
  splitSessionId: string | null;
  settings: TerminalSettings;

  // Actions
  createSession: (type?: TerminalShellType, name?: string, initialCwd?: string) => string;
  removeSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  setSplitSession: (id: string | null) => void;
  renameSession: (id: string, newName: string) => void;
  setSessionType: (id: string, newType: TerminalShellType) => void;
  setSessionRunning: (id: string, isRunning: boolean) => void;
  setSessionCwd: (id: string, cwd: string) => void;
  addEntry: (sessionId: string, type: TerminalEntry['type'], text: string) => void;
  clearSession: (sessionId: string) => void;
  addHistory: (sessionId: string, cmd: string) => void;
  setHistoryIdx: (sessionId: string, idx: number) => void;
  updateSettings: (partial: Partial<TerminalSettings>) => void;
  addQuickCommand: (label: string, command: string) => void;
  removeQuickCommand: (id: string) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: TerminalSettings = {
  theme: 'vscode',
  fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
  fontSize: 12,
  lineHeight: 1.45,
  cursorStyle: 'block',
  cursorBlink: true,
  promptGlyph: '❯',
  showTimestamps: false,
  clearOnRestart: false,
  quickCommands: DEFAULT_QUICK_COMMANDS,
};

const createInitialSession = (cwd = ''): TerminalSession => ({
  id: 'term-default',
  name: 'PowerShell',
  type: 'powershell',
  entries: [],
  history: [],
  historyIdx: -1,
  cwd,
  isRunning: false,
  createdAt: Date.now(),
});

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      sessions: [createInitialSession()],
      activeSessionId: 'term-default',
      splitSessionId: null,
      settings: DEFAULT_SETTINGS,

      createSession: (type = 'powershell', name, initialCwd = '') => {
        const id = 'term-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        const autoName =
          name ||
          (type === 'cmd'
            ? 'Command Prompt'
            : type === 'bash'
            ? 'Git Bash'
            : type === 'node'
            ? 'Node.js'
            : type === 'python'
            ? 'Python'
            : `Terminal ${get().sessions.length + 1}`);

        const newSession: TerminalSession = {
          id,
          name: autoName,
          type,
          entries: [],
          history: [],
          historyIdx: -1,
          cwd: initialCwd,
          isRunning: false,
          createdAt: Date.now(),
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: id,
        }));

        return id;
      },

      removeSession: (id: string) => {
        const { sessions, activeSessionId, splitSessionId } = get();
        if (sessions.length <= 1) {
          // If only 1 session left, reset it rather than leaving 0
          get().clearSession(id);
          return;
        }

        const remaining = sessions.filter((s) => s.id !== id);
        let nextActive = activeSessionId;
        if (activeSessionId === id) {
          nextActive = remaining[0]?.id || '';
        }

        let nextSplit = splitSessionId;
        if (splitSessionId === id) {
          nextSplit = null;
        }

        set({
          sessions: remaining,
          activeSessionId: nextActive,
          splitSessionId: nextSplit,
        });
      },

      setActiveSession: (id: string) => {
        set({ activeSessionId: id });
      },

      setSplitSession: (id: string | null) => {
        set({ splitSessionId: id });
      },

      renameSession: (id: string, newName: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, name: newName } : s)),
        }));
      },

      setSessionType: (id: string, newType: TerminalShellType) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, type: newType } : s)),
        }));
      },

      setSessionRunning: (id: string, isRunning: boolean) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, isRunning } : s)),
        }));
      },

      setSessionCwd: (id: string, cwd: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, cwd } : s)),
        }));
      },

      addEntry: (sessionId: string, type: TerminalEntry['type'], text: string) => {
        const newEntry: TerminalEntry = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          type,
          text,
          timestamp: new Date().toLocaleTimeString(),
        };

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  entries: [...s.entries, newEntry].slice(-1000), // Keep buffer to 1000 items
                }
              : s
          ),
        }));
      },

      clearSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, entries: [] } : s)),
        }));
      },

      addHistory: (sessionId: string, cmd: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  history: [cmd, ...s.history.filter((h) => h !== cmd)].slice(0, 100),
                  historyIdx: -1,
                }
              : s
          ),
        }));
      },

      setHistoryIdx: (sessionId: string, idx: number) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, historyIdx: idx } : s)),
        }));
      },

      updateSettings: (partial: Partial<TerminalSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      addQuickCommand: (label: string, command: string) => {
        const newCmd: QuickCommand = {
          id: 'qc-' + Date.now().toString(36),
          label,
          command,
          color: 'bg-cyan-600/30 text-cyan-300 border-cyan-500/40',
        };
        set((state) => ({
          settings: {
            ...state.settings,
            quickCommands: [...state.settings.quickCommands, newCmd],
          },
        }));
      },

      removeQuickCommand: (id: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quickCommands: state.settings.quickCommands.filter((q) => q.id !== id),
          },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'codestudio_terminal_storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
