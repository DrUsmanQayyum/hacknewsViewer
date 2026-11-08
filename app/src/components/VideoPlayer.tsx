import { useEffect, useState } from 'react';
import type { CatalogVideo, Playlist, VideoDetails } from '../types';
import { categoryName } from '../data/load';
import { addWatchedVideo, isSaved, toggleSavedVideo } from '../utils/storage';
import { ChannelAvatar } from './VideoCard';
import { PlaylistActions } from './PlaylistActions';

interface VideoPlayerProps {
  video: CatalogVideo;
  details: VideoDetails | null;
  upNext: CatalogVideo[];
  similar: CatalogVideo[];
  playlists: Playlist[];
  onBack: () => void;
  onSelect: (video: CatalogVideo) => void;
  onLibraryChange: () => void;
}

export function VideoPlayer({
  video,
  details,
  upNext,
  similar,
  playlists,
  onBack,
  onSelect,
  onLibraryChange,
}: VideoPlayerProps) {
  const [saved, setSaved] = useState(() => isSaved(video.vid));
  const [expanded, setExpanded] = useState(false);
  const [playlistMenu, setPlaylistMenu] = useState(false);

  useEffect(() => {
    addWatchedVideo(video.vid);
    setSaved(isSaved(video.vid));
    setExpanded(false);
    setPlaylistMenu(false);
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
  const discussionUrl = details?.quote?.hn_comment_id
    ? `https://news.ycombinator.com/item?id=${details.quote.hn_comment_id}`
    : `https://hn.algolia.com/?query=${encodeURIComponent(video.vid)}`;
  const summary = details?.summary ?? '';

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
            {upNext[0] && (
              <button
                type="button"
                onClick={() => onSelect(upNext[0])}
                className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-medium text-black"
              >
                Next
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveToggle}
              aria-pressed={saved}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium ${saved ? 'bg-[#f1f1f1] text-black' : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]'}`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setPlaylistMenu((open) => !open)}
                className="inline-flex h-9 items-center rounded-full bg-[#272727] px-4 text-sm font-medium text-[#f1f1f1] hover:bg-[#3f3f3f]"
                aria-expanded={playlistMenu}
              >
                Playlist
              </button>
              {playlistMenu && (
                <div className="absolute right-0 z-20 mt-2 max-h-64 w-56 overflow-y-auto rounded-xl bg-[#282828] py-1.5 shadow-[0_4px_32px_rgba(0,0,0,0.6)]">
                  <PlaylistActions
                    vid={video.vid}
                    playlists={playlists}
                    onChanged={() => {
                      setPlaylistMenu(false);
                      onLibraryChange();
                    }}
                  />
                </div>
              )}
            </div>
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-full bg-[#272727] px-4 text-sm font-medium text-[#f1f1f1] hover:bg-[#3f3f3f]">
              YouTube
            </a>
            <a href={discussionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-full bg-[#272727] px-4 text-sm font-medium text-[#f1f1f1] hover:bg-[#3f3f3f]">
              HN thread
            </a>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-[#272727] px-3 py-3 text-sm">
          <p className="font-medium text-[#f1f1f1]">
            {video.hn.recommenders} recommenders · {video.hn.mentions} mentions · {video.hn.first_year}–{video.hn.last_year}
          </p>
          <p className={`mt-1 whitespace-pre-wrap text-[#f1f1f1] ${expanded ? '' : 'line-clamp-2'}`}>
            {details ? summary : 'Loading description…'}
          </p>
          {expanded && details && (
            <div className="mt-3 space-y-3">
              <p>{details.why_hn}</p>
              {details.quote?.text && (
                <blockquote className="border-l-2 border-[#717171] pl-3 text-[#f1f1f1]">
                  <p className="whitespace-pre-wrap">“{details.quote.text}”</p>
                  <a href={discussionUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[#3ea6ff]">
                    Comment from {details.quote.year}
                  </a>
                </blockquote>
              )}
              <p className="text-[#aaaaaa]">
                {[video.content_type, video.level, ...video.categories.map((category) => categoryName(category.id))].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}
          <button type="button" onClick={() => setExpanded((open) => !open)} className="mt-2 text-sm font-medium">
            {expanded ? '...less' : '...more'}
          </button>
        </div>
      </div>

      <aside className="xl:w-[402px] xl:shrink-0">
        {upNext.length > 0 && (
          <>
            <h2 className="mb-2 text-[16px] font-medium">Up next</h2>
            <SuggestionList videos={upNext} onSelect={onSelect} />
          </>
        )}
        {similar.length > 0 && (
          <>
            <h2 className="mt-6 mb-2 text-[16px] font-medium">More like this</h2>
            <SuggestionList videos={similar} onSelect={onSelect} />
          </>
        )}
      </aside>
    </div>
  );
}

function SuggestionList({ videos, onSelect }: { videos: CatalogVideo[]; onSelect: (video: CatalogVideo) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {videos.map((item) => (
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
  );
}
