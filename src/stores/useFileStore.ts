import { create } from 'zustand';
import { FileItem, OpenTab, ActivePreviewMode } from '../types/fileSystem';
import { loadFilesFromStorage, saveFilesToStorage } from '../utils/storage';
import { getFileExtension, isElectron, INITIAL_SAMPLE_FILES } from '../utils/fileUtils';
import { extractZipFile, createFileItemsFromZip } from '../utils/zipExtractor';
import { useToastStore } from './useToastStore';

interface FileStoreState {
  files: FileItem[];
  openTabs: OpenTab[];
  activeFileId: string | null;
  activePreviewMode: ActivePreviewMode;
  searchFilter: string;
  isInitialized: boolean;

  // Actions
  initializeStore: () => Promise<void>;
  setActiveFile: (fileId: string | null) => void;
  openFileInTab: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  closeOtherTabs: (fileId: string) => void;
  closeAllTabs: () => void;
  updateFileContent: (fileId: string, content: string) => void;
  markFileSaved: (fileId: string) => void;
  saveCurrentFile: () => Promise<void>;
  saveAllFiles: () => Promise<void>;
  
  createFile: (name: string, parentId: string | null, content?: string) => string;
  createFolder: (name: string, parentId: string | null) => string;
  renameFileItem: (id: string, newName: string) => void;
  deleteFileItem: (id: string) => void;
  duplicateFileItem: (id: string) => void;
  moveFileItem: (sourceId: string, targetParentId: string | null) => void;
  toggleFolderExpand: (folderId: string) => void;
  collapseAllFolders: () => void;
  setSearchFilter: (query: string) => void;
  setActivePreviewMode: (mode: ActivePreviewMode) => void;
  resetToDefaultFiles: () => Promise<void>;
  importFilesFromOS: (fileList: FileList, targetParentId?: string | null) => Promise<void>;
  importZipFile: (file: File, targetParentId?: string | null) => Promise<void>;
}

