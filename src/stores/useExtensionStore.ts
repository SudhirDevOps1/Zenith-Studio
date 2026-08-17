import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { ExtensionItem, ExtensionCategory } from '../types/extensions';
import { DEFAULT_EXTENSIONS } from '../data/defaultExtensions';

const IDB_KEY_EXTENSIONS = 'codestudio_installed_extensions_v1';

interface ExtensionState {
  extensions: ExtensionItem[];
  activeTab: 'marketplace' | 'installed' | 'recommended';
  selectedCategory: ExtensionCategory;
  searchQuery: string;
  selectedExtension: ExtensionItem | null;
  isLoadingOnline: boolean;
  onlineExtensions: ExtensionItem[];

  // Actions
  initializeExtensions: () => Promise<void>;
  installExtension: (id: string) => Promise<void>;
  uninstallExtension: (id: string) => Promise<void>;
  toggleExtension: (id: string) => Promise<void>;
  searchOpenVSX: (query: string) => Promise<void>;
  setSelectedExtension: (ext: ExtensionItem | null) => void;
  setActiveTab: (tab: 'marketplace' | 'installed' | 'recommended') => void;
  setSelectedCategory: (cat: ExtensionCategory) => void;
  setSearchQuery: (q: string) => void;
}

export const useExtensionStore = create<ExtensionState>((set, get) => ({
  extensions: DEFAULT_EXTENSIONS,
  activeTab: 'marketplace',
  selectedCategory: 'All',
  searchQuery: '',
  selectedExtension: null,
  isLoadingOnline: false,
  onlineExtensions: [],

  initializeExtensions: async () => {
    try {
      const saved = await idbGet<ExtensionItem[]>(IDB_KEY_EXTENSIONS);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        // Merge saved states with default catalog
        const map = new Map(saved.map((e) => [e.id, e]));
        const merged = DEFAULT_EXTENSIONS.map((ext) => {
          const s = map.get(ext.id);
          if (s) {
            return { ...ext, installed: s.installed, enabled: s.enabled };
          }
          return ext;
        });

        // Add any external Open VSX extensions saved in storage
        saved.forEach((s) => {
          if (!merged.some((m) => m.id === s.id)) {
            merged.push(s);
          }
        });

        set({ extensions: merged });
      }
    } catch (err) {
      console.warn('Could not load extensions from IDB, using defaults:', err);
    }
  },

  installExtension: async (id: string) => {
    const { extensions, onlineExtensions } = get();
    let target = extensions.find((e) => e.id === id);

    if (!target) {
      target = onlineExtensions.find((e) => e.id === id);
    }

    if (!target) return;

    const updated = extensions.map((e) => (e.id === id ? { ...e, installed: true, enabled: true } : e));
    if (!extensions.some((e) => e.id === id)) {
      updated.push({ ...target, installed: true, enabled: true });
    }

    set({ extensions: updated });
    try {
      await idbSet(IDB_KEY_EXTENSIONS, updated);
    } catch (err) {
      console.error('Failed to save installed extension to IDB:', err);
    }
  },

  uninstallExtension: async (id: string) => {
    const { extensions } = get();
    const updated = extensions.map((e) => (e.id === id ? { ...e, installed: false, enabled: false } : e));
    set({ extensions: updated });
    try {
      await idbSet(IDB_KEY_EXTENSIONS, updated);
    } catch (err) {
      console.error('Failed to save uninstalled extension to IDB:', err);
    }
  },

  toggleExtension: async (id: string) => {
    const { extensions } = get();
    const updated = extensions.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e));
    set({ extensions: updated });
    try {
      await idbSet(IDB_KEY_EXTENSIONS, updated);
    } catch (err) {
      console.error('Failed to toggle extension in IDB:', err);
    }
  },

  searchOpenVSX: async (query: string) => {
    if (!query.trim()) {
      set({ onlineExtensions: [], isLoadingOnline: false });
      return;
    }

    set({ isLoadingOnline: true });
    try {
      const res = await fetch(`https://open-vsx.org/api/-/search?query=${encodeURIComponent(query)}&size=15`);
      if (!res.ok) throw new Error(`Open VSX HTTP ${res.status}`);
      const data = await res.json();
      const detectCategory = (extName: string, tags: string[] = [], desc: string = ''): ExtensionCategory => {
        const text = `${extName} ${tags.join(' ')} ${desc}`.toLowerCase();
        if (text.includes('theme') || text.includes('color-theme') || text.includes('icon-theme')) return 'Themes';
        if (text.includes('format') || text.includes('prettier') || text.includes('beautif')) return 'Formatters';
        if (text.includes('lint') || text.includes('eslint') || text.includes('hint')) return 'Linters';
        if (text.includes('snippet') || text.includes('template')) return 'Snippets';
        if (text.includes('ai') || text.includes('copilot') || text.includes('git') || text.includes('preview') || text.includes('browser')) return 'AI & Productivity';
        return 'Programming Languages';
      };

      const items: ExtensionItem[] = (data.extensions || []).map((item: any) => {
        const cat = detectCategory(item.name || '', item.tags || [], item.description || '');
        return {
          id: `${item.namespace}.${item.name}`,
          name: item.name,
          displayName: item.displayName || item.name,
          publisher: item.namespace,
          version: item.version || '1.0.0',
          description: item.description || 'Open VSX Community Extension for VS Code/CodeStudio.',
          category: cat,
          icon: item.files?.icon,
          downloads: item.downloadCount > 1000000 ? `${(item.downloadCount / 1000000).toFixed(1)}M` : item.downloadCount > 1000 ? `${(item.downloadCount / 1000).toFixed(0)}k` : `${item.downloadCount || 0}`,
          downloadsCount: item.downloadCount || 0,
          rating: item.averageRating ? Number(item.averageRating.toFixed(1)) : 4.8,
          reviewsCount: item.reviewCount || 10,
          verified: item.verified || false,
          installed: false,
          enabled: false,
          tags: item.tags || ['open-vsx', 'community'],
          source: 'open-vsx',
          readme: `# ${item.displayName || item.name}\n\n${item.description || ''}\n\n- **Publisher**: ${item.namespace}\n- **Version**: ${item.version}\n- **Source**: [Open VSX Registry](https://open-vsx.org/extension/${item.namespace}/${item.name})`,
        };
      });

      set({ onlineExtensions: items, isLoadingOnline: false });
    } catch {
      // Graceful offline fallback: filter local extensions
      set({ onlineExtensions: [], isLoadingOnline: false });
    }
  },

  setSelectedExtension: (ext) => set({ selectedExtension: ext }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
