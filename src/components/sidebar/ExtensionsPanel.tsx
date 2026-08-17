import React, { useState, useEffect } from 'react';
import {
  Blocks,
  Search,
  Download,
  Star,
  Shield,
  Settings,
  Loader2,
} from 'lucide-react';
import { useExtensionStore } from '../../stores/useExtensionStore';
import { useToastStore } from '../../stores/useToastStore';
import { ExtensionCategory, ExtensionItem } from '../../types/extensions';
import { ExtensionDetailModal } from '../extensions/ExtensionDetailModal';

const CATEGORIES: ExtensionCategory[] = [
  'All',
  'Themes',
  'Programming Languages',
  'Formatters',
  'Linters',
  'Snippets',
  'AI & Productivity',
];

export const ExtensionsPanel: React.FC = () => {
  const {
    extensions,
    activeTab,
    selectedCategory,
    searchQuery,
    isLoadingOnline,
    onlineExtensions,
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
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchOpenVSX]);

  const installedList = extensions.filter((e) => e.installed);
  const installedCount = installedList.length;

  const getFilteredExtensions = () => {
    let list: ExtensionItem[] = [];

    if (activeTab === 'installed') {
      list = installedList;
    } else if (activeTab === 'recommended') {
      list = extensions.filter((e) => e.rating >= 4.9 || e.downloadsCount > 15000000);
    } else {
      // Marketplace: merge local catalogue + online Open VSX results
      list = [...extensions];
      if (onlineExtensions.length > 0) {
        const existingIds = new Set(list.map((e) => e.id));
        onlineExtensions.forEach((online) => {
          if (!existingIds.has(online.id)) {
            list.push(online);
          }
        });
      }
    }

    const q = searchQuery.trim().toLowerCase();
    const cleanQ = q.replace(/[\s\-_]/g, '');

    const matchesQuery = (e: ExtensionItem) => {
      if (!q) return true;
      const dName = e.displayName.toLowerCase();
      const pName = e.publisher.toLowerCase();
      const desc = e.description.toLowerCase();
      const tagStr = e.tags.join(' ').toLowerCase();

      return (
        dName.includes(q) ||
        pName.includes(q) ||
        desc.includes(q) ||
        tagStr.includes(q) ||
        dName.replace(/[\s\-_]/g, '').includes(cleanQ) ||
        tagStr.replace(/[\s\-_]/g, '').includes(cleanQ)
      );
    };

    if (q) {
      const categoryMatches = selectedCategory === 'All' ? list : list.filter((e) => e.category === selectedCategory);
      const queryFiltered = categoryMatches.filter(matchesQuery);

      // Smart fallback: if 0 matches in current category, search across all categories
      if (queryFiltered.length === 0 && selectedCategory !== 'All') {
        return list.filter(matchesQuery);
      }
      return queryFiltered;
    }

    if (selectedCategory !== 'All') {
      list = list.filter((e) => e.category === selectedCategory);
    }

    return list;
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
        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700 text-slate-400">
          {installedCount} installed
        </span>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b border-slate-800 bg-[#181825]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Extensions in Marketplace..."
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
          />
          {isLoadingOnline && (
            <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-cyan-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Tabs Row */}
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

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-slate-500">
            <Blocks className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-400">No extensions found</span>
            <span className="text-[11px] text-slate-500 mt-1">Try another search query or category filter</span>
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
                  className="w-8 h-8 rounded-md border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm"
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
                    <span className="text-cyan-400 font-medium">{ext.publisher}</span>
                    <span className="flex items-center gap-0.5">
                      <Download className="w-2.5 h-2.5" /> {ext.downloads}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-2.5 h-2.5 fill-amber-400" /> {ext.rating}
                    </span>
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
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {ext.enabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => setSelectedExtension(ext)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                        title="Manage Extension Settings"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={installingId === ext.id}
                      onClick={() => handleInstall(ext)}
                      className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-[10px] font-semibold transition flex items-center gap-1 shadow-sm"
                    >
                      {installingId === ext.id ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          <span>Installing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-2.5 h-2.5" />
                          <span>Install</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Extension Details Modal */}
      <ExtensionDetailModal />
    </div>
  );
};
