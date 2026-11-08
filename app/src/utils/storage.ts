import type { LibraryFile, Playlist, SavedVideo, WatchedVideo } from '../types';

const WATCHED_KEY = 'hacknewsviewer_watched';
const SAVED_KEY = 'hacknewsviewer_saved';
const PLAYLISTS_KEY = 'hacknewsviewer_playlists';
const WATCHED_LIMIT = 100;

export function getWatchedVideos(): WatchedVideo[] {
  try {
    const data = localStorage.getItem(WATCHED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addWatchedVideo(vid: string): void {
  try {
    const watched = getWatchedVideos();
    const existing = watched.find((video) => video.vid === vid);
    if (!existing) {
      watched.unshift({ vid, watchedAt: Date.now() });
      if (watched.length > WATCHED_LIMIT) watched.pop();
      localStorage.setItem(WATCHED_KEY, JSON.stringify(watched));
    }
  } catch (error) {
    console.error('Failed to save watched video:', error);
  }
}

export function clearWatchedVideos(): void {
  try {
    localStorage.removeItem(WATCHED_KEY);
  } catch (error) {
    console.error('Failed to clear watched videos:', error);
  }
}

export function getSavedVideos(): SavedVideo[] {
  try {
    const data = localStorage.getItem(SAVED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleSavedVideo(vid: string): boolean {
  try {
    const saved = getSavedVideos();
    const index = saved.findIndex((video) => video.vid === vid);
    if (index >= 0) {
      saved.splice(index, 1);
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
      return false;
    }
    saved.unshift({ vid, savedAt: Date.now() });
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    return true;
  } catch (error) {
    console.error('Failed to toggle saved video:', error);
    return false;
  }
}

export function isSaved(vid: string): boolean {
  return getSavedVideos().some((video) => video.vid === vid);
}

export function clearSavedVideos(): void {
  try {
    localStorage.removeItem(SAVED_KEY);
  } catch (error) {
    console.error('Failed to clear saved videos:', error);
  }
}

export function getPlaylists(): Playlist[] {
  try {
    const data = localStorage.getItem(PLAYLISTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writePlaylists(playlists: Playlist[]): void {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

export function createPlaylist(name: string): Playlist {
  const now = Date.now();
  const playlist: Playlist = {
    id: newPlaylistId(),
    name,
    videoIds: [],
    createdAt: now,
    updatedAt: now,
  };
  writePlaylists([playlist, ...getPlaylists()]);
  return playlist;
}

export function renamePlaylist(id: string, name: string): void {
  writePlaylists(getPlaylists().map((playlist) => (
    playlist.id === id ? { ...playlist, name, updatedAt: Date.now() } : playlist
  )));
}

export function deletePlaylist(id: string): void {
  writePlaylists(getPlaylists().filter((playlist) => playlist.id !== id));
}

export function addVideoToPlaylist(id: string, vid: string): void {
  writePlaylists(getPlaylists().map((playlist) => {
    if (playlist.id !== id || playlist.videoIds.includes(vid)) return playlist;
    return { ...playlist, videoIds: [...playlist.videoIds, vid], updatedAt: Date.now() };
  }));
}

export function removeVideoFromPlaylist(id: string, vid: string): void {
  writePlaylists(getPlaylists().map((playlist) => {
    if (playlist.id !== id) return playlist;
    return {
      ...playlist,
      videoIds: playlist.videoIds.filter((videoId) => videoId !== vid),
      updatedAt: Date.now(),
    };
  }));
}

export function exportLibrary(): LibraryFile {
  return {
    version: 1,
    exportedAt: Date.now(),
    watched: getWatchedVideos(),
    saved: getSavedVideos(),
    playlists: getPlaylists(),
  };
}

export function parseLibraryFile(value: unknown): LibraryFile {
  if (!value || typeof value !== 'object') throw new Error('Library file is not valid');
  const record = value as Record<string, unknown>;
  if (record.version !== 1) throw new Error('Unsupported library file');
  if (!Array.isArray(record.watched) || !Array.isArray(record.saved) || !Array.isArray(record.playlists)) {
    throw new Error('Library file is missing its lists');
  }
  return {
    version: 1,
    exportedAt: typeof record.exportedAt === 'number' ? record.exportedAt : Date.now(),
    watched: record.watched.filter(isWatchedVideo),
    saved: record.saved.filter(isSavedVideo),
    playlists: record.playlists.filter(isPlaylist).map(cleanPlaylist),
  };
}

export function mergeLibrary(current: LibraryFile, incoming: LibraryFile): LibraryFile {
  return {
    version: 1,
    exportedAt: incoming.exportedAt,
    watched: mergeWatched(current.watched, incoming.watched),
    saved: mergeSaved(current.saved, incoming.saved),
    playlists: mergePlaylists(current.playlists, incoming.playlists),
  };
}

export function importLibrary(value: unknown): LibraryFile {
  const incoming = parseLibraryFile(value);
  const merged = mergeLibrary(exportLibrary(), incoming);
  localStorage.setItem(WATCHED_KEY, JSON.stringify(merged.watched));
  localStorage.setItem(SAVED_KEY, JSON.stringify(merged.saved));
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(merged.playlists));
  return merged;
}

function mergeWatched(current: WatchedVideo[], incoming: WatchedVideo[]): WatchedVideo[] {
  const times = new Map<string, number>();
  for (const item of [...current, ...incoming]) {
    const previous = times.get(item.vid);
    if (previous === undefined || item.watchedAt > previous) times.set(item.vid, item.watchedAt);
  }
  return [...times.entries()]
    .map(([vid, watchedAt]) => ({ vid, watchedAt }))
    .sort((a, b) => b.watchedAt - a.watchedAt)
    .slice(0, WATCHED_LIMIT);
}

function mergeSaved(current: SavedVideo[], incoming: SavedVideo[]): SavedVideo[] {
  const times = new Map<string, number>();
  for (const item of [...current, ...incoming]) {
    const previous = times.get(item.vid);
    if (previous === undefined || item.savedAt < previous) times.set(item.vid, item.savedAt);
  }
  return [...times.entries()]
    .map(([vid, savedAt]) => ({ vid, savedAt }))
    .sort((a, b) => b.savedAt - a.savedAt);
}

function mergePlaylists(current: Playlist[], incoming: Playlist[]): Playlist[] {
  const byId = new Map(current.map((playlist) => [playlist.id, { ...playlist, videoIds: [...playlist.videoIds] }]));
  for (const playlist of incoming) {
    const existing = byId.get(playlist.id);
    if (!existing) {
      byId.set(playlist.id, { ...playlist, videoIds: [...playlist.videoIds] });
      continue;
    }
    const seen = new Set(existing.videoIds);
    for (const vid of playlist.videoIds) {
      if (seen.has(vid)) continue;
      existing.videoIds.push(vid);
      seen.add(vid);
    }
    existing.updatedAt = Math.max(existing.updatedAt, playlist.updatedAt);
  }
  return [...byId.values()];
}

function isWatchedVideo(value: unknown): value is WatchedVideo {
  const item = value as WatchedVideo;
  return !!item && typeof item.vid === 'string' && typeof item.watchedAt === 'number';
}

function isSavedVideo(value: unknown): value is SavedVideo {
  const item = value as SavedVideo;
  return !!item && typeof item.vid === 'string' && typeof item.savedAt === 'number';
}

function isPlaylist(value: unknown): value is Playlist {
  const item = value as Playlist;
  return !!item && typeof item.id === 'string' && typeof item.name === 'string' && Array.isArray(item.videoIds);
}

function cleanPlaylist(playlist: Playlist): Playlist {
  const seen = new Set<string>();
  const videoIds = playlist.videoIds.filter((vid) => {
    if (typeof vid !== 'string' || seen.has(vid)) return false;
    seen.add(vid);
    return true;
  });
  return {
    id: playlist.id,
    name: playlist.name,
    videoIds,
    createdAt: typeof playlist.createdAt === 'number' ? playlist.createdAt : Date.now(),
    updatedAt: typeof playlist.updatedAt === 'number' ? playlist.updatedAt : Date.now(),
  };
}

function newPlaylistId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
