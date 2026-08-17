import React from 'react';
import { useUpdateStore } from '../../stores/useUpdateStore';
import { isElectron } from '../../utils/fileUtils';
import {
  Sparkles,
  Download,
  X,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Calendar,
} from 'lucide-react';

export const UpdateModal: React.FC = () => {
  const {
    isModalOpen,
    currentVersion,
    latestVersion,
    releaseTitle,
    releaseNotes,
    publishedAt,
    closeUpdateModal,
    performUpdate,
  } = useUpdateStore();

  if (!isModalOpen || !latestVersion) return null;

  const isDesktop = isElectron();

  return (
    <div
      onClick={closeUpdateModal}
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#181825] border border-blue-500/40 shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-scale-up text-slate-200"
      >
        {/* Top Glowing Header */}
        <div className="relative p-6 bg-gradient-to-br from-blue-900/60 via-indigo-950/40 to-[#181825] border-b border-slate-800">
          <button
            onClick={closeUpdateModal}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/30 border border-blue-500/50 rounded-xl text-blue-400 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-mono rounded-full border border-blue-500/30 uppercase font-semibold">
                Update Available
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                {releaseTitle || `Zenith Studio v${latestVersion}`}
              </h2>

            </div>
          </div>

          {/* Version Transition Pills */}
          <div className="mt-4 flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1 bg-slate-900/80 border border-slate-700/80 rounded-lg text-slate-400">
              Current: <span className="text-white font-bold">v{currentVersion}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/60 rounded-lg text-emerald-300 shadow-sm">
              Latest: <span className="text-emerald-200 font-bold">v{latestVersion}</span>
            </div>
            {publishedAt && (
              <div className="ml-auto text-[11px] text-slate-400 flex items-center gap-1 font-sans">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{publishedAt}</span>
              </div>
            )}
          </div>
        </div>

        {/* Release Notes Body */}
        <div className="p-6 space-y-4 max-h-[320px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              What's New in this Release:
            </span>
            <div className="mt-2 p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {releaseNotes}
            </div>
          </div>

          {/* Zero Data Loss Guarantee Banner */}
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-emerald-300">100% Zero Data Loss Guaranteed</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Updating Zenith Studio will not delete or reset your workspace files, custom settings,

                themes, or open tabs. Everything is safely preserved in your persistent storage.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#14141f] border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={closeUpdateModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            Remind Me Later
          </button>

          <button
            onClick={performUpdate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            {isDesktop ? (
              <>
                <Download className="w-4 h-4" />
                <span>Download & Install v{latestVersion}</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Get Latest Version</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
