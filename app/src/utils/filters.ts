import type { CatalogVideo } from '../types';
import { compareForFeed } from './ranking';

export interface Filters {
  search: string;
  contentType: string;
  level: string;
  area: string;
  category: string;
  shelfLife: string;
  sortBy: 'featured' | 'score' | 'recent' | 'oldest';
}

export function filterVideos(
  videos: CatalogVideo[],
  filters: Filters,
  summaries?: ReadonlyMap<string, string>,
  options?: { preserveOrder?: boolean },
): CatalogVideo[] {
  let filtered = videos;

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter((video) => (
      video.title.toLowerCase().includes(search) ||
      (summaries?.get(video.vid) ?? '').toLowerCase().includes(search) ||
      video.channel.toLowerCase().includes(search) ||
      video.primary_topic.toLowerCase().includes(search) ||
      video.tags.some((tag) => tag.toLowerCase().includes(search))
    ));
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

  if (options?.preserveOrder) return filtered;

  const sorted = [...filtered];
  switch (filters.sortBy) {
    case 'featured':
      sorted.sort(compareForFeed);
      break;
    case 'score':
      sorted.sort((a, b) => b.score - a.score || b.hn.recommenders - a.hn.recommenders);
      break;
    case 'recent':
      sorted.sort((a, b) => b.hn.last_year - a.hn.last_year || b.hn.recommenders - a.hn.recommenders);
      break;
    case 'oldest':
      sorted.sort((a, b) => a.hn.first_year - b.hn.first_year);
      break;
    default: {
      const unknownSort: never = filters.sortBy;
      throw new Error(`Unknown sort: ${unknownSort}`);
    }
  }

  return sorted;
}
