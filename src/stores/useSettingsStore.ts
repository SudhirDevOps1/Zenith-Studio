import { create } from 'zustand';
import { EditorSettings, DEFAULT_SETTINGS } from '../types/settings';
import { loadSettingsFromStorage, saveSettingsToStorage } from '../utils/storage';
import { applyAccentToDOM } from '../utils/accentThemes';

export type SidebarTab = 'explorer' | 'search' | 'git' | 'snippets' | 'extensions' | 'info' | 'settings';

interface SettingsState {
  settings: EditorSettings;
  isSettingsOpen: boolean;
  isCommandPaletteOpen: boolean;
  isShortcutsModalOpen: boolean;
  isZenMode: boolean;
  activeSidebarTab: SidebarTab;

  // Actions
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  setSettingsOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  toggleZenMode: () => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  resetSettings: () => void;
}

const initialSettings = loadSettingsFromStorage();
applyAccentToDOM(initialSettings.accentColor);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: initialSettings,
  isSettingsOpen: false,
  isCommandPaletteOpen: false,
  isShortcutsModalOpen: false,
  isZenMode: false,
  activeSidebarTab: 'explorer',

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    saveSettingsToStorage(updated);
    if (newSettings.accentColor) {
      applyAccentToDOM(newSettings.accentColor);
    }
  },

  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    saveSettingsToStorage(DEFAULT_SETTINGS);
    applyAccentToDOM(DEFAULT_SETTINGS.accentColor);
  },
}));
