import React, { useState } from 'react';
import { X, Download, Star, Shield, Power, Trash2, Tag, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useExtensionStore } from '../../stores/useExtensionStore';
import { useToastStore } from '../../stores/useToastStore';

export const ExtensionDetailModal: React.FC = () => {
  const { selectedExtension, setSelectedExtension, installExtension, uninstallExtension, toggleExtension } = useExtensionStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'features'>('overview');

  if (!selectedExtension) return null;

  const ext = selectedExtension;

  return (
    <div
      onClick={() => setSelectedExtension(null)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] bg-[#181825] border border-slate-700 shadow-2xl rounded-xl flex flex-col overflow-hidden text-slate-200 font-sans animate-fade-in-up"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#1e1e2e] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              style={{ backgroundColor: ext.iconBg || (ext.iconColor ? `${ext.iconColor}20` : '#3b82f620'), borderColor: ext.iconColor || '#3b82f6' }}
              className="w-14 h-14 rounded-xl border flex items-center justify-center text-xl font-bold shrink-0 shadow-md"
            >
              {ext.icon ? (
                <img src={ext.icon} alt={ext.displayName} className="w-10 h-10 object-contain rounded" />
              ) : (
                <span style={{ color: ext.iconColor || '#60a5fa' }}>{ext.displayName.charAt(0)}</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">{ext.displayName}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">
                  v{ext.version}
                </span>
                {ext.verified && (
                  <span className="flex items-center gap-1 text-[10px] bg-blue-950/60 text-blue-300 border border-blue-800/60 rounded px-1.5 py-0.5">
                    <Shield className="w-3 h-3 text-blue-400" /> Verified
                  </span>
                )}
                {ext.source === 'builtin' && (
                  <span className="text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 rounded px-1.5 py-0.5">
                    Built-in
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="text-cyan-400 font-medium">{ext.publisher}</span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3 text-slate-500" /> {ext.downloads} installs
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" /> {ext.rating} ({ext.reviewsCount})
                </span>
                <span className="px-2 py-0.5 bg-slate-800/80 rounded-full text-[10px] border border-slate-700/60">
                  {ext.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">{ext.description}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedExtension(null)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button Row & Navigation Tabs */}
        <div className="px-5 py-2.5 bg-[#14141f] border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 text-xs font-semibold rounded transition ${
                activeTab === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1 text-xs font-semibold rounded transition ${
                activeTab === 'features' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Details & Tags
            </button>
          </div>

          <div className="flex items-center gap-2">
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
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition border ${
                    ext.enabled
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
                      : 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-700 text-emerald-300'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{ext.enabled ? 'Disable' : 'Enable'}</span>
                </button>

                <button
                  onClick={() => {
                    uninstallExtension(ext.id);
                    addToast({
                      type: 'warning',
                      title: 'Extension Uninstalled',
                      message: `${ext.displayName} was removed.`,
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded text-xs font-medium transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Uninstall</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  installExtension(ext.id);
                  addToast({
                    type: 'success',
                    title: 'Extension Installed',
                    message: `${ext.displayName} is installed and active.`,
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-md shadow-blue-600/30 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="markdown-body space-y-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {ext.readme}
              </ReactMarkdown>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="font-semibold text-white uppercase tracking-wider text-[11px]">Tags & Categories</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ext.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[10px] flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {ext.themeData && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Monaco Theme Palette</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(ext.themeData.colors).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span style={{ backgroundColor: val }} className="w-3 h-3 rounded-full border border-slate-700" />
                        <span className="text-slate-400 font-mono">{key}:</span>
                        <span className="text-slate-200 font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ext.snippetsData && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                  <span className="font-semibold text-white uppercase tracking-wider text-[11px]">Contributed Code Snippets</span>
                  <div className="space-y-1.5">
                    {ext.snippetsData.map((snip) => (
                      <div key={snip.label} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-mono text-cyan-300 font-semibold">{snip.prefix}</span>
                          <span className="text-slate-400 ml-2">{snip.description}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{snip.language}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
