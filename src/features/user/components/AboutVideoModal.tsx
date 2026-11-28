import React, { useState } from 'react';
import type { AboutVideoData } from '../types/userHome.types';
import { X, Check, Share2, ExternalLink, Heart, ArrowRight } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { ShareModal } from '@/components/common/ShareModal';

export interface AboutVideoModalProps {
  visible: boolean;
  onClose: () => void;
  video: AboutVideoData;
  onOpenAbout?: () => void;
  onOpenDonate?: () => void;
}

export const AboutVideoModal: React.FC<AboutVideoModalProps> = ({
  visible,
  onClose,
  video,
  onOpenAbout,
  onOpenDonate,
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [playerMode, setPlayerMode] = useState<'youtube' | 'direct'>('youtube');

  useLockBodyScroll(visible);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
              {video.badgeLabel || 'Official Video'}
            </span>
            <span className="text-xs text-slate-500 font-medium">{video.releaseYear}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Player Source Selector */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[10.5px] font-bold">
              <button
                type="button"
                onClick={() => setPlayerMode('youtube')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  playerMode === 'youtube'
                    ? 'bg-white text-[#06294D] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                YouTube
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('direct')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  playerMode === 'direct'
                    ? 'bg-white text-[#06294D] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Direct Video
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Share Video"
            >
              <Share2 size={17} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative w-full aspect-video bg-black shrink-0">
          {playerMode === 'youtube' ? (
            <iframe
              src={video.embedUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <video
              src={video.fallbackVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          )}
        </div>

        {/* Scrollable Information Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <h3 id="video-modal-title" className="text-lg sm:text-xl font-bold text-[#06294D]">
              {video.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{video.subtitle}</p>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {video.description}
          </div>

          {/* Highlights Checklist */}
          {video.highlights && video.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#06294D] mb-2">
                Mission Highlights
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {video.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={2.5} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {video.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons in Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900"
          >
            <span>Watch on YouTube</span>
            <ExternalLink size={13} />
          </a>

          {onOpenDonate && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDonate();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#011F39] bg-[#FAD465] hover:bg-[#F59E0B] transition-all cursor-pointer shadow-xs"
            >
              <Heart size={14} className="fill-[#011F39]" />
              <span>Donate</span>
            </button>
          )}

          {onOpenAbout && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAbout();
              }}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#06294D] hover:bg-[#083563] transition-all cursor-pointer"
            >
              <span>Learn More</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={video.title}
        summary={video.subtitle}
        url={video.videoUrl || window.location.href}
        category={video.badgeLabel || 'Official Video'}
      />
    </div>
  );
};

