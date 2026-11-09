import type { CatalogVideo, Taxonomy, VideoDetails } from '../types';
import { isAiVideo } from '../utils/ranking';
import catalogData from './catalog.json';
import taxonomyData from './taxonomy.json';

export const catalog = (catalogData as CatalogVideo[]).filter(isAiVideo);
export const taxonomy = taxonomyData as Taxonomy;

export const catalogById = new Map(catalog.map((video) => [video.vid, video]));

let detailsPromise: Promise<Record<string, VideoDetails>> | null = null;
let graphsPromise: Promise<{ related: Record<string, string[]>; similar: Record<string, string[]> }> | null = null;

export function loadDetails(): Promise<Record<string, VideoDetails>> {
  detailsPromise ??= import('./details.json').then((module) => module.default as Record<string, VideoDetails>);
  return detailsPromise;
}

export function loadGraphs(): Promise<{ related: Record<string, string[]>; similar: Record<string, string[]> }> {
  graphsPromise ??= Promise.all([import('./related.json'), import('./similar.json')]).then(([related, similar]) => ({
    related: related.default as Record<string, string[]>,
    similar: similar.default as Record<string, string[]>,
  }));
  return graphsPromise;
}

export function categoryName(categoryId: string, source: Taxonomy = taxonomy): string {
  for (const area of source.areas) {
    const match = area.categories.find((category) => category.id === categoryId);
    if (match) return match.name;
  }
  return categoryId;
}
