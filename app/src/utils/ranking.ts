import type { CatalogVideo } from '../types';

const allowedCategoryIds = new Set([
  'machine-learning',
  'llms-generative-ai',
  'robotics',
  'security-hacking',
  'cryptography',
]);

const excludedCategoryIds = new Set([
  'satire-parody',
  'standup-sketch-comedy',
  'film-tv-clips',
]);

export function isAiVideo(video: CatalogVideo): boolean {
  const categoryIds = video.categories.map((category) => category.id);
  if (categoryIds.some((id) => excludedCategoryIds.has(id))) return false;
  if (categoryIds.some((id) => allowedCategoryIds.has(id))) return true;
  if (!categoryIds.includes('self-driving-cars')) return false;
  const aboutCities = categoryIds.includes('transit-urbanism');
  const aboutMedia = categoryIds.includes('media-journalism');
  return !aboutCities && !aboutMedia;
}

export function compareForFeed(a: CatalogVideo, b: CatalogVideo): number {
  const byYear = b.hn.last_year - a.hn.last_year;
  if (byYear !== 0) return byYear;
  const byViews = b.hn.recommenders - a.hn.recommenders;
  if (byViews !== 0) return byViews;
  const byScore = b.score - a.score;
  if (byScore !== 0) return byScore;
  if (a.vid < b.vid) return -1;
  if (a.vid > b.vid) return 1;
  return 0;
}
