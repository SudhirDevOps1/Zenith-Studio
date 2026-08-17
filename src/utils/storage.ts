import { get, set } from 'idb-keyval';
import { FileItem } from '../types/fileSystem';
import { EditorSettings, DEFAULT_SETTINGS } from '../types/settings';
import { INITIAL_SAMPLE_FILES } from './fileUtils';

const FILES_KEY = 'codestudio_files_v1';
const SETTINGS_KEY = 'codestudio_settings_v1';

export const loadFilesFromStorage = async (): Promise<FileItem[]> => {
  try {
    const savedFiles = await get<FileItem[]>(FILES_KEY);
    if (savedFiles && Array.isArray(savedFiles) && savedFiles.length > 0) {
      // Filter out legacy demo docs folder if present from earlier runs
      const cleaned = savedFiles.filter(
        (f) => f.id !== 'folder-docs' && f.parentId !== 'folder-docs' && !f.path?.startsWith('docs/')
      );
      return cleaned.length > 0 ? cleaned : INITIAL_SAMPLE_FILES;
    }
  } catch (err) {
    console.error('Failed to load files from IndexedDB:', err);
  }
  return INITIAL_SAMPLE_FILES;
};


export const saveFilesToStorage = async (files: FileItem[]): Promise<void> => {
  try {
    await set(FILES_KEY, files);
  } catch (err) {
    console.error('Failed to save files to IndexedDB:', err);
  }
};

export const loadSettingsFromStorage = (): EditorSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to load settings from localStorage:', err);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettingsToStorage = (settings: EditorSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
};
