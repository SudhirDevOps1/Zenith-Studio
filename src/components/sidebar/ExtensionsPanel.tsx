import React, { useState, useEffect } from 'react';
import {
  Blocks,
  Search,
  Download,
  Star,
  Shield,
  Loader2,
  X,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useExtensionStore } from '../../stores/useExtensionStore';
import { useToastStore } from '../../stores/useToastStore';
import { ExtensionCategory, ExtensionItem } from '../../types/extensions';
import { hasRealEffect } from '../../utils/extensionEffects';

const CATEGORIES: ExtensionCategory[] = [
  'All',
  'Themes',
  'Programming Languages',
  'Formatters',
  'Linters',
  'Snippets',
  'AI & Productivity',
];

const QUICK_SEARCH_TAGS = [
  'Python',
  'Live Server',
  'One Dark',
  'React',
  'Prettier',
  'Tailwind',
  'C++',
  'Rust',
  'GitLens',
];

const ExtensionIcon: React.FC<{ ext: ExtensionItem }> = ({ ext }) => {
  const [hasError, setHasError] = useState(false);

  if (ext.icon && !hasError) {
    return (
      <div className="w-10 h-10 rounded bg-slate-800/60 p-1 border border-slate-700/50 flex items-center justify-center shrink-0">
        <img
          src={ext.icon}
          alt=""
          onError={() => setHasError(true)}
          className="w-full h-full object-contain rounded"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: ext.iconBg || (ext.iconColor ? `${ext.iconColor}20` : '#0284c720'),
        borderColor: ext.iconColor || '#0284c7',
      }}
      className="w-10 h-10 rounded border flex items-center justify-center text-sm font-bold shrink-0 shadow-sm"
    >
      <span style={{ color: ext.iconColor || '#38bdf8' }}>
        {ext.displayName ? ext.displayName.charAt(0).toUpperCase() : 'E'}
      </span>
    </div>
  );
};

