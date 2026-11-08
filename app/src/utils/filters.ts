import type { Video } from '../types';

export interface Filters {
  search: string;
  contentType: string;
  level: string;
  area: string;
  category: string;
  shelfLife: string;
  sortBy: 'score' | 'recent' | 'oldest';
}

export function filterVideos(videos: Video[], filters: Filters): Video[] {
  let filtered = videos;

  // Search filter
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(v => 
      v.title.toLowerCase().includes(search) ||
      v.summary.toLowerCase().includes(search) ||
      v.channel.toLowerCase().includes(search) ||
      v.primary_topic.toLowerCase().includes(search) ||
      v.tags.some(t => t.toLowerCase().includes(search))
    );
  }

  // Content type filter
  if (filters.contentType && filters.contentType !== 'all') {
    filtered = filtered.filter(v => v.content_type === filters.contentType);
  }

  // Level filter
  if (filters.level && filters.level !== 'all') {
    filtered = filtered.filter(v => v.level === filters.level);
  }

  // Area filter
  if (filters.area && filters.area !== 'all') {
    filtered = filtered.filter(v => 
      v.categories.some(c => c.area === filters.area)
    );
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(v => 
      v.categories.some(c => c.id === filters.category)
    );
  }

  // Shelf life filter (default: exclude news unless explicitly shown)
  if (filters.shelfLife === 'evergreen') {
    filtered = filtered.filter(v => v.shelf_life === 'evergreen');
  } else if (filters.shelfLife === 'news') {
    filtered = filtered.filter(v => v.shelf_life === 'news');
  }

  // Sort
  const sorted = [...filtered];
  switch (filters.sortBy) {
    case 'score':
      sorted.sort((a, b) => b.score - a.score);
      break;
    case 'recent':
      sorted.sort((a, b) => b.hn.last_year - a.hn.last_year);
      break;
    case 'oldest':
      sorted.sort((a, b) => a.hn.first_year - b.hn.first_year);
      break;
  }

  return sorted;
}
