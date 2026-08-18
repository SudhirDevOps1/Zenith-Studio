import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { ExtensionItem, ExtensionCategory } from '../types/extensions';
import { DEFAULT_EXTENSIONS } from '../data/defaultExtensions';
import { applyExtensionEffect, revertExtensionEffect } from '../utils/extensionEffects';

const IDB_KEY_EXTENSIONS = 'codestudio_user_extensions_v1';

interface ExtensionStoreState {
  extensions: ExtensionItem[];
  activeTab: 'marketplace' | 'installed' | 'recommended';
  selectedCategory: ExtensionCategory;
  searchQuery: string;
  selectedExtension: ExtensionItem | null;
  isLoadingOnline: boolean;
  onlineExtensions: ExtensionItem[];
  popularExtensions: ExtensionItem[];
  onlineSearchError: string | null;

  initializeExtensions: () => Promise<void>;
  installExtension: (id: string) => Promise<void>;
  uninstallExtension: (id: string) => Promise<void>;
  toggleExtension: (id: string) => Promise<void>;
  searchOpenVSX: (query: string) => Promise<void>;
  fetchPopularOpenVSX: () => Promise<void>;
  setSelectedExtension: (ext: ExtensionItem | null) => void;
  setActiveTab: (tab: 'marketplace' | 'installed' | 'recommended') => void;
  setSelectedCategory: (cat: ExtensionCategory) => void;
  setSearchQuery: (q: string) => void;
}

let activeSearchAbortController: AbortController | null = null;
let searchSequenceCounter = 0;

const detectCategory = (extName: string, tags: string[] = [], desc: string = ''): ExtensionCategory => {
  const text = `${extName} ${tags.join(' ')} ${desc}`.toLowerCase();
  if (text.includes('theme') || text.includes('color-theme') || text.includes('icon-theme')) return 'Themes';
  if (text.includes('format') || text.includes('prettier') || text.includes('beautif')) return 'Formatters';
  if (text.includes('lint') || text.includes('eslint') || text.includes('hint')) return 'Linters';
  if (text.includes('snippet') || text.includes('template')) return 'Snippets';
  if (text.includes('ai') || text.includes('copilot') || text.includes('git') || text.includes('preview') || text.includes('browser') || text.includes('server') || text.includes('runner')) return 'AI & Productivity';
  return 'Programming Languages';
};

const mapOpenVsxItems = (rawExtensions: any[] = []): ExtensionItem[] => {
  return rawExtensions.map((item: any) => {
    const cat = detectCategory(item.name || '', item.tags || [], item.description || '');
    const downloads = item.downloadCount || 0;
    return {
      id: `${item.namespace}.${item.name}`,
      name: item.name,
      displayName: item.displayName || item.name,
      publisher: item.namespace,
      version: item.version || '1.0.0',
      description: item.description || `Open VSX Community Extension for Zenith Studio & VS Code.`,
      category: cat,
      icon: item.files?.icon,
      downloads: downloads > 1000000 ? `${(downloads / 1000000).toFixed(1)}M` : downloads > 1000 ? `${(downloads / 1000).toFixed(0)}k` : `${downloads}`,
      downloadsCount: downloads,
      rating: item.averageRating ? Number(item.averageRating.toFixed(1)) : 4.8,
      reviewsCount: item.reviewCount || 12,
      verified: item.verified || false,
      installed: false,
      enabled: false,
      tags: Array.isArray(item.tags) ? item.tags : [item.name, 'community'],
      source: 'open-vsx',
      readme: `# ${item.displayName || item.name}\n\n${item.description || ''}\n\n- **Publisher**: ${item.namespace}\n- **Version**: ${item.version}\n- **Source**: [Open VSX Registry](https://open-vsx.org/extension/${item.namespace}/${item.name})`,
    };
  });
};

