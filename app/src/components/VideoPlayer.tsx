import { useEffect, useState } from 'react';
import type { Video } from '../types';
import { addWatchedVideo, isSaved, toggleSavedVideo } from '../utils/storage';
import { ChannelAvatar } from './VideoCard';

interface VideoPlayerProps {
  video: Video;
  related: Video[];
  onBack: () => void;
  onSelect: (video: Video) => void;
  onLibraryChange: () => void;
}

export function VideoPlayer({ video, related, onBack, onSelect, onLibraryChange }: VideoPlayerProps) {
  const [saved, setSaved] = useState(() => isSaved(video.vid));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    addWatchedVideo(video.vid);
    setSaved(isSaved(video.vid));
    setExpanded(false);
    onLibraryChange();
    document.title = `${video.title} - HN Videos`;

    return () => {
      document.title = 'HN Videos';
    };
  }, [video.vid, video.title, onLibraryChange]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onBack();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onBack]);

  const handleSaveToggle = () => {
    setSaved(toggleSavedVideo(video.vid));
    onLibraryChange();
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.vid}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const discussionUrl = video.quote?.hn_comment_id
    ? `https://news.ycombinator.com/item?id=${video.quote.hn_comment_id}`
    : `https://hn.algolia.com/?query=${encodeURIComponent(video.vid)}`;

  return (
    <div className="mx-auto flex w-full max-w-[1750px] flex-col gap-6 px-4 pt-6 pb-10 xl:flex-row xl:px-6">
      <div className="min-w-0 flex-1">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          <iframe
            key={video.vid}
            src={embedUrl}
            className="absolute inset-0 h-full w-full border-0"
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <h1 className="mt-3 text-[20px] leading-7 font-bold text-[#f1f1f1]">{video.title}</h1>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <ChannelAvatar name={video.channel} />
            <div className="min-w-0">
              <p className="truncate text-[16px] font-medium text-[#f1f1f1]">{video.channel || 'Unknown channel'}</p>
              <p className="truncate text-[12px] text-[#aaaaaa]">{video.primary_topic}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToggle}
              aria-pressed={saved}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium ${saved ? 'bg-[#f1f1f1] text-black' : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]'}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinejoin="round" d="M6 4.5h12a1 1 0 0 1 1 1V20l-7-3.5L5 20V5.5a1 1 0 0 1 1-1z" />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-full bg-[#272727] px-4 text-sm font-medium text-[#f1f1f1] hover:bg-[#3f3f3f]"
            >
              YouTube
            </a>
            <a
              href={discussionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-full bg-[#272727] px-4 text-sm font-medium text-[#f1f1f1] hover:bg-[#3f3f3f]"
            >
              HN thread
            </a>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-[#272727] px-3 py-3 text-sm">
          <p className="font-medium text-[#f1f1f1]">
            {video.hn.recommenders} recommenders · {video.hn.mentions} mentions · {video.hn.first_year}–{video.hn.last_year}
          </p>
          <p className={`mt-1 whitespace-pre-wrap text-[#f1f1f1] ${expanded ? '' : 'line-clamp-2'}`}>{video.summary}</p>
          {expanded && (
            <div className="mt-3 space-y-3">
              <p>{video.why_hn}</p>
              {video.quote?.text && (
                <blockquote className="border-l-2 border-[#717171] pl-3 text-[#f1f1f1]">
                  <p className="whitespace-pre-wrap">“{video.quote.text}”</p>
                  <a href={discussionUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[#3ea6ff]">
                    Comment from {video.quote.year}
                  </a>
                </blockquote>
              )}
              <p className="text-[#aaaaaa]">
                {[video.content_type, video.level, ...video.categories.map((category) => category.name)].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}
          <button type="button" onClick={() => setExpanded((open) => !open)} className="mt-2 text-sm font-medium">
            {expanded ? '...less' : '...more'}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <aside className="xl:w-[402px] xl:shrink-0">
          <h2 className="mb-2 text-[16px] font-medium">Up next</h2>
          <div className="flex flex-col gap-2">
            {related.map((item) => (
              <button
                key={item.vid}
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full gap-2 rounded-lg p-1 text-left hover:bg-white/[0.06]"
              >
                <span className="relative aspect-video w-[168px] shrink-0 overflow-hidden rounded-lg bg-[#202020]">
                  <img
                    src={`https://i.ytimg.com/vi/${item.vid}/mqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
                <span className="min-w-0 py-0.5">
                  <span className="line-clamp-2 text-[14px] leading-5 font-medium text-[#f1f1f1]">{item.title}</span>
                  <span className="mt-1 block truncate text-[12px] text-[#aaaaaa]">{item.channel}</span>
                  <span className="block truncate text-[12px] text-[#aaaaaa]">{item.hn.recommenders} recommendations</span>
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
