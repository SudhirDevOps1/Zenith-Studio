import { get, set } from 'idb-keyval';
import { FileItem } from '../types/fileSystem';
import { EditorSettings, DEFAULT_SETTINGS } from '../types/settings';
import { INITIAL_SAMPLE_FILES } from './fileUtils';

const FILES_KEY = 'zenith_studio_files_v1';
const SETTINGS_KEY = 'zenith_studio_settings_v1';
const LEGACY_FILES_KEY = 'codestudio_files_v1';
const LEGACY_SETTINGS_KEY = 'codestudio_settings_v1';

export const loadFilesFromStorage = async (): Promise<FileItem[]> => {
  try {
    let savedFiles = await get<FileItem[]>(FILES_KEY);
    if (!savedFiles || !Array.isArray(savedFiles) || savedFiles.length === 0) {
      savedFiles = await get<FileItem[]>(LEGACY_FILES_KEY);
    }
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

const VAULT_AI_KEY = 'zenith_secret_ai_key';
const VAULT_GEMINI_KEY = 'zenith_secret_gemini_key';

export const loadSettingsFromStorage = (): EditorSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to load settings from localStorage:', err);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Enterprise OS Credential Vault Loader (VS Code Standard)
 * Asynchronously hydrates secrets from OS DPAPI / Keychain into in-memory store
 */
export const loadSecureSecretsFromVault = async (): Promise<{ aiApiKey?: string; geminiApiKey?: string }> => {
  const electronApi = typeof window !== 'undefined' ? (window as any).electronAPI : undefined;
  if (!electronApi?.getSecret) {
    return {};
  }

  try {
    const [aiRes, geminiRes] = await Promise.all([
      electronApi.getSecret(VAULT_AI_KEY).catch(() => ({ success: false, value: null })),
      electronApi.getSecret(VAULT_GEMINI_KEY).catch(() => ({ success: false, value: null })),
    ]);

    const secrets: { aiApiKey?: string; geminiApiKey?: string } = {};
    if (aiRes?.success && aiRes.value) secrets.aiApiKey = aiRes.value;
    if (geminiRes?.success && geminiRes.value) secrets.geminiApiKey = geminiRes.value;

    return secrets;
  } catch (err) {
    console.warn('[Vault] Failed to retrieve secrets from OS Vault:', err);
    return {};
  }
};

/**
 * Enterprise Zero-Trust Settings Saver
 * In Electron: Stores secrets in hardware-backed OS DPAPI/Keychain, strips from plain localStorage
 * In Web: Persists to localStorage with fallback
 */
export const saveSettingsToStorage = (settings: EditorSettings): void => {
  try {
    const electronApi = typeof window !== 'undefined' ? (window as any).electronAPI : undefined;

    if (electronApi?.setSecret) {
      // 🛡️ Electron Desktop: Save secrets to OS Encrypted Vault asynchronously
      if (settings.aiApiKey != null) {
        electronApi.setSecret(VAULT_AI_KEY, settings.aiApiKey).catch(() => {});
      }
      if (settings.geminiApiKey != null) {
        electronApi.setSecret(VAULT_GEMINI_KEY, settings.geminiApiKey).catch(() => {});
      }

      // Sanitize localStorage payload: Remove plain-text secrets so DevTools/XSS cannot read them
      const sanitized = {
        ...settings,
        aiApiKey: '',
        geminiApiKey: '',
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitized));
      return;
    }

    // Web Browser Mode
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};