export const useExtensionStore = create<ExtensionStoreState>((set, get) => ({
  extensions: DEFAULT_EXTENSIONS,
  activeTab: 'marketplace',
  selectedCategory: 'All',
  searchQuery: '',
  selectedExtension: null,
  isLoadingOnline: false,
  onlineExtensions: [],
  popularExtensions: [],
  onlineSearchError: null,

  initializeExtensions: async () => {
    try {
      const saved = await idbGet<ExtensionItem[]>(IDB_KEY_EXTENSIONS);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        const map = new Map(saved.map((e) => [e.id, e]));
        const merged = DEFAULT_EXTENSIONS.map((ext) => {
          const s = map.get(ext.id);
          if (s) {
            return { ...ext, installed: s.installed, enabled: s.enabled };
          }
          return ext;
        });

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
    const { extensions, onlineExtensions, popularExtensions } = get();
    let target = extensions.find((e) => e.id === id);

    if (!target) {
      target = onlineExtensions.find((e) => e.id === id) || popularExtensions.find((e) => e.id === id);
    }

    if (!target) return;

    const updated = extensions.map((e) => (e.id === id ? { ...e, installed: true, enabled: true } : e));
    if (!extensions.some((e) => e.id === id)) {
      updated.push({ ...target, installed: true, enabled: true });
    }

    set({ extensions: updated });
    // Apply real extension effect (theme switch, editor options, etc.)
    applyExtensionEffect({ ...target, installed: true, enabled: true });

    try {
      await idbSet(IDB_KEY_EXTENSIONS, updated);
    } catch (err) {
      console.error('Failed to save installed extension to IDB:', err);
    }
  },

  uninstallExtension: async (id: string) => {
    const { extensions } = get();
    const target = extensions.find((e) => e.id === id);
    const updated = extensions.map((e) => (e.id === id ? { ...e, installed: false, enabled: false } : e));
    set({ extensions: updated });
    // Revert extension effect
    if (target) revertExtensionEffect(target);
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

  fetchPopularOpenVSX: async () => {
    if (get().popularExtensions.length > 0) return;
    try {
      let data: any = null;
      if (typeof window !== 'undefined' && (window as any).electronAPI?.getPopularOpenVSX) {
        data = await (window as any).electronAPI.getPopularOpenVSX();
      }

      if (!data || !Array.isArray(data.extensions)) {
        const res = await fetch('https://open-vsx.org/api/-/search?size=50&sortBy=downloadCount&sortOrder=desc');
        if (res.ok) {
          data = await res.json();
        }
      }

      if (data && Array.isArray(data.extensions)) {
        const items = mapOpenVsxItems(data.extensions);
        set({ popularExtensions: items });
      }
    } catch (err) {
      console.warn('Could not fetch popular Open VSX feed:', err);
    }
  },

  searchOpenVSX: async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      set({ onlineExtensions: [], isLoadingOnline: false, onlineSearchError: null });
      return;
    }

    const currentSeq = ++searchSequenceCounter;

    if (activeSearchAbortController) {
      activeSearchAbortController.abort();
    }
    activeSearchAbortController = new AbortController();

    set({ isLoadingOnline: true, onlineSearchError: null });

    // Normalize query for Open VSX search engine
    let searchParam = trimmed;
    if (trimmed.toLowerCase() === 'c++') searchParam = 'cpp';
    else if (trimmed.toLowerCase() === 'c#') searchParam = 'csharp';

    try {
      let data: any = null;

      // 1. Desktop Mode: Native Electron IPC (Zero CORS, 100% Guaranteed)
      if (typeof window !== 'undefined' && (window as any).electronAPI?.searchOpenVSX) {
        try {
          data = await (window as any).electronAPI.searchOpenVSX(searchParam);
        } catch (ipcErr) {
          console.warn('Native Open VSX IPC search error:', ipcErr);
        }
      }

      // 2. Web Mode: Direct Open VSX Fetch
      if (!data || !Array.isArray(data.extensions)) {
        try {
          const res = await fetch(
            `https://open-vsx.org/api/-/search?query=${encodeURIComponent(searchParam)}&size=50&sortBy=relevance`,
            { signal: activeSearchAbortController.signal }
          );
          if (res.ok) {
            data = await res.json();
          }
        } catch {
          // 3. Web Mode Fallback: Multi-Proxy Failover
          const proxyUrls = [
            `https://corsproxy.io/?${encodeURIComponent(
              `https://open-vsx.org/api/-/search?query=${encodeURIComponent(searchParam)}&size=50&sortBy=relevance`
            )}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(
              `https://open-vsx.org/api/-/search?query=${encodeURIComponent(searchParam)}&size=50&sortBy=relevance`
            )}`,
          ];

          for (const proxy of proxyUrls) {
            try {
              const resProxy = await fetch(proxy, { signal: activeSearchAbortController.signal });
              if (resProxy.ok) {
                data = await resProxy.json();
                if (data && Array.isArray(data.extensions)) break;
              }
            } catch {
              continue;
            }
          }
        }
      }

      // Sequence guard: Only apply if this is still the latest active search
      if (currentSeq !== searchSequenceCounter) return;

      if (!data || !Array.isArray(data.extensions)) {
        set({ onlineExtensions: [], isLoadingOnline: false, onlineSearchError: null });
        return;
      }

      const items = mapOpenVsxItems(data.extensions);
      set({ onlineExtensions: items, isLoadingOnline: false, onlineSearchError: null });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      if (currentSeq === searchSequenceCounter) {
        set({ onlineExtensions: [], isLoadingOnline: false, onlineSearchError: null });
      }
    }
  },

  setSelectedExtension: async (ext: ExtensionItem | null) => {
    set({ selectedExtension: ext });
    if (!ext) return;

    // If it's an Open VSX extension and doesn't have a full README yet, fetch it dynamically
    if (ext.source === 'open-vsx' && (!ext.readme || ext.readme.length < 200)) {
      try {
        let data: any = null;
        if (typeof window !== 'undefined' && (window as any).electronAPI?.openvsx?.getExtension) {
          data = await (window as any).electronAPI.openvsx.getExtension({
            namespace: ext.publisher,
            name: ext.name,
          });
        } else {
          const res = await fetch(`https://open-vsx.org/api/${encodeURIComponent(ext.publisher)}/${encodeURIComponent(ext.name)}`);
          if (res.ok) data = await res.json();
        }

        if (data) {
          const readmeContent = data.readme || data.description || '';
          set((state) => {
            const updatedExt = {
              ...ext,
              description: data.description || ext.description,
              readme: readmeContent || ext.readme,
              version: data.version || ext.version,
              tags: data.tags || ext.tags,
              homepage: data.homepage,
              repository: data.repository,
            };
            return {
              selectedExtension: updatedExt,
              extensions: state.extensions.map((e) => (e.id === ext.id ? updatedExt : e)),
              onlineExtensions: state.onlineExtensions.map((e) => (e.id === ext.id ? updatedExt : e)),
              popularExtensions: state.popularExtensions.map((e) => (e.id === ext.id ? updatedExt : e)),
            };
          });
        }
      } catch (err) {
        console.warn('Could not fetch full extension details:', err);
      }
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
