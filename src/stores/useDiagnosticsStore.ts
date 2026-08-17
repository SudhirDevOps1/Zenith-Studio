import { create } from 'zustand';

export interface DiagnosticItem {
  id: string;
  fileId: string;
  fileName: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  startLineNumber: number;
  startColumn: number;
  source?: string;
}

interface DiagnosticsState {
  diagnostics: DiagnosticItem[];
  isProblemsOpen: boolean;
  setDiagnostics: (items: DiagnosticItem[]) => void;
  updateFileDiagnostics: (fileId: string, fileName: string, markers: any[]) => void;
  toggleProblemsOpen: () => void;
  setProblemsOpen: (open: boolean) => void;
  clearDiagnostics: () => void;
}

export const useDiagnosticsStore = create<DiagnosticsState>((set, get) => ({
  diagnostics: [],
  isProblemsOpen: false,

  setDiagnostics: (items) => set({ diagnostics: items }),

  updateFileDiagnostics: (fileId, fileName, markers) => {
    const current = get().diagnostics.filter((d) => d.fileId !== fileId);
    
    // Severity mapping: 8 = Error, 4 = Warning, 2 = Info, 1 = Hint
    const newItems: DiagnosticItem[] = (markers || []).map((m: any, index: number) => ({
      id: `${fileId}_${m.startLineNumber}_${m.startColumn}_${index}`,
      fileId,
      fileName,
      message: m.message || 'Syntax Error',
      severity: m.severity === 8 ? 'error' : m.severity === 4 ? 'warning' : 'info',
      startLineNumber: m.startLineNumber,
      startColumn: m.startColumn,
      source: m.source || 'Monaco Parser',
    }));

    set({ diagnostics: [...current, ...newItems] });
  },

  toggleProblemsOpen: () => set((state) => ({ isProblemsOpen: !state.isProblemsOpen })),
  setProblemsOpen: (open) => set({ isProblemsOpen: open }),
  clearDiagnostics: () => set({ diagnostics: [] }),
}));