export const ExtensionsPanel: React.FC = () => {
  const {
    extensions,
    activeTab,
    selectedCategory,
    searchQuery,
    isLoadingOnline,
    onlineExtensions,
    popularExtensions,
    onlineSearchError,
    initializeExtensions,
    fetchPopularOpenVSX,
    installExtension,
    toggleExtension,
    searchOpenVSX,
    setSelectedExtension,
    setActiveTab,
    setSelectedCategory,
    setSearchQuery,
  } = useExtensionStore();

  const { addToast } = useToastStore();
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    initializeExtensions();
    fetchPopularOpenVSX();
  }, [initializeExtensions, fetchPopularOpenVSX]);

  // Debounced search for Open VSX when typing (supports single char searches like C, R, P)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        searchOpenVSX(searchQuery);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, searchOpenVSX]);

  const installedList = extensions.filter((e) => e.installed);
  const installedCount = installedList.length;

  const getFilteredExtensions = (): ExtensionItem[] => {
    const q = searchQuery.trim().toLowerCase();
    const cleanQ = q.replace(/[\s\-_]/g, '');

    // If searching, pool all extensions (curated + online Open VSX results)
    let pool: ExtensionItem[] = [];

    if (q) {
      // Merge local catalog + Open VSX results
      pool = [...extensions];
      const existingIds = new Set(pool.map((e) => e.id));
      onlineExtensions.forEach((online) => {
        if (!existingIds.has(online.id)) {
          pool.push(online);
        }
      });

      const matchesQuery = (e: ExtensionItem) => {
        const dName = e.displayName.toLowerCase();
        const pName = e.publisher.toLowerCase();
        const desc = e.description.toLowerCase();
        const tagStr = (e.tags || []).join(' ').toLowerCase();

        const aliases: Record<string, string[]> = {
          'c++': ['c++', 'cpp', 'c/c++', 'clang', 'gcc', 'cplusplus'],
          cpp: ['c++', 'cpp', 'c/c++', 'clang', 'gcc'],
          c: ['c++', 'cpp', 'c/c++', 'clang', 'gcc'],
          'c#': ['c#', 'csharp', 'dotnet'],
          csharp: ['c#', 'csharp', 'dotnet'],
          python: ['python', 'py', 'pyodide'],
          py: ['python', 'py'],
          javascript: ['javascript', 'js', 'node'],
          js: ['javascript', 'js'],
          typescript: ['typescript', 'ts'],
          ts: ['typescript', 'ts'],
          react: ['react', 'jsx', 'tsx'],
          vue: ['vue'],
          html: ['html', 'css', 'web'],
          rust: ['rust', 'cargo'],
          go: ['go', 'golang'],
          server: ['live server', 'server', 'preview'],
          live: ['live server', 'live preview', 'live'],
        };

        const targetWords = aliases[q] || [q, cleanQ];
        return targetWords.some(
          (w) =>
            dName.includes(w) ||
            pName.includes(w) ||
            desc.includes(w) ||
            tagStr.includes(w)
        );
      };

      let queryMatches = pool.filter((e) => e.source === 'open-vsx' || matchesQuery(e));

      // Category filter application
      if (selectedCategory !== 'All') {
        queryMatches = queryMatches.filter((e) => e.category === selectedCategory);
      }

      return queryMatches;
    }

    // Browsing mode without search query
    if (activeTab === 'installed') {
      pool = installedList;
    } else if (activeTab === 'recommended') {
      pool = extensions.filter((e) => e.rating >= 4.85 || e.downloadsCount > 10000000);
    } else {
      // Marketplace tab: Merge curated catalog + Open VSX popular feed
      pool = [...extensions];
      const existingIds = new Set(pool.map((e) => e.id));
      popularExtensions.forEach((pop) => {
        if (!existingIds.has(pop.id)) {
          pool.push(pop);
        }
      });
    }

    if (selectedCategory !== 'All') {
      pool = pool.filter((e) => e.category === selectedCategory);
    }

    return pool;
  };

  const filtered = getFilteredExtensions();

  const handleInstall = async (ext: ExtensionItem) => {
    setInstallingId(ext.id);
    try {
      await installExtension(ext.id);
      addToast({
        type: 'success',
        title: 'Extension Installed',
        message: `${ext.displayName} is now active in Zenith Studio.`,

      });
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none relative overflow-hidden">
      {/* Top Header */}
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Blocks className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
            Extensions: Marketplace
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700 text-slate-400">
            {installedCount} installed
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b border-slate-800 bg-[#181825]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Extensions (Curated + Open VSX)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-8 pr-14 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {isLoadingOnline && (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Tag Pills */}
        {!searchQuery && (
          <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-0.5" style={{ scrollbarWidth: 'none' }}>
            <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick:
            </span>
            {QUICK_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full text-[10px] whitespace-nowrap border border-slate-700 transition"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Row (when not actively searching) */}
      {!searchQuery && (
        <div className="flex items-center border-b border-slate-800 bg-[#14141f] text-[11px] font-medium px-2 py-1 gap-1">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-2.5 py-1 rounded transition ${
              activeTab === 'marketplace'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              activeTab === 'installed'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Installed</span>
            <span className="px-1.5 py-0.2 bg-slate-900 rounded-full text-[9px] border border-slate-700">
              {installedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-2.5 py-1 rounded transition ${
              activeTab === 'recommended'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Popular
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div
        className="flex items-center gap-1 px-2.5 py-1.5 border-b border-slate-800/80 bg-[#181825] overflow-x-auto text-[10px]"
        style={{ scrollbarWidth: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-0.5 rounded-full whitespace-nowrap transition border ${
              selectedCategory === cat
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-semibold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status Bar */}
      {searchQuery && (
        <div className="px-3 py-1 bg-[#14141f] border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>Found {filtered.length} extensions</span>
          </span>
          {onlineExtensions.length > 0 && (
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open VSX Live
            </span>
          )}
        </div>
      )}

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-center p-4 text-slate-500 space-y-2">
            <Blocks className="w-8 h-8 opacity-40 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">No extensions found</span>
            <p className="text-[11px] text-slate-500 max-w-xs">
              {onlineSearchError ? onlineSearchError : `Try searching for popular tools like Python, React, Live Server, or One Dark.`}
            </p>
            <div className="flex flex-wrap gap-1 justify-center pt-1">
              {QUICK_SEARCH_TAGS.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-2 py-0.5 bg-slate-800 text-cyan-300 hover:bg-slate-700 rounded text-[10px] border border-slate-700"
                >
                  Search {tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          filtered.map((ext) => (
            <div
              key={ext.id}
              onClick={() => setSelectedExtension(ext)}
              className="p-2.5 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800/90 hover:border-cyan-800/60 rounded-md transition cursor-pointer group flex items-start gap-3"
            >
              {/* Icon Box with Error Fallback */}
              <ExtensionIcon ext={ext} />

              {/* Details & Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition flex items-center gap-1.5">
                      <span className="truncate">{ext.displayName}</span>
                      {ext.verified && (
                        <span title="Verified Publisher" className="inline-flex items-center shrink-0">
                          <Shield className="w-3 h-3 text-blue-400" />
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-cyan-400/90 font-medium truncate max-w-[100px]">{ext.publisher}</span>
                      <span className="text-slate-500 font-mono text-[9px]">v{ext.version}</span>
                    </div>
                  </div>

                  {/* Install / Manage Button */}
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0 pt-0.5">
                    {ext.installed ? (
                      <button
                        onClick={() => {
                          toggleExtension(ext.id);
                          addToast({
                            type: 'info',
                            title: ext.enabled ? 'Extension Disabled' : 'Extension Enabled',
                            message: `${ext.displayName} is now ${ext.enabled ? 'disabled' : 'enabled'}.`,
                          });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                          ext.enabled
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/60'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {ext.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstall(ext)}
                        disabled={installingId === ext.id}
                        className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-[10px] font-semibold transition flex items-center gap-1 shadow-sm"
                      >
                        {installingId === ext.id ? (
                          <>
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Installing...
                          </>
                        ) : (
                          'Install'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug mt-1">
                  {ext.description}
                </p>

                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Download className="w-2.5 h-2.5 text-slate-400" /> {ext.downloads}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-2.5 h-2.5 fill-amber-400" /> {ext.rating}
                  </span>
                  {hasRealEffect(ext) && (
                    <span className="px-1 py-0.2 bg-blue-950/60 text-blue-300 rounded text-[9px] font-mono border border-blue-800/40">
                      Real Effect
                    </span>
                  )}
                  {ext.source === 'open-vsx' && (
                    <span className="px-1 py-0.2 bg-slate-800 text-slate-400 rounded text-[9px] font-mono">
                      Open VSX
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
