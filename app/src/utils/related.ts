import type { CatalogVideo } from '../types';

export function upNextVideos(
  current: CatalogVideo,
  catalog: CatalogVideo[],
  relatedIds: readonly string[] | undefined,
  limit = 20,
): CatalogVideo[] {
  const byId = new Map(catalog.map((video) => [video.vid, video]));
  const picked: CatalogVideo[] = [];
  const seen = new Set<string>([current.vid]);

  for (const vid of relatedIds ?? []) {
    const video = byId.get(vid);
    if (!video || seen.has(video.vid)) continue;
    picked.push(video);
    seen.add(video.vid);
    if (picked.length >= limit) return picked;
  }

  const filler = catalog
    .filter((video) => video.primary_topic === current.primary_topic && !seen.has(video.vid))
    .sort((a, b) => b.score - a.score);
  for (const video of filler) {
    picked.push(video);
    if (picked.length >= limit) break;
  }
  return picked;
}

export function similarVideos(
  catalog: CatalogVideo[],
  similarIds: readonly string[] | undefined,
  limit = 8,
): CatalogVideo[] {
  const byId = new Map(catalog.map((video) => [video.vid, video]));
  const picked: CatalogVideo[] = [];
  for (const vid of similarIds ?? []) {
    const video = byId.get(vid);
    if (!video) continue;
    picked.push(video);
    if (picked.length >= limit) break;
  }
  return picked;
}
