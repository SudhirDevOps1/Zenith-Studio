import { create } from 'zustand';
import { useFileStore } from './useFileStore';
import { useToastStore } from './useToastStore';
import { saveFilesToStorage } from '../utils/storage';

export interface WorkspaceItem {
  id: string;
  name: string;
  path: string;
  lastActive: number;
  lastTask: string;
  pinned?: boolean;
}

const STORAGE_KEY = 'zenith_studio_workspaces_v1';

const INITIAL_WORKSPACES: WorkspaceItem[] = [
  {
    id: 'ws-codestudio',
    name: 'CodeStudio',
    path: 'C:\\Users\\DELL\\Desktop\\apps\\CodeStudio',
    lastActive: Date.now(),
    lastTask: 'Review and Fix Flaws',
    pinned: true,
  },
  {
    id: 'ws-ultimate-master',
    name: 'The-Ultimate-Master',
    path: 'C:\\Users\\DELL\\Desktop\\apps\\The-Ultimate-Master',
    lastActive: Date.now() - 5 * 3600 * 1000,
    lastTask: 'Fix Text Input Issue',
  },
  {
    id: 'ws-pdf-img',
    name: 'pdf img',
    path: 'C:\\Users\\DELL\\Desktop\\apps\\pdf img',
    lastActive: Date.now() - 2 * 86400 * 1000,
    lastTask: 'Open Source Client-Side Tools',
  },
  {
    id: 'ws-vibe-coding',
    name: 'vibe coding',
    path: 'C:\\Users\\DELL\\Desktop\\apps\\vibe coding',
    lastActive: Date.now() - 6 * 86400 * 1000,
    lastTask: 'Understanding Vibe Brain & Agent Logic',
  },
  {
    id: 'ws-board',
    name: 'board',
    path: 'C:\\Users\\DELL\\Desktop\\apps\\board',
    lastActive: Date.now() - 10 * 86400 * 1000,
    lastTask: 'No conversations yet',
  },
  {
    id: 'ws-build-cookie-less',
    name: 'build-cookie-less',
    path: 'C:\\Users\\DELL\\Desktop\\apps\\build-cookie-less',
    lastActive: Date.now() - 15 * 86400 * 1000,
    lastTask: 'No conversations yet',
  },
  {
    id: 'ws-hybrid-e-commerce',
    name: 'hybrid-e-commerce',
    path: 'C:\\Users\\DELL\\Desktop\\apps\\hybrid-e-commerce',
    lastActive: Date.now() - 20 * 86400 * 1000,
    lastTask: 'No conversations yet',
  },
];

function loadSavedWorkspaces(): WorkspaceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load workspaces from storage:', err);
  }
  return INITIAL_WORKSPACES;
}

function saveWorkspacesToStorage(items: WorkspaceItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save workspaces to storage:', err);
  }
}

interface WorkspaceStoreState {
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string | null;
  isSwitcherOpen: boolean;

  // Actions
  setSwitcherOpen: (open: boolean) => void;
  openWorkspace: (item: WorkspaceItem) => Promise<void>;
  addWorkspaceFromPath: (folderPath: string, folderName?: string) => void;
  removeWorkspace: (id: string) => void;
  updateWorkspaceTask: (id: string, task: string) => void;
  togglePinWorkspace: (id: string) => void;
  promptOpenNewWorkspace: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaces: loadSavedWorkspaces(),
  activeWorkspaceId: 'ws-codestudio',
  isSwitcherOpen: false,

  setSwitcherOpen: (isSwitcherOpen) => set({ isSwitcherOpen }),

  openWorkspace: async (workspace: WorkspaceItem) => {
    const { addToast } = useToastStore.getState();
    const fileStore = useFileStore.getState();

    set((state) => {
      const updated = state.workspaces.map((w) =>
        w.id === workspace.id ? { ...w, lastActive: Date.now() } : w
      );
      saveWorkspacesToStorage(updated);
      return { workspaces: updated, activeWorkspaceId: workspace.id, isSwitcherOpen: false };
    });

    fileStore.setRootFolderPath(workspace.path);

    // In Electron: Scan folder from disk and load real files
    if (typeof window !== 'undefined' && window.electronAPI?.openWorkspacePath) {
      try {
        const result = await window.electronAPI.openWorkspacePath(workspace.path);
        if (result && result.success && Array.isArray(result.files)) {
          await saveFilesToStorage(result.files);
          useFileStore.setState({
            files: result.files,
            openTabs: [],
            activeFileId: null,
            rootFolderPath: workspace.path,
          });

          // Open README or first file
          const readme = result.files.find((f: any) => f.name.toLowerCase() === 'readme.md' && f.type === 'file');
          const first = readme || result.files.find((f: any) => f.type === 'file');
          if (first) {
            useFileStore.getState().openFileInTab(first.id);
          }

          addToast({
            type: 'success',
            title: `Opened ${workspace.name}`,
            message: `Loaded ${result.files.length} project files from disk.`,
          });
          return;
        }
      } catch (err: any) {
        console.warn('Could not scan workspace folder:', err);
      }
    }

    addToast({
      type: 'success',
      title: 'Workspace Active',
      message: `Switched to workspace "${workspace.name}".`,
    });
  },

  addWorkspaceFromPath: (folderPath: string, folderName?: string) => {
    const name = folderName || folderPath.split(/[\\/]/).filter(Boolean).pop() || 'Workspace';
    const id = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { workspaces } = get();

    const existing = workspaces.find((w) => w.path === folderPath);
    if (existing) {
      get().openWorkspace(existing);
      return;
    }

    const newWs: WorkspaceItem = {
      id,
      name,
      path: folderPath,
      lastActive: Date.now(),
      lastTask: 'Active Project',
    };

    const updated = [newWs, ...workspaces];
    saveWorkspacesToStorage(updated);
    set({ workspaces: updated, activeWorkspaceId: id, isSwitcherOpen: false });
  },

  removeWorkspace: (id: string) => {
    const { workspaces, activeWorkspaceId } = get();
    const updated = workspaces.filter((w) => w.id !== id);
    saveWorkspacesToStorage(updated);
    set({
      workspaces: updated,
      activeWorkspaceId: activeWorkspaceId === id ? updated[0]?.id || null : activeWorkspaceId,
    });
    useToastStore.getState().addToast({
      type: 'info',
      title: 'Workspace Removed',
      message: 'Workspace removed from recent projects list.',
    });
  },

  updateWorkspaceTask: (id: string, task: string) => {
    const { workspaces } = get();
    const updated = workspaces.map((w) =>
      w.id === id ? { ...w, lastTask: task, lastActive: Date.now() } : w
    );
    saveWorkspacesToStorage(updated);
    set({ workspaces: updated });
  },

  togglePinWorkspace: (id: string) => {
    const { workspaces } = get();
    const updated = workspaces.map((w) =>
      w.id === id ? { ...w, pinned: !w.pinned } : w
    );
    saveWorkspacesToStorage(updated);
    set({ workspaces: updated });
  },

  promptOpenNewWorkspace: async () => {
    const fileStore = useFileStore.getState();
    await fileStore.openSystemFolder();
    const newPath = fileStore.rootFolderPath;
    if (newPath) {
      get().addWorkspaceFromPath(newPath);
    }
  },
}));
