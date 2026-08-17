import { create } from 'zustand';
import { generateAiContent } from '../utils/aiService';
import { useSettingsStore } from './useSettingsStore';
import { useFileStore } from './useFileStore';

export interface ComposerFilePatch {
  filePath: string;
  fileId?: string;
  oldContent: string;
  newContent: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface ComposerStoreState {
  isOpen: boolean;
  prompt: string;
  isGenerating: boolean;
  selectedFiles: string[]; // List of file paths to include in context
  patches: ComposerFilePatch[];
  logs: string[];

  // Actions
  setIsOpen: (open: boolean) => void;
  setPrompt: (p: string) => void;
  toggleSelectedFile: (filePath: string) => void;
  setSelectedFiles: (files: string[]) => void;
  runComposer: () => Promise<void>;
  acceptPatch: (filePath: string) => void;
  rejectPatch: (filePath: string) => void;
  acceptAllPatches: () => void;
  clearPatches: () => void;
}

export const useComposerStore = create<ComposerStoreState>((set, get) => ({
  isOpen: false,
  prompt: '',
  isGenerating: false,
  selectedFiles: [],
  patches: [],
  logs: [],

  setIsOpen: (isOpen) => set({ isOpen }),
  setPrompt: (prompt) => set({ prompt }),

  toggleSelectedFile: (filePath) => {
    const { selectedFiles } = get();
    if (selectedFiles.includes(filePath)) {
      set({ selectedFiles: selectedFiles.filter((f) => f !== filePath) });
    } else {
      set({ selectedFiles: [...selectedFiles, filePath] });
    }
  },

  setSelectedFiles: (selectedFiles) => set({ selectedFiles }),

  runComposer: async () => {
    const { prompt, selectedFiles } = get();
    if (!prompt.trim()) return;

    const { files } = useFileStore.getState();
    const { settings } = useSettingsStore.getState();

    set({ isGenerating: true, logs: ['[Composer] Scanning selected workspace files...'], patches: [] });

    try {
      // Gather selected files or fallback to first 5 workspace files
      const targetFiles = selectedFiles.length > 0
        ? files.filter((f) => f.type === 'file' && selectedFiles.includes(f.path || f.name))
        : files.filter((f) => f.type === 'file').slice(0, 6);

      const contextPayload = targetFiles
        .map((f) => `### FILE: ${f.path || f.name}\n\`\`\`${f.extension || 'txt'}\n${f.content || ''}\n\`\`\``)
        .join('\n\n');

      const systemPrompt = `You are Zenith Studio AI Composer (Multi-File Agent). 
Your task is to plan and execute code modifications across the provided files based on the user's request.


CRITICAL OUTPUT FORMAT:
For every file that needs changes or creation, output a block strictly formatted as:

### FILE: <file_path>
\`\`\`<language>
<complete new file content>
\`\`\`

Do not leave placeholder comments like "// rest of code remains the same". Always provide the complete updated file content so it can be directly patched.`;

      const userQuery = `USER REQUEST:\n${prompt}\n\nWORKSPACE FILES CONTEXT:\n${contextPayload}`;

      set((state) => ({ logs: [...state.logs, '[Composer] Querying AI Model for multi-file plan...'] }));

      const responseText = await generateAiContent(userQuery, systemPrompt, settings);

      set((state) => ({ logs: [...state.logs, '[Composer] Parsing multi-file patches...'] }));


      // Parse multi-file blocks
      const patches: ComposerFilePatch[] = [];
      const fileBlockRegex = /###\s*FILE:\s*([^\r\n]+)\r?\n```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```/g;
      let match;

      while ((match = fileBlockRegex.exec(responseText)) !== null) {
        const targetPath = match[1].trim();
        const newCode = match[2].trim();

        const existingFile = files.find(
          (f) => f.type === 'file' && (f.path === targetPath || f.name === targetPath || f.path?.endsWith(targetPath))
        );

        patches.push({
          filePath: targetPath,
          fileId: existingFile?.id,
          oldContent: existingFile?.content || '',
          newContent: newCode,
          status: 'pending',
        });
      }

      if (patches.length === 0) {
        set((state) => ({
          isGenerating: false,
          logs: [...state.logs, '[Composer] AI generated response without standard file blocks.'],
        }));
      } else {
        set((state) => ({
          isGenerating: false,
          patches,
          logs: [...state.logs, `[Composer] Successfully generated ${patches.length} file patch(es)!`],
        }));
      }
    } catch (err: any) {
      set((state) => ({
        isGenerating: false,
        logs: [...state.logs, `[Composer Error] ${err.message || String(err)}`],
      }));
    }
  },

  acceptPatch: (filePath) => {
    const { patches } = get();
    const { updateFileContent, createFile } = useFileStore.getState();


    const patch = patches.find((p) => p.filePath === filePath);
    if (!patch) return;

    if (patch.fileId) {
      updateFileContent(patch.fileId, patch.newContent);
    } else {
      // Create new file if it didn't exist
      const fileName = patch.filePath.split(/[\\/]/).pop() || 'new-file.ts';
      createFile(fileName, null, patch.newContent);
    }

    set({
      patches: patches.map((p) => (p.filePath === filePath ? { ...p, status: 'accepted' } : p)),
    });
  },

  rejectPatch: (filePath) => {
    const { patches } = get();
    set({
      patches: patches.map((p) => (p.filePath === filePath ? { ...p, status: 'rejected' } : p)),
    });
  },

  acceptAllPatches: () => {
    const { patches, acceptPatch } = get();
    patches.forEach((p) => {
      if (p.status === 'pending') {
        acceptPatch(p.filePath);
      }
    });
  },

  clearPatches: () => {
    set({ patches: [], logs: [] });
  },
}));
