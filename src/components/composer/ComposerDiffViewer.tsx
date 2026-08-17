import React from 'react';
import { Check, X, FileCode } from 'lucide-react';
import { ComposerFilePatch, useComposerStore } from '../../stores/useComposerStore';


interface ComposerDiffViewerProps {
  patch: ComposerFilePatch;
}

export const ComposerDiffViewer: React.FC<ComposerDiffViewerProps> = ({ patch }) => {
  const { acceptPatch, rejectPatch } = useComposerStore();

  const isAccepted = patch.status === 'accepted';
  const isRejected = patch.status === 'rejected';

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#10111d] shadow-md">
      {/* File Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161726] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono font-semibold text-slate-200">{patch.filePath}</span>
          {isAccepted && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
              Accepted
            </span>
          )}
          {isRejected && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-500/40">
              Rejected
            </span>
          )}
        </div>

        {/* Individual File Actions */}
        {patch.status === 'pending' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => acceptPatch(patch.filePath)}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-semibold transition"
              title="Apply changes to this file"
            >
              <Check className="w-3 h-3" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => rejectPatch(patch.filePath)}
              className="flex items-center gap-1 px-2 py-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md text-[11px] transition"
              title="Reject this file diff"
            >
              <X className="w-3 h-3" />
              <span>Reject</span>
            </button>
          </div>
        )}
      </div>

      {/* Code Preview */}
      <div className="p-3 font-mono text-[11px] max-h-60 overflow-y-auto bg-[#0b0c14] text-slate-300 leading-relaxed whitespace-pre-wrap">
        {patch.newContent}
      </div>
    </div>
  );
};
