import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { CatalogVideo, Playlist } from '../types';
import { isSaved, toggleSavedVideo } from '../utils/storage';
import { PlaylistActions } from './PlaylistActions';

interface VideoCardProps {
  video: CatalogVideo;
  watched?: boolean;
  priority?: boolean;
  playlists?: Playlist[];
  onSelect: (video: CatalogVideo) => void;
  onLibraryChange?: () => void;
}

export function VideoCard({
  video,
  watched = false,
  priority = false,
  playlists = [],
  onSelect,
  onLibraryChange,
}: VideoCardProps) {
  const [saved, setSaved] = useState(isSaved(video.vid));
  const [menuOpen, setMenuOpen] = useState(false);
  const thumbnailUrl = `https://i.ytimg.com/vi/${video.vid}/hq2.jpg`;

  const handleSaveToggle = (event: MouseEvent) => {
    event.stopPropagation();
    setSaved(toggleSavedVideo(video.vid));
    setMenuOpen(false);
    onLibraryChange?.();
  };

  return (
    <article>
      <button type="button" onClick={() => onSelect(video)} className="group block w-full text-left" aria-label={video.title}>
        <span className="relative block aspect-video overflow-hidden rounded-xl bg-[#202020]">
          <img
            src={thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            onError={(event) => {
              const image = event.currentTarget;
              if (image.dataset.fallback === '1') return;
              image.dataset.fallback = '1';
              image.src = `https://i.ytimg.com/vi/${video.vid}/hqdefault.jpg`;
            }}
          />
          <PlayOverlay />
          {watched && <span className="absolute inset-x-0 bottom-0 h-1 bg-[#ff0000]" />}
        </span>
      </button>

      <div className="mt-3 flex gap-3">
        <button type="button" onClick={() => onSelect(video)} className="flex min-w-0 flex-1 gap-3 text-left">
          <ChannelAvatar name={video.channel} size="sm" />
          <span className="min-w-0">
            <span className="line-clamp-2 block text-[16px] leading-[22px] font-medium text-[#f1f1f1]">
              {video.title}
            </span>
            <span className="mt-1 block truncate text-[14px] leading-5 text-[#aaaaaa]">
              {video.channel || 'Unknown channel'}
            </span>
            <span className="block truncate text-[14px] leading-5 text-[#aaaaaa]">
              {formatCount(video.hn.recommenders)} recommendations · {video.hn.last_year}
            </span>
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-8 w-8 place-items-center rounded-full text-[#f1f1f1] hover:bg-white/10"
            aria-label="More actions"
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 w-48 overflow-hidden rounded-xl bg-[#282828] py-1.5 shadow-[0_4px_32px_rgba(0,0,0,0.6)]">
              <button
                type="button"
                onClick={handleSaveToggle}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-white/10"
              >
                {saved ? 'Remove from Saved' : 'Save to Saved'}
              </button>
              <PlaylistActions
                vid={video.vid}
                playlists={playlists}
                onChanged={() => {
                  setMenuOpen(false);
                  onLibraryChange?.();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function PlayOverlay({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const button = size === 'sm' ? 'h-8 w-8' : 'h-[22%] min-h-11 max-h-16 aspect-square';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-[46%] w-[46%]';

  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
      <span
        className={`grid place-items-center rounded-full bg-black/75 shadow-[0_2px_12px_rgba(0,0,0,0.55)] ring-2 ring-white/90 transition duration-150 group-hover:scale-110 group-hover:bg-black/90 ${button}`}
      >
        <svg viewBox="0 0 24 24" className={`ml-0.5 fill-white ${icon}`}>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}

export function ChannelAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initial = (name.trim()[0] || '?').toUpperCase();
  const dim = size === 'sm' ? 'h-9 w-9 text-sm' : 'h-10 w-10 text-base';

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-medium text-white ${dim}`}
      style={{ backgroundColor: channelColor(name) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function channelColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360} 52% 42%)`;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('en', { notation: value >= 10000 ? 'compact' : 'standard' }).format(value);
}
