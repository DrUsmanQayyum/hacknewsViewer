import { describe, expect, it } from 'vitest';
import type { CatalogVideo } from '../../types';
import { similarVideos, upNextVideos } from '../related';

const video = (vid: string, topic: string, score: number): CatalogVideo => ({
  vid,
  url: `https://youtube.com/watch?v=${vid}`,
  title: vid,
  channel: 'Channel',
  content_type: 'talk',
  level: 'intro',
  shelf_life: 'evergreen',
  primary_topic: topic,
  tags: [],
  categories: [],
  hn: { mentions: 1, recommenders: 1, rec_months: 1, strong_recs: 0, first_year: 2020, last_year: 2024 },
  score,
});

const catalog = [video('current', 'ml', 5), video('graph', 'other', 1), video('topic', 'ml', 9), video('similar', 'other', 2)];

describe('related videos', () => {
  it('should prefer co-recommended ids and fill with the same topic', () => {
    const next = upNextVideos(catalog[0], catalog, ['graph', 'missing']);
    expect(next.map((item) => item.vid)).toEqual(['graph', 'topic']);
  });

  it('should keep similar videos that are still in the catalog', () => {
    expect(similarVideos(catalog, ['missing', 'similar']).map((item) => item.vid)).toEqual(['similar']);
  });
});
