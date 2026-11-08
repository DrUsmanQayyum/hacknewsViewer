import type { WatchedVideo, SavedVideo } from '../types';

const WATCHED_KEY = 'hacknewsviewer_watched';
const SAVED_KEY = 'hacknewsviewer_saved';

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
    const existing = watched.find(v => v.vid === vid);
    
    if (!existing) {
      watched.unshift({ vid, watchedAt: Date.now() });
      // Keep only last 100 watched videos
      if (watched.length > 100) {
        watched.pop();
      }
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
    const index = saved.findIndex(v => v.vid === vid);
    
    if (index >= 0) {
      saved.splice(index, 1);
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
      return false;
    } else {
      saved.unshift({ vid, savedAt: Date.now() });
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
      return true;
    }
  } catch (error) {
    console.error('Failed to toggle saved video:', error);
    return false;
  }
}

export function isSaved(vid: string): boolean {
  const saved = getSavedVideos();
  return saved.some(v => v.vid === vid);
}

export function clearSavedVideos(): void {
  try {
    localStorage.removeItem(SAVED_KEY);
  } catch (error) {
    console.error('Failed to clear saved videos:', error);
  }
}
