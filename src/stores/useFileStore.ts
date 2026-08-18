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
  rootFolderPath: string | null;

  // Actions
  initializeStore: () => Promise<void>;
  setRootFolderPath: (path: string | null) => void;
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
  renameFileItem: (id: string, newName: string) => Promise<void>;
  deleteFileItem: (id: string) => Promise<void>;
  duplicateFileItem: (id: string) => void;
  moveFileItem: (sourceId: string, targetParentId: string | null) => void;
  toggleFolderExpand: (folderId: string) => void;
  collapseAllFolders: () => void;
  setSearchFilter: (query: string) => void;
  setActivePreviewMode: (mode: ActivePreviewMode) => void;
  resetToDefaultFiles: () => Promise<void>;
  importFilesFromOS: (fileList: FileList, targetParentId?: string | null) => Promise<void>;
  importZipFile: (file: File, targetParentId?: string | null) => Promise<void>;
  openSystemFolder: () => Promise<void>;
  addFolderToWorkspace: () => Promise<void>;
  removeFolderFromWorkspace: (folderId: string) => void;
  openSystemFile: () => Promise<void>;
  openFolderFromWeb: (files: FileList) => Promise<void>;
}

export const useFileStore = create<FileStoreState>((set, get) => ({
  files: [],
  openTabs: [],
  activeFileId: null,
  activePreviewMode: 'auto',
  searchFilter: '',
  isInitialized: false,
  rootFolderPath: typeof window !== 'undefined' ? (localStorage.getItem('zenith_studio_root_folder_path') || localStorage.getItem('codestudio_root_folder_path') || null) : null,

  setRootFolderPath: (path) => {
    if (typeof window !== 'undefined') {
      if (path) localStorage.setItem('zenith_studio_root_folder_path', path);
      else {
        localStorage.removeItem('zenith_studio_root_folder_path');
        localStorage.removeItem('codestudio_root_folder_path');
      }
    }
    set({ rootFolderPath: path });
  },


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
    const { activeFileId, markFileSaved, files, rootFolderPath } = get();
    if (!activeFileId) return;

    const file = files.find(f => f.id === activeFileId);
    if (!file) return;

    if (isElectron() && (window as any).electronAPI?.saveFile) {
      try {
        let diskPath = file.path;
        if (rootFolderPath && diskPath && !diskPath.startsWith('/') && !diskPath.includes(':')) {
          diskPath = `${rootFolderPath}/${diskPath}`.replace(/\\/g, '/');
        }

        const result = await (window as any).electronAPI.saveFile({
          path: diskPath,
          content: file.content || '',
        });

        if (result && result.success) {
          if (result.path && result.path !== file.path) {
            set((state) => ({
              files: state.files.map((f) => (f.id === file.id ? { ...f, path: result.path, name: result.path.split(/[\\/]/).pop() || f.name } : f)),
            }));
          }
          markFileSaved(activeFileId);
          useToastStore.getState().addToast({
            type: 'success',
            title: 'File Saved',
            message: `${file.name} saved successfully.`,
          });
          return;
        }
      } catch (err) {
        console.warn('Native save fallback to IndexedDB:', err);
      }
    }

    markFileSaved(activeFileId);
    useToastStore.getState().addToast({
      type: 'success',
      title: 'File Saved',
      message: `${file.name} saved to workspace.`,
    });
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

  renameFileItem: async (id, newName) => {
    const { files, openTabs, rootFolderPath } = get();
    const target = files.find(f => f.id === id);
    if (!target) return;

    const oldPath = target.path;
    const parentFolder = files.find(f => f.id === target.parentId);
    const newPath = parentFolder ? `${parentFolder.path}/${newName}` : newName;
    const newExt = target.type === 'file' ? getFileExtension(newName) : undefined;

    // Native disk rename in Electron
    if (isElectron() && (window as any).electronAPI?.renameItem) {
      try {
        let srcPath = oldPath;
        let dstPath = newPath;
        if (rootFolderPath && !srcPath.startsWith('/') && !srcPath.includes(':')) {
          srcPath = `${rootFolderPath}/${srcPath}`.replace(/\\/g, '/');
          dstPath = `${rootFolderPath}/${dstPath}`.replace(/\\/g, '/');
        }
        await (window as any).electronAPI.renameItem({ oldPath: srcPath, newPath: dstPath });
      } catch (err) {
        console.warn('Native rename error:', err);
      }
    }

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

  deleteFileItem: async (id) => {
    const { files, openTabs, activeFileId, rootFolderPath } = get();
    const target = files.find(f => f.id === id);
    if (!target) return;

    // In Electron Desktop Mode: Delete entire folder or file from real disk!
    if (isElectron() && (window as any).electronAPI?.deleteItem) {
      try {
        let diskPath = target.path;
        if (rootFolderPath && diskPath && !diskPath.startsWith('/') && !diskPath.includes(':')) {
          diskPath = `${rootFolderPath}/${diskPath}`.replace(/\\/g, '/');
        }
        await (window as any).electronAPI.deleteItem({
          path: diskPath,
          isDirectory: target.type === 'folder',
        });
      } catch (err) {
        console.warn('Native delete error:', err);
      }
    }

    const idsToDelete = new Set<string>();
    const collectIds = (item: FileItem) => {
      idsToDelete.add(item.id);
      if (item.type === 'folder') {
        const children = files.filter(f => f.parentId === item.id || (f.path && f.path.startsWith(item.path + '/')));
        children.forEach(collectIds);
      }
    };

    collectIds(target);

    // Also collect by path prefix for safety
    if (target.type === 'folder') {
      files.forEach((f) => {
        if (f.path === target.path || f.path.startsWith(target.path + '/')) {
          idsToDelete.add(f.id);
        }
      });
    }

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
    useToastStore.getState().addToast({
      type: 'info',
      title: `${target.type === 'folder' ? 'Folder' : 'File'} Deleted`,
      message: `${target.name} and all its contents were deleted.`,
    });
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
    get().setActiveFile(files[0]?.id || null);
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

  openSystemFolder: async () => {
    const { addToast } = useToastStore.getState();

    // Electron Desktop Mode
    if (isElectron()) {
      try {
        const result = await (window as any).electronAPI.openFolderDialog();
        if (!result || !result.files || result.files.length === 0) return;

        await saveFilesToStorage(result.files);
        if (result.folderPath) {
          localStorage.setItem('codestudio_root_folder_path', result.folderPath);
        }
        set({
          files: result.files,
          rootFolderPath: result.folderPath || null,
          openTabs: [],
          activeFileId: null,
        });

        const firstFile = result.files.find((f: FileItem) => f.type === 'file');
        if (firstFile) {
          get().openFileInTab(firstFile.id);
        }

        addToast({
          type: 'success',
          title: 'Folder Opened',
          message: `Loaded ${result.folderName || 'folder'} (${result.files.length} items).`,
        });
      } catch (err: any) {
        console.error('Failed to open native folder:', err);
        addToast({
          type: 'error',
          title: 'Open Folder Failed',
          message: err.message || 'Could not open folder.',
        });
      }
      return;
    }

    // Modern Web Browser with File System Access API (showDirectoryPicker)
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const collectedFiles: FileItem[] = [];

        async function readDirHandle(handle: any, parentPath = '', parentId: string | null = null) {
          for await (const entry of handle.values()) {
            const currentPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
            const id = `web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

            if (entry.kind === 'directory') {
              if (['node_modules', '.git', 'dist', '.cache'].includes(entry.name)) continue;

              collectedFiles.push({
                id,
                name: entry.name,
                path: currentPath,
                type: 'folder',
                parentId,
                isExpanded: !parentPath,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
              await readDirHandle(entry, currentPath, id);
            } else if (entry.kind === 'file') {
              const fileData = await entry.getFile();
              const ext = getFileExtension(entry.name);
              const lower = entry.name.toLowerCase();
              const isBinary =
                fileData.type.startsWith('image/') ||
                fileData.type.startsWith('audio/') ||
                fileData.type.startsWith('video/') ||
                fileData.type === 'application/pdf' ||
                lower.endsWith('.pdf') ||
                lower.endsWith('.xlsx') ||
                lower.endsWith('.xls') ||
                lower.endsWith('.xlsm');

              let content = '';
              if (isBinary) {
                content = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (e) => resolve(e.target?.result as string);
                  reader.readAsDataURL(fileData);
                });
              } else {
                content = await fileData.text();
              }

              collectedFiles.push({
                id,
                name: entry.name,
                path: currentPath,
                type: 'file',
                parentId,
                extension: ext,
                content,
                isModified: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }
          }
        }

        await readDirHandle(dirHandle);

        if (collectedFiles.length > 0) {
          await saveFilesToStorage(collectedFiles);
          set({
            files: collectedFiles,
            openTabs: [],
            activeFileId: null,
          });

          const firstFile = collectedFiles.find(f => f.type === 'file');
          if (firstFile) {
            get().openFileInTab(firstFile.id);
          }

          addToast({
            type: 'success',
            title: 'Folder Opened',
            message: `Loaded ${dirHandle.name} (${collectedFiles.length} items).`,
          });
        }
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled picker
        console.warn('showDirectoryPicker error, falling back to input:', err);
      }
    }

    // Fallback: directory picker via input webkitdirectory
    const input = document.createElement('input');
    input.type = 'file';
    (input as any).webkitdirectory = true;
    (input as any).directory = true;
    input.multiple = true;
    input.onchange = async (e: any) => {
      const fileList: FileList = e.target.files;
      if (fileList && fileList.length > 0) {
        await get().openFolderFromWeb(fileList);
      }
    };
    input.click();
  },

  openFolderFromWeb: async (fileList: FileList) => {
    const { addToast } = useToastStore.getState();
    const folderMap = new Map<string, string>(); // path -> id
    const items: FileItem[] = [];

    // First ensure folder records exist
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const relPath = file.webkitRelativePath || file.name;
      const parts = relPath.split('/');

      // Create folder hierarchy
      let accumulatedPath = '';
      let currentParentId: string | null = null;

      for (let p = 0; p < parts.length - 1; p++) {
        const folderName = parts[p];
        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${folderName}` : folderName;

        if (['node_modules', '.git', 'dist'].includes(folderName)) break;

        if (!folderMap.has(accumulatedPath)) {
          const folderId = `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          folderMap.set(accumulatedPath, folderId);
          items.push({
            id: folderId,
            name: folderName,
            path: accumulatedPath,
            type: 'folder',
            parentId: currentParentId,
            isExpanded: p <= 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        currentParentId = folderMap.get(accumulatedPath) || null;
      }

      // Add file
      const fileName = parts[parts.length - 1];
      const ext = getFileExtension(fileName);
      const lower = fileName.toLowerCase();
      const isBinary =
        file.type.startsWith('image/') ||
        file.type.startsWith('audio/') ||
        file.type.startsWith('video/') ||
        file.type === 'application/pdf' ||
        lower.endsWith('.pdf') ||
        lower.endsWith('.xlsx') ||
        lower.endsWith('.xls') ||
        lower.endsWith('.xlsm');

      let content = '';
      if (isBinary) {
        content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      } else {
        content = await file.text();
      }

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      items.push({
        id: fileId,
        name: fileName,
        path: relPath,
        type: 'file',
        parentId: currentParentId,
        extension: ext,
        content,
        isModified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (items.length > 0) {
      await saveFilesToStorage(items);
      set({ files: items, openTabs: [], activeFileId: null });
      const firstFile = items.find(f => f.type === 'file');
      if (firstFile) {
        get().openFileInTab(firstFile.id);
      }
      addToast({
        type: 'success',
        title: 'Folder Opened',
        message: `Loaded ${fileList.length} files into workspace.`,
      });
    }
  },

  openSystemFile: async () => {
    const { addToast } = useToastStore.getState();

    // Electron Desktop Mode
    if (isElectron()) {
      try {
        const result = await (window as any).electronAPI.openFileDialog();
        if (!result) return;

        const { openFileInTab, files } = get();
        const existing = files.find(f => f.path === result.filePath || f.name === result.name);
        if (existing) {
          get().updateFileContent(existing.id, result.content);
          set((state) => ({
            files: state.files.map((f) => f.id === existing.id ? { ...f, path: result.filePath, isModified: false } : f),
          }));
          openFileInTab(existing.id);
        } else {
          const extension = getFileExtension(result.name);
          const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const newFile: FileItem = {
            id,
            name: result.name,
            path: result.filePath, // Full native path preserved for instant saving
            type: 'file',
            parentId: null,
            extension,
            content: result.content || '',
            isModified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          const updated = [...files, newFile];
          set({ files: updated });
          saveFilesToStorage(updated);
          openFileInTab(id);
        }
        addToast({
          type: 'success',
          title: 'File Opened',
          message: `Opened ${result.name}.`,
        });
      } catch (err: any) {
        console.error('Failed to open native file:', err);
      }
      return;
    }

    // Web Browser Open File
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.onchange = async (e: any) => {
      const fileList: FileList = e.target.files;
      if (fileList && fileList.length > 0) {
        await get().importFilesFromOS(fileList, null);
      }
    };
    input.click();
  },

  addFolderToWorkspace: async () => {
    const { addToast } = useToastStore.getState();
    const { files } = get();

    if (isElectron()) {
      try {
        const result = await (window as any).electronAPI.openFolderDialog();
        if (!result || !result.files || result.files.length === 0) return;

        const folderName = result.folderName || 'Project';
        const folderRootPath = result.folderPath || folderName;
        const rootFolderId = `root_folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        // Create the top-level folder entry for this project
        const rootFolderItem: FileItem = {
          id: rootFolderId,
          name: folderName,
          path: folderRootPath,
          type: 'folder',
          parentId: null,
          isExpanded: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Re-parent all files inside this new root folder
        const mappedFiles: FileItem[] = result.files.map((item: FileItem) => {
          if (item.parentId === null) {
            return {
              ...item,
              parentId: rootFolderId,
              path: `${folderName}/${item.path || item.name}`,
            };
          }
          return {
            ...item,
            path: `${folderName}/${item.path || item.name}`,
          };
        });

        // Merge with existing workspace files
        const existingIds = new Set(files.map(f => f.id));
        const newFiles = [rootFolderItem, ...mappedFiles.filter(f => !existingIds.has(f.id))];
        const mergedFiles = [...files, ...newFiles];

        await saveFilesToStorage(mergedFiles);
        set({ files: mergedFiles });

        addToast({
          type: 'success',
          title: 'Folder Added to Workspace',
          message: `Added ${folderName} (${mappedFiles.length} items) to workspace.`,
        });
      } catch (err: any) {
        console.error('Failed to add folder to workspace:', err);
        addToast({
          type: 'error',
          title: 'Add Folder Failed',
          message: err.message || 'Could not add folder.',
        });
      }
    } else {
      // Modern Web Browser with File System Access API
      if ('showDirectoryPicker' in window) {
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          const folderName = dirHandle.name || 'Project';
          const rootFolderId = `root_folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const collectedFiles: FileItem[] = [{
            id: rootFolderId,
            name: folderName,
            path: folderName,
            type: 'folder',
            parentId: null,
            isExpanded: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }];

          async function readDir(handle: any, parentPath = '', parentId: string | null = null) {
            for await (const entry of handle.values()) {
              const currentPath = parentPath ? `${parentPath}/${entry.name}` : `${folderName}/${entry.name}`;
              const id = `web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

              if (entry.kind === 'directory') {
                if (['node_modules', '.git', 'dist', '.cache'].includes(entry.name)) continue;

                collectedFiles.push({
                  id,
                  name: entry.name,
                  path: currentPath,
                  type: 'folder',
                  parentId: parentId || rootFolderId,
                  isExpanded: false,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
                await readDir(entry, currentPath, id);
              } else if (entry.kind === 'file') {
                const fileData = await entry.getFile();
                const ext = getFileExtension(entry.name);
                const text = await fileData.text();

                collectedFiles.push({
                  id,
                  name: entry.name,
                  path: currentPath,
                  type: 'file',
                  parentId: parentId || rootFolderId,
                  extension: ext,
                  content: text,
                  isModified: false,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
              }
            }
          }

          await readDir(dirHandle, '', rootFolderId);

          const merged = [...files, ...collectedFiles];
          await saveFilesToStorage(merged);
          set({ files: merged });

          addToast({
            type: 'success',
            title: 'Folder Added to Workspace',
            message: `Added ${folderName} (${collectedFiles.length - 1} items).`,
          });
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          console.warn('showDirectoryPicker error:', err);
        }
      }
    }
  },

  removeFolderFromWorkspace: (folderId: string) => {
    const { files, openTabs, activeFileId } = get();
    const target = files.find(f => f.id === folderId);
    if (!target) return;

    const idsToDelete = new Set<string>();
    const collectIds = (item: FileItem) => {
      idsToDelete.add(item.id);
      if (item.type === 'folder') {
        const children = files.filter(f => f.parentId === item.id || (f.path && f.path.startsWith(item.path + '/')));
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
    useToastStore.getState().addToast({
      type: 'info',
      title: 'Folder Removed',
      message: `${target.name} was removed from workspace.`,
    });
  },
}));
