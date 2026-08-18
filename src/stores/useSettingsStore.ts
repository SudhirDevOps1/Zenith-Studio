import { create } from 'zustand';
import { EditorSettings, DEFAULT_SETTINGS } from '../types/settings';
import { loadSettingsFromStorage, saveSettingsToStorage, loadSecureSecretsFromVault } from '../utils/storage';
import { applyAccentToDOM } from '../utils/accentThemes';

export type SidebarTab = 'explorer' | 'search' | 'git' | 'snippets' | 'extensions' | 'ai' | 'debug' | 'info' | 'settings';


interface SettingsState {
  settings: EditorSettings;
  isSettingsOpen: boolean;
  isCommandPaletteOpen: boolean;
  isShortcutsModalOpen: boolean;
  isZenMode: boolean;
  sidebarOpen: boolean;
  activeSidebarTab: SidebarTab;
  isAiSetupOpen: boolean; // Bug #19: Global AI Setup modal state

  // Actions
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  initSecureVault: () => Promise<void>;
  setSettingsOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setAiSetupOpen: (open: boolean) => void; // Bug #19
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleZenMode: () => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  resetSettings: () => void;
  // Zoom actions
  increaseZoom: () => void;
  decreaseZoom: () => void;
  resetZoom: () => void;
}

const initialSettings: EditorSettings = {
  ...DEFAULT_SETTINGS,
  ...loadSettingsFromStorage(),
};
applyAccentToDOM(initialSettings.accentColor);


export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: initialSettings,
  isSettingsOpen: false,
  isCommandPaletteOpen: false,
  isShortcutsModalOpen: false,
  isZenMode: false,
  sidebarOpen: true,
  activeSidebarTab: 'explorer',
  isAiSetupOpen: false, // Bug #19

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    saveSettingsToStorage(updated);
    if (newSettings.accentColor) {
      applyAccentToDOM(newSettings.accentColor);
    }
  },

  // 🛡️ Asynchronously hydrate secrets from OS Credential Vault (Windows DPAPI / Keychain)
  initSecureVault: async () => {
    try {
      const secrets = await loadSecureSecretsFromVault();
      if (secrets.aiApiKey || secrets.geminiApiKey) {
        set((state) => ({
          settings: {
            ...state.settings,
            aiApiKey: secrets.aiApiKey || state.settings.aiApiKey,
            geminiApiKey: secrets.geminiApiKey || state.settings.geminiApiKey,
          },
        }));
      }
    } catch (err) {
      console.warn('[Vault] Failed to hydrate secure secrets:', err);
    }
  },

  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
  setAiSetupOpen: (open) => set({ isAiSetupOpen: open }), // Bug #19
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

  // Bug #16: Reset also fires a zoom-reset event so Monaco re-applies editorZoom=0 to DOM
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    saveSettingsToStorage(DEFAULT_SETTINGS);
    applyAccentToDOM(DEFAULT_SETTINGS.accentColor);
    window.dispatchEvent(new CustomEvent('zenith:reset-zoom'));
  },

  // Zoom: each step = 1 (1pt font size), max +20 / min -5
  increaseZoom: () => {
    const current = get().settings.editorZoom ?? 0;
    if (current >= 20) return;
    const updated = { ...get().settings, editorZoom: current + 1 };
    set({ settings: updated });
    saveSettingsToStorage(updated);
  },
  decreaseZoom: () => {
    const current = get().settings.editorZoom ?? 0;
    if (current <= -5) return;
    const updated = { ...get().settings, editorZoom: current - 1 };
    set({ settings: updated });
    saveSettingsToStorage(updated);
  },
  resetZoom: () => {
    const updated = { ...get().settings, editorZoom: 0 };
    set({ settings: updated });
    saveSettingsToStorage(updated);
  },
}));

