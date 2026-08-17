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
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useExtensionStore } from '../../stores/useExtensionStore';
import { useToastStore } from '../../stores/useToastStore';
import { ExtensionCategory, ExtensionItem } from '../../types/extensions';
import { ExtensionDetailModal } from '../extensions/ExtensionDetailModal';
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

export const ExtensionsPanel: React.FC = () => {
  const {
    extensions,
    activeTab,
    selectedCategory,
    searchQuery,
    isLoadingOnline,
    onlineExtensions,
    onlineSearchError,
    initializeExtensions,
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
  }, [initializeExtensions]);

  // Debounced search for Open VSX when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchOpenVSX(searchQuery);
      }
    }, 300);
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
        const catMatches = queryMatches.filter((e) => e.category === selectedCategory);
        if (catMatches.length > 0) return catMatches;
      }

      return queryMatches;
    }

    // Browsing mode without search query
    if (activeTab === 'installed') {
      pool = installedList;
    } else if (activeTab === 'recommended') {
      pool = extensions.filter((e) => e.rating >= 4.85 || e.downloadsCount > 10000000);
    } else {
      pool = [...extensions];
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
        message: `${ext.displayName} is now active in CodeStudio.`,
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
              className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-lg transition cursor-pointer group flex flex-col gap-1.5"
            >
              <div className="flex items-start gap-2.5">
                {/* Icon Box */}
                <div
                  style={{
                    backgroundColor: ext.iconBg || (ext.iconColor ? `${ext.iconColor}20` : '#3b82f620'),
                    borderColor: ext.iconColor || '#3b82f6',
                  }}
                  className="w-8 h-8 rounded-md border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm overflow-hidden"
                >
                  {ext.icon ? (
                    <img src={ext.icon} alt="" className="w-6 h-6 object-contain rounded" />
                  ) : (
                    <span style={{ color: ext.iconColor || '#60a5fa' }}>{ext.displayName.charAt(0)}</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition">
                      {ext.displayName}
                    </h3>
                    {ext.verified && (
                      <span title="Verified Publisher">
                        <Shield className="w-3 h-3 text-blue-400 shrink-0" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug mt-0.5">
                    {ext.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1.5 flex-wrap">
                    <span className="text-cyan-400 font-medium truncate max-w-[90px]">{ext.publisher}</span>
                    <span className="flex items-center gap-0.5">
                      <Download className="w-2.5 h-2.5" /> {ext.downloads}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-2.5 h-2.5 fill-amber-400" /> {ext.rating}
                    </span>
                    {ext.installed && ext.enabled && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 rounded-full border border-emerald-800/50 font-semibold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                    {hasRealEffect(ext) && (
                      <span className="flex items-center gap-0.5 px-1 py-0.5 bg-blue-950/50 text-blue-300 rounded text-[9px] font-mono border border-blue-800/40">
                        <Zap className="w-2 h-2" /> Real Effect
                      </span>
                    )}
                    {ext.source === 'open-vsx' && (
                      <span className="px-1 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[9px] font-mono">
                        Open VSX
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center justify-between pt-1 border-t border-slate-800/50 mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[9px] text-slate-500 font-mono">v{ext.version}</span>

                <div className="flex items-center gap-1.5">
                  {ext.installed ? (
                    <>
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
                            ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {ext.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </>
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
            </div>
          ))
        )}
      </div>

      <ExtensionDetailModal />
    </div>
  );
};
