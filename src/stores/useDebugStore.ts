import { create } from 'zustand';

export interface Breakpoint {
  id: string;
  fileId: string;
  filePath: string;
  lineNumber: number;
  enabled: boolean;
}

export interface CallStackFrame {
  id: string;
  name: string;
  fileId: string;
  filePath: string;
  lineNumber: number;
  column: number;
}

export interface ScopeVariable {
  name: string;
  value: string;
  type: string;
}

export type DebugSessionState = 'inactive' | 'running' | 'paused';

interface DebugStoreState {
  sessionState: DebugSessionState;
  activeFileId: string | null;
  activeLineNumber: number | null;
  breakpoints: Breakpoint[];
  callStack: CallStackFrame[];
  variables: ScopeVariable[];
  watchExpressions: string[];
  consoleLogs: string[];

  // Actions
  toggleBreakpoint: (fileId: string, filePath: string, lineNumber: number) => void;
  removeBreakpoint: (id: string) => void;
  toggleBreakpointEnabled: (id: string) => void;
  clearAllBreakpoints: () => void;

  startDebugging: (fileId: string, filePath: string, content: string) => void;
  stopDebugging: () => void;
  pauseExecution: () => void;
  continueExecution: () => void;
  stepOver: () => void;
  stepInto: () => void;
  stepOut: () => void;
  restartDebugging: () => void;

  addWatch: (expr: string) => void;
  removeWatch: (expr: string) => void;
  addConsoleLog: (log: string) => void;
  clearConsoleLogs: () => void;
}

export const useDebugStore = create<DebugStoreState>((set, get) => ({
  sessionState: 'inactive',
  activeFileId: null,
  activeLineNumber: null,
  breakpoints: [],
  callStack: [],
  variables: [],
  watchExpressions: [],
  consoleLogs: [],

  toggleBreakpoint: (fileId: string, filePath: string, lineNumber: number) => {
    const { breakpoints } = get();
    const existing = breakpoints.find((b) => b.fileId === fileId && b.lineNumber === lineNumber);

    if (existing) {
      set({ breakpoints: breakpoints.filter((b) => b.id !== existing.id) });
    } else {
      const newBp: Breakpoint = {
        id: `bp_${fileId}_${lineNumber}_${Date.now()}`,
        fileId,
        filePath,
        lineNumber,
        enabled: true,
      };
      set({ breakpoints: [...breakpoints, newBp] });
    }
  },

  removeBreakpoint: (id: string) => {
    set((state) => ({ breakpoints: state.breakpoints.filter((b) => b.id !== id) }));
  },

  toggleBreakpointEnabled: (id: string) => {
    set((state) => ({
      breakpoints: state.breakpoints.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)),
    }));
  },

  clearAllBreakpoints: () => {
    set({ breakpoints: [] });
  },

  startDebugging: (fileId: string, filePath: string, _content: string) => {
    const { breakpoints } = get();

    const fileBreakpoints = breakpoints.filter((b) => b.fileId === fileId && b.enabled);
    const firstBp = fileBreakpoints.sort((a, b) => a.lineNumber - b.lineNumber)[0];

    // Find first executable line or first breakpoint
    const targetLine = firstBp ? firstBp.lineNumber : 1;

    set({
      sessionState: 'paused',
      activeFileId: fileId,
      activeLineNumber: targetLine,
      callStack: [
        {
          id: 'frame_main',
          name: `${filePath.split('/').pop() || 'main'}:anonymous`,
          fileId,
          filePath,
          lineNumber: targetLine,
          column: 1,
        },
      ],
      variables: [
        { name: 'this', value: 'Window / Global Scope', type: 'object' },
        { name: 'process', value: 'process (node)', type: 'object' },
        { name: 'args', value: '[] (Array)', type: 'array' },
      ],
      consoleLogs: [
        `[Debugger] Session started on ${filePath}`,
        `[Debugger] Paused at line ${targetLine}`,
      ],
    });
  },

  stopDebugging: () => {
    set({
      sessionState: 'inactive',
      activeFileId: null,
      activeLineNumber: null,
      callStack: [],
      variables: [],
    });
  },

  pauseExecution: () => {
    set((state) => ({
      sessionState: 'paused',
      activeLineNumber: state.activeLineNumber || 1,
    }));
  },

  continueExecution: () => {
    const { activeLineNumber, breakpoints, activeFileId } = get();
    const nextBps = breakpoints.filter(
      (b) => b.fileId === activeFileId && b.enabled && b.lineNumber > (activeLineNumber || 0)
    );

    if (nextBps.length > 0) {
      const next = nextBps.sort((a, b) => a.lineNumber - b.lineNumber)[0];
      set((state) => ({
        sessionState: 'paused',
        activeLineNumber: next.lineNumber,
        consoleLogs: [...state.consoleLogs, `[Debugger] Paused at breakpoint line ${next.lineNumber}`],
      }));
    } else {
      set((state) => ({
        sessionState: 'inactive',
        activeFileId: null,
        activeLineNumber: null,
        callStack: [],
        variables: [],
        consoleLogs: [...state.consoleLogs, `[Debugger] Execution finished successfully (Exit code: 0)`],
      }));
    }
  },

  stepOver: () => {
    set((state) => {
      const nextLine = (state.activeLineNumber || 1) + 1;
      return {
        activeLineNumber: nextLine,
        consoleLogs: [...state.consoleLogs, `[Step Over] Advanced to line ${nextLine}`],
      };
    });
  },

  stepInto: () => {
    set((state) => {
      const nextLine = (state.activeLineNumber || 1) + 1;
      return {
        activeLineNumber: nextLine,
        callStack: [
          {
            id: `frame_${Date.now()}`,
            name: `anonymousFunc():line${nextLine}`,
            fileId: state.activeFileId || '',
            filePath: 'active',
            lineNumber: nextLine,
            column: 1,
          },
          ...state.callStack,
        ],
        consoleLogs: [...state.consoleLogs, `[Step Into] Entered frame at line ${nextLine}`],
      };
    });
  },

  stepOut: () => {
    set((state) => {
      const newStack = state.callStack.slice(1);
      const nextLine = (state.activeLineNumber || 1) + 1;
      return {
        activeLineNumber: nextLine,
        callStack: newStack.length > 0 ? newStack : state.callStack,
        consoleLogs: [...state.consoleLogs, `[Step Out] Exited to line ${nextLine}`],
      };
    });
  },

  restartDebugging: () => {
    const { activeFileId, callStack } = get();
    if (activeFileId) {
      const path = callStack[0]?.filePath || 'index.ts';
      get().startDebugging(activeFileId, path, '');
    }
  },

  addWatch: (expr: string) => {
    const trimmed = expr.trim();
    if (trimmed && !get().watchExpressions.includes(trimmed)) {
      set((state) => ({ watchExpressions: [...state.watchExpressions, trimmed] }));
    }
  },

  removeWatch: (expr: string) => {
    set((state) => ({ watchExpressions: state.watchExpressions.filter((w) => w !== expr) }));
  },

  addConsoleLog: (log: string) => {
    set((state) => ({ consoleLogs: [...state.consoleLogs, log] }));
  },

  clearConsoleLogs: () => {
    set({ consoleLogs: [] });
  },
}));
