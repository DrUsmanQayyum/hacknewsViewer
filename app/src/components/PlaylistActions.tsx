import type { Playlist } from '../types';
import { addVideoToPlaylist, createPlaylist, removeVideoFromPlaylist } from '../utils/storage';

interface PlaylistActionsProps {
  vid: string;
  playlists: Playlist[];
  onChanged: () => void;
}

export function PlaylistActions({ vid, playlists, onChanged }: PlaylistActionsProps) {
  return (
    <>
      {playlists.map((playlist) => {
        const included = playlist.videoIds.includes(vid);
        return (
          <button
            key={playlist.id}
            type="button"
            className="block w-full truncate px-4 py-2 text-left text-sm hover:bg-white/10"
            onClick={() => {
              if (included) removeVideoFromPlaylist(playlist.id, vid);
              else addVideoToPlaylist(playlist.id, vid);
              onChanged();
            }}
          >
            {included ? 'Remove from' : 'Add to'} {playlist.name}
          </button>
        );
      })}
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-sm hover:bg-white/10"
        onClick={() => {
          const name = window.prompt('Playlist name');
          if (!name?.trim()) return;
          const playlist = createPlaylist(name.trim());
          addVideoToPlaylist(playlist.id, vid);
          onChanged();
        }}
      >
        New playlist
      </button>
    </>
  );
}
