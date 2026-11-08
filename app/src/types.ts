export interface Video {
  vid: string;
  url: string;
  title: string;
  channel: string;
  summary: string;
  why_hn: string;
  content_type: string;
  level: string;
  shelf_life: string;
  primary_topic: string;
  tags: string[];
  categories: Category[];
  quote: {
    text: string;
    hn_comment_id: number;
    year: string;
  };
  hn: {
    mentions: number;
    recommenders: number;
    rec_months: number;
    strong_recs: number;
    stances: {
      rec?: number;
      strong_rec?: number;
      reference?: number;
      joke?: number;
      critical?: number;
    };
    first_year: number;
    last_year: number;
  };
  score: number;
}

export interface Category {
  id: string;
  name: string;
  area: string;
  area_name: string;
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
