import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWatchedVideos,
  addWatchedVideo,
  clearWatchedVideos,
  getSavedVideos,
  toggleSavedVideo,
  isSaved,
  clearSavedVideos,
} from '../storage';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('watched videos', () => {
    it('should start with empty watched list', () => {
      expect(getWatchedVideos()).toEqual([]);
    });

    it('should add watched video', () => {
      addWatchedVideo('test-vid-1');
      const watched = getWatchedVideos();
      expect(watched).toHaveLength(1);
      expect(watched[0].vid).toBe('test-vid-1');
    });

    it('should not duplicate watched videos', () => {
      addWatchedVideo('test-vid-1');
      addWatchedVideo('test-vid-1');
      expect(getWatchedVideos()).toHaveLength(1);
    });

    it('should limit watched videos to 100', () => {
      for (let i = 0; i < 105; i++) {
        addWatchedVideo(`vid-${i}`);
      }
      expect(getWatchedVideos()).toHaveLength(100);
    });

    it('should clear watched videos', () => {
      addWatchedVideo('test-vid-1');
      clearWatchedVideos();
      expect(getWatchedVideos()).toEqual([]);
    });
  });

  describe('saved videos', () => {
    it('should start with empty saved list', () => {
      expect(getSavedVideos()).toEqual([]);
    });

    it('should toggle saved video', () => {
      const isSavedNow = toggleSavedVideo('test-vid-1');
      expect(isSavedNow).toBe(true);
      expect(getSavedVideos()).toHaveLength(1);
    });

    it('should remove saved video on second toggle', () => {
      toggleSavedVideo('test-vid-1');
      const isSavedNow = toggleSavedVideo('test-vid-1');
      expect(isSavedNow).toBe(false);
      expect(getSavedVideos()).toEqual([]);
    });

    it('should check if video is saved', () => {
      expect(isSaved('test-vid-1')).toBe(false);
      toggleSavedVideo('test-vid-1');
      expect(isSaved('test-vid-1')).toBe(true);
    });

    it('should clear saved videos', () => {
      toggleSavedVideo('test-vid-1');
      clearSavedVideos();
      expect(getSavedVideos()).toEqual([]);
    });
  });
});
