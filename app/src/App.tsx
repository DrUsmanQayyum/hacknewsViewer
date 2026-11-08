import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Video, Taxonomy } from './types';
import type { Filters } from './utils/filters';
import { filterVideos } from './utils/filters';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { VideoCard } from './components/VideoCard';
import { VideoPlayer } from './components/VideoPlayer';
import { getWatchedVideos, getSavedVideos, clearWatchedVideos, clearSavedVideos } from './utils/storage';
import videosData from './data/videos.json';
import taxonomyData from './data/taxonomy.json';

const videos: Video[] = videosData as Video[];
const taxonomy: Taxonomy = taxonomyData as Taxonomy;
const PAGE_SIZE = 24;

const defaultFilters: Filters = {
  search: '',
  contentType: 'all',
  level: 'all',
  area: 'all',
  category: 'all',
  shelfLife: 'all',
  sortBy: 'score',
};

const contentTypes = [
  { id: 'all', label: 'All' },
  { id: 'talk', label: 'Talks' },
  { id: 'course', label: 'Courses' },
  { id: 'tutorial', label: 'Tutorials' },
  { id: 'demo', label: 'Demos' },
  { id: 'interview', label: 'Interviews' },
  { id: 'documentary', label: 'Documentaries' },
] as const;

type View = 'browse' | 'watched' | 'saved';