export const useFileStore = create<FileStoreState>((set, get) => ({
  files: [],
  openTabs: [],
  activeFileId: null,
  activePreviewMode: 'auto',
  searchFilter: '',
  isInitialized: false,

  initializeStore: async () => {
    const files = await loadFilesFromStorage();
    let defaultActiveId: string | null = null;
    const initialTabs: OpenTab[] = [];

    const readme = files.find(f => f.name.toLowerCase() === 'readme.md' && f.type === 'file');
    if (readme) {
      defaultActiveId = readme.id;
      initialTabs.push({
        fileId: readme.id,
        path: readme.path,
        title: readme.name,
        isModified: false,
        extension: readme.extension || 'md',
      });
    } else {
      const firstFile = files.find(f => f.type === 'file');
      if (firstFile) {
        defaultActiveId = firstFile.id;
        initialTabs.push({
          fileId: firstFile.id,
          path: firstFile.path,
          title: firstFile.name,
          isModified: false,
          extension: firstFile.extension || '',
        });
      }
    }

    set({
      files,
      openTabs: initialTabs,
      activeFileId: defaultActiveId,
      isInitialized: true,
    });
  },

  setActiveFile: (fileId) => {
    if (!fileId) {
      set({ activeFileId: null });
      return;
    }
    const { files, openTabs } = get();
    const file = files.find(f => f.id === fileId);
    if (!file || file.type !== 'file') return;

    const exists = openTabs.some(t => t.fileId === fileId);
    let updatedTabs = [...openTabs];
    if (!exists) {
      updatedTabs.push({
        fileId: file.id,
        path: file.path,
        title: file.name,
        isModified: Boolean(file.isModified),
        extension: file.extension || getFileExtension(file.name),
      });
    }

    set({
      activeFileId: fileId,
      openTabs: updatedTabs,
    });
  },

  openFileInTab: (fileId) => {
    get().setActiveFile(fileId);
  },

  closeTab: (fileId) => {
    const { openTabs, activeFileId } = get();
    const index = openTabs.findIndex(t => t.fileId === fileId);
    if (index === -1) return;

    const updatedTabs = openTabs.filter(t => t.fileId !== fileId);
    let nextActiveId = activeFileId;

    if (activeFileId === fileId) {
      if (updatedTabs.length > 0) {
        const nextIndex = Math.min(index, updatedTabs.length - 1);
        nextActiveId = updatedTabs[nextIndex].fileId;
      } else {
        nextActiveId = null;
      }
    }

    set({
      openTabs: updatedTabs,
      activeFileId: nextActiveId,
    });
  },

  closeOtherTabs: (fileId) => {
    const { openTabs } = get();
    const tab = openTabs.find(t => t.fileId === fileId);
    if (!tab) return;
    set({
      openTabs: [tab],
      activeFileId: fileId,
    });
  },

  closeAllTabs: () => {
    set({
      openTabs: [],
      activeFileId: null,
    });
  },

  updateFileContent: (fileId, newContent) => {
    const { files, openTabs } = get();
    let changed = false;

    const updatedFiles = files.map(f => {
      if (f.id === fileId) {
        if (f.content !== newContent) {
          changed = true;
          return { ...f, content: newContent, isModified: true, updatedAt: Date.now() };
        }
      }
      return f;
    });

    if (!changed) return;

    const updatedTabs = openTabs.map(tab => {
      if (tab.fileId === fileId) {
        return { ...tab, isModified: true };
      }
      return tab;
    });

    set({ files: updatedFiles, openTabs: updatedTabs });
    saveFilesToStorage(updatedFiles);
  },

  markFileSaved: (fileId) => {
    const { files, openTabs } = get();
    const updatedFiles = files.map(f => f.id === fileId ? { ...f, isModified: false } : f);
    const updatedTabs = openTabs.map(t => t.fileId === fileId ? { ...t, isModified: false } : t);

    set({ files: updatedFiles, openTabs: updatedTabs });
    saveFilesToStorage(updatedFiles);
  },

  saveCurrentFile: async () => {
    const { activeFileId, markFileSaved, files } = get();
    if (!activeFileId) return;

    const file = files.find(f => f.id === activeFileId);
    if (!file) return;

    if (isElectron()) {
      try {
        const result = await (window as any).electronAPI.saveFile({
          path: file.path,
          content: file.content || '',
        });
        if (result.success) {
          markFileSaved(activeFileId);
        }
      } catch (err) {
        console.error('Failed native save in Electron:', err);
      }
    } else {
      markFileSaved(activeFileId);
    }
  },

  saveAllFiles: async () => {
    const { files, markFileSaved } = get();
    files.forEach(f => {
      if (f.isModified) {
        markFileSaved(f.id);
      }
    });
  },

  createFile: (name, parentId, content = '') => {
    const { files } = get();
    const extension = getFileExtension(name);
    const parentFolder = files.find(f => f.id === parentId);
    const path = parentFolder ? `${parentFolder.path}/${name}` : name;
    const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const newFile: FileItem = {
      id,
      name,
      path,
      type: 'file',
      parentId,
      extension,
      content,
      isModified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedFiles = [...files, newFile];
    set({ files: updatedFiles });
    saveFilesToStorage(updatedFiles);

    get().openFileInTab(id);
    return id;
  },

  createFolder: (name, parentId) => {
    const { files } = get();
    const parentFolder = files.find(f => f.id === parentId);
    const path = parentFolder ? `${parentFolder.path}/${name}` : name;
    const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const newFolder: FileItem = {
      id,
      name,
      path,
      type: 'folder',
      parentId,
      isExpanded: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedFiles = [...files, newFolder];
    set({ files: updatedFiles });
    saveFilesToStorage(updatedFiles);
    return id;
  },

  renameFileItem: (id, newName) => {
    const { files, openTabs } = get();
    const target = files.find(f => f.id === id);
    if (!target) return;

    const oldPath = target.path;
    const parentFolder = files.find(f => f.id === target.parentId);
    const newPath = parentFolder ? `${parentFolder.path}/${newName}` : newName;
    const newExt = target.type === 'file' ? getFileExtension(newName) : undefined;

    const updatedFiles = files.map(item => {
      if (item.id === id) {
        return {
          ...item,
          name: newName,
          path: newPath,
          extension: newExt,
          updatedAt: Date.now(),
        };
      }
      if (item.path.startsWith(oldPath + '/')) {
        const relative = item.path.slice(oldPath.length);
        return {
          ...item,
          path: newPath + relative,
        };
      }
      return item;
    });

    const updatedTabs = openTabs.map(tab => {
      if (tab.fileId === id) {
        return {
          ...tab,
          title: newName,
          path: newPath,
          extension: newExt || tab.extension,
        };
      }
      return tab;
    });

    set({ files: updatedFiles, openTabs: updatedTabs });
    saveFilesToStorage(updatedFiles);
  },

  deleteFileItem: (id) => {
    const { files, openTabs, activeFileId } = get();
    const target = files.find(f => f.id === id);
    if (!target) return;

    const idsToDelete = new Set<string>();
    const collectIds = (item: FileItem) => {
      idsToDelete.add(item.id);
      if (item.type === 'folder') {
        const children = files.filter(f => f.parentId === item.id);
        children.forEach(collectIds);
      }
    };

    collectIds(target);

    const updatedFiles = files.filter(f => !idsToDelete.has(f.id));
    const updatedTabs = openTabs.filter(t => !idsToDelete.has(t.fileId));

    let nextActiveId = activeFileId;
    if (activeFileId && idsToDelete.has(activeFileId)) {
      nextActiveId = updatedTabs.length > 0 ? updatedTabs[0].fileId : null;
    }

    set({
      files: updatedFiles,
      openTabs: updatedTabs,
      activeFileId: nextActiveId,
    });
    saveFilesToStorage(updatedFiles);
  },

  duplicateFileItem: (id) => {
    const { files, createFile } = get();
    const file = files.find(f => f.id === id && f.type === 'file');
    if (!file) return;

    const ext = file.extension ? `.${file.extension}` : '';
    const baseName = file.name.replace(new RegExp(`${ext}$`), '');
    const duplicateName = `${baseName}_copy${ext}`;

    createFile(duplicateName, file.parentId, file.content);
  },

  moveFileItem: (sourceId, targetParentId) => {
    const { files } = get();
    const source = files.find(f => f.id === sourceId);
    if (!source || source.parentId === targetParentId || sourceId === targetParentId) return;

    if (source.type === 'folder' && targetParentId) {
      let curr = files.find(f => f.id === targetParentId);
      while (curr) {
        if (curr.id === sourceId) return;
        curr = files.find(f => f.id === curr?.parentId);
      }
    }

    const parentFolder = files.find(f => f.id === targetParentId);
    const newPath = parentFolder ? `${parentFolder.path}/${source.name}` : source.name;
    const oldPath = source.path;

    const updatedFiles = files.map(item => {
      if (item.id === sourceId) {
        return { ...item, parentId: targetParentId, path: newPath };
      }
      if (item.path.startsWith(oldPath + '/')) {
        const rel = item.path.slice(oldPath.length);
        return { ...item, path: newPath + rel };
      }
      return item;
    });

    set({ files: updatedFiles });
    saveFilesToStorage(updatedFiles);
  },

  toggleFolderExpand: (folderId) => {
    const { files } = get();
    const updatedFiles = files.map(f => f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f);
    set({ files: updatedFiles });
    saveFilesToStorage(updatedFiles);
  },

  collapseAllFolders: () => {
    const { files } = get();
    const updatedFiles = files.map(f => f.type === 'folder' ? { ...f, isExpanded: false } : f);
    set({ files: updatedFiles });
    saveFilesToStorage(updatedFiles);
  },

  setSearchFilter: (query) => {
    set({ searchFilter: query });
  },

  setActivePreviewMode: (mode) => {
    set({ activePreviewMode: mode });
  },

  resetToDefaultFiles: async () => {
    const files = INITIAL_SAMPLE_FILES;
    await saveFilesToStorage(files);
    set({ files, openTabs: [], activeFileId: null });
    get().setActiveFile(files[1].id);
  },

  importFilesFromOS: async (fileList, targetParentId = null) => {
    const { createFile, importZipFile } = get();
    const { addToast } = useToastStore.getState();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Handle ZIP files
      if (file.name.toLowerCase().endsWith('.zip')) {
        await importZipFile(file, targetParentId);
        continue;
      }

      // Store previewable binary files as Data URLs.
      const lowerName = file.name.toLowerCase();
      const isBinaryPreview =
        file.type.startsWith('image/') ||
        file.type.startsWith('audio/') ||
        file.type.startsWith('video/') ||
        file.type === 'application/pdf' ||
        lowerName.endsWith('.pdf') ||
        lowerName.endsWith('.xlsx') ||
        lowerName.endsWith('.xls') ||
        lowerName.endsWith('.xlsm');

      if (isBinaryPreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          createFile(file.name, targetParentId, content);
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        createFile(file.name, targetParentId, text);
      }
    }

    addToast({
      type: 'success',
      title: 'Files Imported',
      message: `${fileList.length} file(s) imported successfully.`,
    });
  },

  importZipFile: async (file, targetParentId = null) => {
    const { addToast } = useToastStore.getState();

    try {
      addToast({
        type: 'info',
        title: 'Extracting ZIP...',
        message: `Extracting ${file.name}...`,
      });

      const extractedFiles = await extractZipFile(file);
      const { files: fileItems } = createFileItemsFromZip(extractedFiles, targetParentId);

      // Add all files to store
      const currentFiles = get().files;
      const updatedFiles = [...currentFiles, ...fileItems];
      set({ files: updatedFiles });
      saveFilesToStorage(updatedFiles);

      addToast({
        type: 'success',
        title: 'ZIP Extracted',
        message: `${extractedFiles.length} files extracted from ${file.name}.`,
      });
    } catch (err) {
      console.error('ZIP extraction failed:', err);
      addToast({
        type: 'error',
        title: 'Extraction Failed',
        message: 'Failed to extract ZIP file.',
      });
    }
  },
}));
