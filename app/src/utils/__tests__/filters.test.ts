import { describe, it, expect } from 'vitest';
import { filterVideos } from '../filters';
import type { Video } from '../../types';
import type { Filters } from '../filters';

const mockVideos: Video[] = [
  {
    vid: 'vid1',
    url: 'https://youtube.com/watch?v=vid1',
    title: 'Introduction to Machine Learning',
    channel: 'AI Academy',
    summary: 'A beginner-friendly introduction to ML concepts',
    why_hn: 'Great introduction',
    content_type: 'course',
    level: 'intro',
    shelf_life: 'evergreen',
    primary_topic: 'machine learning',
    tags: ['ml', 'intro', 'tutorial'],
    categories: [{ id: 'machine-learning', name: 'Machine Learning', area: 'ai', area_name: 'AI' }],
    quote: { text: 'Great video', hn_comment_id: 1, year: '2020' },
    hn: {
      mentions: 10,
      recommenders: 8,
      rec_months: 5,
      strong_recs: 3,
      stances: { rec: 5, strong_rec: 3 },
      first_year: 2020,
      last_year: 2023,
    },
    score: 10.0,
  },
  {
    vid: 'vid2',
    url: 'https://youtube.com/watch?v=vid2',
    title: 'Advanced Deep Learning',
    channel: 'Tech Talks',
    summary: 'Advanced concepts in deep learning',
    why_hn: 'Very technical',
    content_type: 'talk',
    level: 'advanced',
    shelf_life: 'evergreen',
    primary_topic: 'deep learning',
    tags: ['deep learning', 'advanced'],
    categories: [{ id: 'deep-learning', name: 'Deep Learning', area: 'ai', area_name: 'AI' }],
    quote: { text: 'Amazing talk', hn_comment_id: 2, year: '2021' },
    hn: {
      mentions: 20,
      recommenders: 15,
      rec_months: 10,
      strong_recs: 8,
      stances: { rec: 10, strong_rec: 8 },
      first_year: 2019,
      last_year: 2024,
    },
    score: 20.0,
  },
  {
    vid: 'vid3',
    url: 'https://youtube.com/watch?v=vid3',
    title: 'Latest AI News',
    channel: 'News Channel',
    summary: 'Recent developments in AI',
    why_hn: 'Timely news',
    content_type: 'news',
    level: 'intermediate',
    shelf_life: 'news',
    primary_topic: 'ai news',
    tags: ['news', 'ai'],
    categories: [{ id: 'ai-news', name: 'AI News', area: 'news', area_name: 'News' }],
    quote: { text: 'Interesting', hn_comment_id: 3, year: '2024' },
    hn: {
      mentions: 5,
      recommenders: 4,
      rec_months: 2,
      strong_recs: 1,
      stances: { rec: 3, strong_rec: 1 },
      first_year: 2024,
      last_year: 2024,
    },
    score: 5.0,
  },
];

const defaultFilters: Filters = {
  search: '',
  contentType: 'all',
  level: 'all',
  area: 'all',
  category: 'all',
  shelfLife: 'all',
  sortBy: 'score',
};

describe('filterVideos', () => {
  it('should return all videos with default filters', () => {
    const result = filterVideos(mockVideos, defaultFilters);
    expect(result).toHaveLength(3);
  });

  it('should filter by search term in title', () => {
    const filters = { ...defaultFilters, search: 'deep learning' };
    const result = filterVideos(mockVideos, filters);
    expect(result).toHaveLength(1);
    expect(result[0].vid).toBe('vid2');
  });

  it('should filter by content type', () => {
    const filters = { ...defaultFilters, contentType: 'course' };
    const result = filterVideos(mockVideos, filters);
    expect(result).toHaveLength(1);
    expect(result[0].vid).toBe('vid1');
  });

  it('should filter by level', () => {
    const filters = { ...defaultFilters, level: 'advanced' };
    const result = filterVideos(mockVideos, filters);
    expect(result).toHaveLength(1);
    expect(result[0].vid).toBe('vid2');
  });

  it('should filter by area', () => {
    const filters = { ...defaultFilters, area: 'ai' };
    const result = filterVideos(mockVideos, filters);
    expect(result).toHaveLength(2);
  });

  it('should filter by shelf life (evergreen)', () => {
    const filters = { ...defaultFilters, shelfLife: 'evergreen' };
    const result = filterVideos(mockVideos, filters);
    expect(result).toHaveLength(2);
  });

  it('should filter by shelf life (news)', () => {
    const filters = { ...defaultFilters, shelfLife: 'news' };
    const result = filterVideos(mockVideos, filters);
    expect(result).toHaveLength(1);
    expect(result[0].vid).toBe('vid3');
  });

  it('should sort by score (default)', () => {
    const result = filterVideos(mockVideos, defaultFilters);
    expect(result[0].vid).toBe('vid2');
    expect(result[1].vid).toBe('vid1');
    expect(result[2].vid).toBe('vid3');
  });

  it('should sort by recent', () => {
    const filters = { ...defaultFilters, sortBy: 'recent' as const };
    const result = filterVideos(mockVideos, filters);
    // vid2 and vid3 both have last_year 2024, vid2 has higher score so comes first
    expect(result[0].hn.last_year).toBeGreaterThanOrEqual(result[1].hn.last_year);
    expect(result[1].hn.last_year).toBeGreaterThanOrEqual(result[2].hn.last_year);
  });

  it('should sort by oldest', () => {
    const filters = { ...defaultFilters, sortBy: 'oldest' as const };
    const result = filterVideos(mockVideos, filters);
    expect(result[0].vid).toBe('vid2');
    expect(result[2].vid).toBe('vid3');
  });

  it('should combine multiple filters', () => {
    const filters = {
      ...defaultFilters,
      search: 'learning',
      level: 'intro',
      contentType: 'course',
    };
    const result = filterVideos(mockVideos, filters);
    expect(result).toHaveLength(1);
    expect(result[0].vid).toBe('vid1');
  });
});