function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [view, setView] = useState<View>('browse');
  const [showFilters, setShowFilters] = useState(false);
  const [libraryTick, setLibraryTick] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const bumpLibrary = useCallback(() => {
    setLibraryTick((tick) => tick + 1);
  }, []);

  const handleSearch = useCallback((search: string) => {
    setFilters((current) => (current.search === search ? current : { ...current, search }));
  }, []);

  const openView = useCallback((next: View) => {
    setSelectedVideo(null);
    setView(next);
    window.scrollTo(0, 0);
  }, []);

  const watchedVids = useMemo(() => {
    return new Set(getWatchedVideos().map((entry) => entry.vid));
  }, [libraryTick]);

  const savedVids = useMemo(() => {
    return new Set(getSavedVideos().map((entry) => entry.vid));
  }, [libraryTick]);

  const displayedVideos = useMemo(() => {
    let baseVideos = videos;

    if (view === 'watched') {
      baseVideos = getWatchedVideos()
        .map((entry) => videos.find((video) => video.vid === entry.vid))
        .filter((video): video is Video => video !== undefined);
    } else if (view === 'saved') {
      baseVideos = getSavedVideos()
        .map((entry) => videos.find((video) => video.vid === entry.vid))
        .filter((video): video is Video => video !== undefined);
    }

    return filterVideos(baseVideos, filters);
  }, [filters, view, libraryTick]);

  const related = useMemo(() => {
    if (!selectedVideo) return [];
    return pickRelated(selectedVideo, displayedVideos, videos);
  }, [selectedVideo, displayedVideos]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, view]);

  const visibleVideos = displayedVideos.slice(0, visibleCount);
  const hasMore = visibleVideos.length < displayedVideos.length;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisibleCount((count) => count + PAGE_SIZE);
      }
    }, { rootMargin: '800px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  const extraFiltersActive = filters.level !== 'all'
    || filters.area !== 'all'
    || filters.category !== 'all'
    || filters.shelfLife !== 'all'
    || filters.sortBy !== 'score';

  const handleClearLibrary = () => {
    if (view === 'watched' && confirm('Clear all watch history?')) {
      clearWatchedVideos();
      bumpLibrary();
      setView('browse');
    } else if (view === 'saved' && confirm('Clear all saved videos?')) {
      clearSavedVideos();
      bumpLibrary();
      setView('browse');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1]">
      <header className="sticky top-0 z-50 bg-[#0f0f0f]">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => openView('browse')}
            className="flex shrink-0 items-center gap-2"
            aria-label="HN Videos home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#ff0000]">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="hidden text-lg font-medium tracking-tight sm:block">HN Videos</span>
          </button>

          <div className="mx-auto hidden w-full max-w-[640px] sm:block">
            <SearchBar value={filters.search} onChange={handleSearch} />
          </div>

          <nav className="ml-auto flex items-center gap-1 md:hidden" aria-label="Library">
            <HeaderButton label="Home" active={view === 'browse' && !selectedVideo} onClick={() => openView('browse')}>
              <HomeIcon />
            </HeaderButton>
            <HeaderButton label="History" active={view === 'watched' && !selectedVideo} onClick={() => openView('watched')}>
              <HistoryIcon />
            </HeaderButton>
            <HeaderButton label="Saved" active={view === 'saved' && !selectedVideo} onClick={() => openView('saved')}>
              <SaveIcon filled={savedVids.size > 0} />
            </HeaderButton>
          </nav>
        </div>
        <div className="px-4 pb-3 sm:hidden">
          <SearchBar value={filters.search} onChange={handleSearch} />
        </div>
      </header>

      <div className="flex">
        <nav
          className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[72px] shrink-0 flex-col items-center py-2 md:flex"
          aria-label="Guide"
        >
          <GuideButton label="Home" active={view === 'browse' && !selectedVideo} onClick={() => openView('browse')}>
            <HomeIcon />
          </GuideButton>
          <GuideButton label="History" active={view === 'watched' && !selectedVideo} onClick={() => openView('watched')}>
            <HistoryIcon />
          </GuideButton>
          <GuideButton label="Saved" active={view === 'saved' && !selectedVideo} onClick={() => openView('saved')}>
            <SaveIcon filled={view === 'saved'} />
          </GuideButton>
        </nav>

        <main className="min-w-0 flex-1">
          {selectedVideo ? (
            <VideoPlayer
              video={selectedVideo}
              related={related}
              onBack={() => setSelectedVideo(null)}
              onSelect={setSelectedVideo}
              onLibraryChange={bumpLibrary}
            />
          ) : (
            <div className="px-4 pb-10">
              <div className="no-scrollbar z-30 -mx-4 flex gap-3 overflow-x-auto bg-[#0f0f0f] px-4 py-3 sm:sticky sm:top-14">
                {contentTypes.map((type) => (
                  <Chip
                    key={type.id}
                    active={filters.contentType === type.id}
                    label={type.label}
                    onClick={() => setFilters((current) => ({ ...current, contentType: type.id }))}
                  />
                ))}
                <Chip
                  active={showFilters || extraFiltersActive}
                  label="Filters"
                  onClick={() => setShowFilters((open) => !open)}
                />
              </div>

              {showFilters && (
                <div className="mb-4">
                  <FilterPanel filters={filters} onChange={setFilters} taxonomy={taxonomy} />
                </div>
              )}

              {(filters.search || view !== 'browse') && (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#f1f1f1]">
                    {viewHeading(view, filters.search, displayedVideos.length)}
                  </p>
                  {view !== 'browse' && displayedVideos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearLibrary}
                      className="h-9 shrink-0 rounded-full bg-[#272727] px-4 text-sm font-medium hover:bg-[#3f3f3f]"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}

              {visibleVideos.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-lg text-[#f1f1f1]">{emptyMessage(view, filters.search)}</p>
                  {view === 'browse' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilters(defaultFilters);
                        setShowFilters(false);
                      }}
                      className="mt-4 h-9 rounded-full bg-white px-4 text-sm font-medium text-black"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {visibleVideos.map((video, index) => (
                    <VideoCard
                      key={video.vid}
                      video={video}
                      watched={watchedVids.has(video.vid)}
                      priority={index < 4}
                      onSelect={setSelectedVideo}
                      onLibraryChange={bumpLibrary}
                    />
                  ))}
                </div>
              )}

              {hasMore && <div ref={loadMoreRef} className="h-16" />}

              <p className="mt-10 text-center text-xs text-[#717171]">
                Data from{' '}
                <a href="https://hackertube.org" target="_blank" rel="noopener noreferrer" className="text-[#aaaaaa] underline">
                  HackerTube
                </a>{' '}
                and{' '}
                <a href="https://huggingface.co/datasets/open-index/hacker-news" target="_blank" rel="noopener noreferrer" className="text-[#aaaaaa] underline">
                  open-index/hacker-news
                </a>
                , ODC-By 1.0.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function viewHeading(view: View, search: string, count: number): string {
  if (search) return `${count} result${count === 1 ? '' : 's'}`;
  switch (view) {
    case 'browse':
      return '';
    case 'watched':
      return 'History';
    case 'saved':
      return 'Saved videos';
    default: {
      const exhaustive: never = view;
      return exhaustive;
    }
  }
}

function emptyMessage(view: View, search: string): string {
  switch (view) {
    case 'watched':
      return 'No videos in history yet';
    case 'saved':
      return 'No saved videos yet';
    case 'browse':
      return search ? 'No videos found' : 'No videos match these filters';
    default: {
      const exhaustive: never = view;
      return exhaustive;
    }
  }
}

function pickRelated(current: Video, pool: Video[], catalog: Video[]): Video[] {
  const ranked = rankAgainst(current, pool);
  if (ranked.length >= 12) return ranked.slice(0, 20);
  const seen = new Set(ranked.map((video) => video.vid));
  const extra = rankAgainst(current, catalog).filter((video) => !seen.has(video.vid));
  return [...ranked, ...extra].slice(0, 20);
}

function rankAgainst(current: Video, list: Video[]): Video[] {
  const sameTopic: Video[] = [];
  const rest: Video[] = [];
  for (const video of list) {
    if (video.vid === current.vid) continue;
    if (video.primary_topic === current.primary_topic) sameTopic.push(video);
    else rest.push(video);
  }
  return [...sameTopic, ...rest];
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 shrink-0 rounded-lg px-3 text-sm font-medium ${active ? 'bg-white text-black' : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]'}`}
    >
      {label}
    </button>
  );
}

function GuideButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-16 flex-col items-center gap-1 rounded-xl py-4 text-[10px] ${active ? 'bg-white/10' : 'hover:bg-white/10'}`}
    >
      {children}
      {label}
    </button>
  );
}

function HeaderButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`grid h-10 w-10 place-items-center rounded-full ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}
    >
      {children}
    </button>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" d="M4.5 12a7.5 7.5 0 1 0 1.8-4.9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.5V9h3.5" />
      <path strokeLinecap="round" d="M12 8.5V12l2.5 1.5" />
    </svg>
  );
}

function SaveIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinejoin="round" d="M6 4.5h12a1 1 0 0 1 1 1V20l-7-3.5L5 20V5.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export default App;
