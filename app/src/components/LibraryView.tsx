import { useRef, useState } from 'react';
import type { CatalogVideo, Playlist } from '../types';
import { VideoCard } from './VideoCard';
import {
  createPlaylist,
  deletePlaylist,
  exportLibrary,
  importLibrary,
  removeVideoFromPlaylist,
  renamePlaylist,
} from '../utils/storage';

interface LibraryViewProps {
  playlist: Playlist | null;
  playlists: Playlist[];
  videos: CatalogVideo[];
  watched: Set<string>;
  onOpenPlaylist: (playlistId: string) => void;
  onPlay: (video: CatalogVideo, queue: string[]) => void;
  onLibraryChange: () => void;
}

export function LibraryView({
  playlist,
  playlists,
  videos,
  watched,
  onOpenPlaylist,
  onPlay,
  onLibraryChange,
}: LibraryViewProps) {
  const importRef = useRef<HTMLInputElement>(null);
  const [draftName, setDraftName] = useState('');

  const downloadLibrary = () => {
    const blob = new Blob([JSON.stringify(exportLibrary(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hn-videos-library.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file: File) => {
    try {
      importLibrary(JSON.parse(await file.text()));
      onLibraryChange();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not import that file');
    }
  };

  if (!playlist) {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Playlists</h2>
          <div className="flex flex-wrap gap-2">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draftName.trim()) return;
                createPlaylist(draftName.trim());
                setDraftName('');
                onLibraryChange();
              }}
            >
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="New playlist"
                aria-label="New playlist name"
                className="h-9 rounded-full border border-[#303030] bg-[#121212] px-4 text-sm outline-none"
              />
              <button type="submit" className="h-9 rounded-full bg-white px-4 text-sm font-medium text-black">
                Create
              </button>
            </form>
            <button type="button" onClick={downloadLibrary} className="h-9 rounded-full bg-[#272727] px-4 text-sm font-medium hover:bg-[#3f3f3f]">
              Export
            </button>
            <button type="button" onClick={() => importRef.current?.click()} className="h-9 rounded-full bg-[#272727] px-4 text-sm font-medium hover:bg-[#3f3f3f]">
              Import
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importFile(file);
                event.target.value = '';
              }}
            />
          </div>
        </div>
        {playlists.length === 0 ? (
          <p className="py-16 text-center text-lg">No playlists yet</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {playlists.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <button type="button" onClick={() => onOpenPlaylist(item.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-medium">{item.name}</span>
                  <span className="text-sm text-[#aaaaaa]">{item.videoIds.length} videos</span>
                </button>
                <button type="button" onClick={() => renameNamedPlaylist(item, onLibraryChange)} className="text-sm text-[#3ea6ff]">
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete “${item.name}”?`)) {
                      deletePlaylist(item.id);
                      onLibraryChange();
                    }
                  }}
                  className="text-sm text-[#aaaaaa]"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{playlist.name}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={videos.length === 0}
            onClick={() => onPlay(videos[0], videos.slice(1).map((video) => video.vid))}
            className="h-9 rounded-full bg-white px-4 text-sm font-medium text-black disabled:opacity-40"
          >
            Play
          </button>
          <button type="button" onClick={() => renameNamedPlaylist(playlist, onLibraryChange)} className="h-9 rounded-full bg-[#272727] px-4 text-sm font-medium hover:bg-[#3f3f3f]">
            Rename
          </button>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm(`Delete “${playlist.name}”?`)) return;
              deletePlaylist(playlist.id);
              onLibraryChange();
              onOpenPlaylist('');
            }}
            className="h-9 rounded-full bg-[#272727] px-4 text-sm font-medium hover:bg-[#3f3f3f]"
          >
            Delete
          </button>
        </div>
      </div>
      {videos.length === 0 ? (
        <p className="py-16 text-center text-lg">This playlist is empty</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {videos.map((video, index) => (
            <div key={video.vid}>
              <VideoCard
                video={video}
                watched={watched.has(video.vid)}
                playlists={playlists}
                onSelect={(selected) => onPlay(selected, videos.slice(index + 1).map((item) => item.vid))}
                onLibraryChange={onLibraryChange}
              />
              <button
                type="button"
                onClick={() => {
                  removeVideoFromPlaylist(playlist.id, video.vid);
                  onLibraryChange();
                }}
                className="mt-2 text-sm text-[#aaaaaa] hover:text-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renameNamedPlaylist(playlist: Playlist, onLibraryChange: () => void) {
  const name = window.prompt('Playlist name', playlist.name);
  if (!name?.trim()) return;
  renamePlaylist(playlist.id, name.trim());
  onLibraryChange();
}
