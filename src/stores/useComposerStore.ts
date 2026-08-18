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
  textResponse: string | null;

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
  textResponse: null,

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

    // Validate API key before attempting any AI call
    const provider = settings.aiProvider || 'gemini';
    const apiKey = (
      provider === 'gemini'
        ? (settings.geminiApiKey || settings.aiApiKey || '')
        : (settings.aiApiKey || '')
    ).trim();

    if (!apiKey && provider !== 'ollama') {
      set({
        isGenerating: false,
        textResponse: null,
        logs: [
          '[Composer] ❌ No API Key configured.',
          `[Composer] → Open AI Setup (top bar) and save your ${provider.toUpperCase()} API key first.`,
        ],
      });
      return;
    }

    set({ isGenerating: true, textResponse: null, logs: ['[Composer] Scanning selected workspace files...'], patches: [] });

    try {
      // Gather selected files or fallback to first 6 workspace files
      const targetFiles = selectedFiles.length > 0
        ? files.filter((f) => f.type === 'file' && selectedFiles.includes(f.path || f.name))
        : files.filter((f) => f.type === 'file').slice(0, 6);

      const contextPayload = targetFiles
        .map((f) => `### FILE: ${f.path || f.name}\n\`\`\`${f.extension || 'txt'}\n${f.content || ''}\n\`\`\``)
        .join('\n\n');

      const systemPrompt = `You are Zenith Studio AI Composer (Multi-File Agent). 
Your task is to answer the user request and optionally plan and execute code modifications across the provided files.

OUTPUT GUIDELINES:
1. If the user asks for explanations, analysis, or advice (e.g. "explain kro", "what does this code do?"), provide a clear, comprehensive, and helpful markdown explanation.
2. If code changes or file creations are requested:
For EVERY file to create or modify, format as:

### FILE: <file_path>
\`\`\`<language>
<complete new file content>
\`\`\`

Always output complete file contents in file blocks so they can be directly patched without placeholder comments.`;

      const userQuery = `USER REQUEST:\n${prompt}\n\nWORKSPACE FILES CONTEXT:\n${contextPayload}`;

      set((state) => ({ logs: [...state.logs, '[Composer] Querying AI Model for multi-file plan...'] }));

      const responseText = await generateAiContent(userQuery, systemPrompt, settings);

      set((state) => ({ logs: [...state.logs, '[Composer] Processing AI response...'] }));

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

      // If no ### FILE: blocks found, check if there is a single markdown code block and 1 selected file
      if (patches.length === 0 && targetFiles.length === 1) {
        const singleBlockRegex = /```(?:[a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```/;
        const singleMatch = responseText.match(singleBlockRegex);
        const lowerPrompt = prompt.toLowerCase();
        const isCodeEditPrompt = lowerPrompt.includes('change') || lowerPrompt.includes('add') || lowerPrompt.includes('fix') || lowerPrompt.includes('refactor') || lowerPrompt.includes('update') || lowerPrompt.includes('kro') || lowerPrompt.includes('banao');
        
        if (singleMatch && isCodeEditPrompt && !lowerPrompt.includes('explain') && !lowerPrompt.includes('samjhao')) {
          const singleFile = targetFiles[0];
          patches.push({
            filePath: singleFile.path || singleFile.name,
            fileId: singleFile.id,
            oldContent: singleFile.content || '',
            newContent: singleMatch[1].trim(),
            status: 'pending',
          });
        }
      }

      // Clean text response (strip out file blocks if present so it doesn't duplicate)
      const cleanExplanation = responseText.replace(fileBlockRegex, '').trim();

      if (patches.length === 0) {
        set((state) => ({
          isGenerating: false,
          textResponse: responseText,
          logs: [...state.logs, '[Composer] AI response received successfully!'],
        }));
      } else {
        set((state) => ({
          isGenerating: false,
          patches,
          textResponse: cleanExplanation.length > 20 ? cleanExplanation : null,
          logs: [...state.logs, `[Composer] Generated ${patches.length} file patch(es)!`],
        }));
      }
    } catch (err: any) {
      set((state) => ({
        isGenerating: false,
        textResponse: null,
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
