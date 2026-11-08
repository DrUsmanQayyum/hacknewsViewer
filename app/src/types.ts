export interface CatalogCategory {
  id: string;
  area: string;
}

export interface CatalogVideo {
  vid: string;
  url: string;
  title: string;
  channel: string;
  content_type: string;
  level: string;
  shelf_life: string;
  primary_topic: string;
  tags: string[];
  categories: CatalogCategory[];
  hn: {
    mentions: number;
    recommenders: number;
    rec_months: number;
    strong_recs: number;
    first_year: number;
    last_year: number;
  };
  score: number;
}

export interface VideoQuote {
  text: string;
  hn_comment_id: number;
  year: string;
}

export interface VideoDetails {
  summary: string;
  why_hn: string;
  quote: VideoQuote | null;
  stances: {
    rec?: number;
    strong_rec?: number;
    reference?: number;
    joke?: number;
    critical?: number;
  };
}

export interface Taxonomy {
  version: string;
  areas: Area[];
}

export interface Area {
  id: string;
  name: string;
  categories: TaxonomyCategory[];
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  description: string;
}

export interface WatchedVideo {
  vid: string;
  watchedAt: number;
}

export interface SavedVideo {
  vid: string;
  savedAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  videoIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface LibraryFile {
  version: 1;
  exportedAt: number;
  watched: WatchedVideo[];
  saved: SavedVideo[];
  playlists: Playlist[];
}
