import React from 'react';
import { Download, Music, Video } from 'lucide-react';

interface MediaPreviewProps {
  src: string;
  fileName: string;
  kind: 'audio' | 'video';
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ src, fileName, kind }) => {
  const download = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden text-slate-200">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#181825]">
        <div className="flex items-center gap-2 text-xs font-semibold">
          {kind === 'audio' ? <Music className="w-4 h-4 text-emerald-400" /> : <Video className="w-4 h-4 text-pink-400" />}
          <span>{kind === 'audio' ? 'Audio' : 'Video'} Preview</span>
        </div>
        <button onClick={download} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0d0e15]">
        {kind === 'audio' ? (
          <audio src={src} controls className="w-full max-w-xl" />
        ) : (
          <video src={src} controls className="max-w-full max-h-full rounded-lg shadow-2xl" />
        )}
      </div>
    </div>
  );
};