import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { CatalogVideo, VideoDetails } from './types';
import type { Filters } from './utils/filters';
import { filterVideos } from './utils/filters';
import { href, parseRoute } from './utils/routes';
import type { Route } from './utils/routes';
import { similarVideos, upNextVideos } from './utils/related';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { VideoCard } from './components/VideoCard';
import { VideoPlayer } from './components/VideoPlayer';
import { LibraryView } from './components/LibraryView';
import {
  clearSavedVideos,
  clearWatchedVideos,
  getPlaylists,
  getSavedVideos,
  getWatchedVideos,
} from './utils/storage';
import { catalog, catalogById, loadDetails, loadGraphs, taxonomy } from './data/load';

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

function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname));
  const [queue, setQueue] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [libraryTick, setLibraryTick] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [summaries, setSummaries] = useState<ReadonlyMap<string, string>>(() => new Map());
  const [detailsById, setDetailsById] = useState<Record<string, VideoDetails> | null>(null);
  const [graphs, setGraphs] = useState<{ related: Record<string, string[]>; similar: Record<string, string[]> } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const bumpLibrary = useCallback(() => {
    setLibraryTick((tick) => tick + 1);
  }, []);

  const handleSearch = useCallback((search: string) => {
    setFilters((current) => (current.search === search ? current : { ...current, search }));
  }, []);

  const go = useCallback((next: Route, nextQueue: string[] = []) => {
    const path = href(next);
    if (window.location.pathname !== path) {
      window.history.pushState({ queue: nextQueue }, '', path);
    }
    setRoute(next);
    setQueue(nextQueue);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      setRoute(parseRoute(window.location.pathname));
      const queued = (event.state as { queue?: unknown } | null)?.queue;
      setQueue(Array.isArray(queued) ? queued.filter((vid): vid is string => typeof vid === 'string') : []);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadDetails().then((details) => {
      if (cancelled) return;
      setDetailsById(details);
      setSummaries(new Map(Object.entries(details).map(([vid, detail]) => [vid, detail.summary])));
    }).catch(() => undefined);
    loadGraphs().then((loaded) => {
      if (!cancelled) setGraphs(loaded);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const playlists = useMemo(() => getPlaylists(), [libraryTick]);
  const watchedVids = useMemo(() => new Set(getWatchedVideos().map((entry) => entry.vid)), [libraryTick]);
  const savedVids = useMemo(() => new Set(getSavedVideos().map((entry) => entry.vid)), [libraryTick]);

  const displayedVideos = useMemo(() => {
    let baseVideos = catalog;
    if (route.page === 'history') {
      baseVideos = getWatchedVideos()
        .map((entry) => catalogById.get(entry.vid))
        .filter((video): video is CatalogVideo => video !== undefined);
    } else if (route.page === 'saved') {
      baseVideos = getSavedVideos()
        .map((entry) => catalogById.get(entry.vid))
        .filter((video): video is CatalogVideo => video !== undefined);
    }
    return filterVideos(baseVideos, filters, summaries);
  }, [filters, route, libraryTick, summaries]);

  const openPlaylist = route.page === 'playlist'
    ? playlists.find((playlist) => playlist.id === route.playlistId) ?? null
    : null;
  const playlistVideos = useMemo(() => {
    if (!openPlaylist) return [];
    const ordered = openPlaylist.videoIds
      .map((vid) => catalogById.get(vid))
      .filter((video): video is CatalogVideo => video !== undefined);
    if (!filters.search && filters.contentType === 'all' && filters.level === 'all' && filters.area === 'all' && filters.category === 'all' && filters.shelfLife === 'all') {
      return ordered;
    }
    const allowed = new Set(filterVideos(ordered, filters, summaries).map((video) => video.vid));
    return ordered.filter((video) => allowed.has(video.vid));
  }, [openPlaylist, filters, summaries]);

  const watching = route.page === 'watch' ? catalogById.get(route.vid) : undefined;
  const queuedVideos = queue
    .map((vid) => catalogById.get(vid))
    .filter((video): video is CatalogVideo => video !== undefined);
  const recommendations = useMemo(() => {
    if (!watching) return [];
    return upNextVideos(watching, catalog, graphs?.related[watching.vid]);
  }, [watching, graphs]);
  const similar = useMemo(() => {
    if (!watching) return [];
    return similarVideos(catalog, graphs?.similar[watching.vid]);
  }, [watching, graphs]);
  const upNext = queuedVideos.length > 0 ? queuedVideos : recommendations;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, route.page]);

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

  const playVideo = (video: CatalogVideo, nextQueue?: string[]) => {
    const following = nextQueue ?? (queue.includes(video.vid) ? queue.slice(queue.indexOf(video.vid) + 1) : []);
    go({ page: 'watch', vid: video.vid }, following);
  };

  const extraFiltersActive = filters.level !== 'all'
    || filters.area !== 'all'
    || filters.category !== 'all'
    || filters.shelfLife !== 'all'
    || filters.sortBy !== 'score';

  const listPage = route.page === 'browse' || route.page === 'history' || route.page === 'saved';

  const handleClearLibrary = () => {
    if (route.page === 'history' && window.confirm('Clear all watch history?')) {
      clearWatchedVideos();
      bumpLibrary();
      go({ page: 'browse' });
    } else if (route.page === 'saved' && window.confirm('Clear all saved videos?')) {
      clearSavedVideos();
      bumpLibrary();
      go({ page: 'browse' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1]">
      <header className="sticky top-0 z-50 bg-[#0f0f0f]">
        <div className="flex h-14 items-center gap-3 px-4">
          <button type="button" onClick={() => go({ page: 'browse' })} className="flex shrink-0 items-center gap-2" aria-label="HN AI videos home">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#ff0000]">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="hidden text-lg font-medium tracking-tight sm:block">HN AI videos</span>
          </button>

          <div className="mx-auto hidden w-full max-w-[640px] sm:block">
            <SearchBar value={filters.search} onChange={handleSearch} />
          </div>

          <nav className="ml-auto flex items-center gap-1 md:hidden" aria-label="Library">
            <HeaderButton label="Home" active={route.page === 'browse'} onClick={() => go({ page: 'browse' })}><HomeIcon /></HeaderButton>
            <HeaderButton label="History" active={route.page === 'history'} onClick={() => go({ page: 'history' })}><HistoryIcon /></HeaderButton>
            <HeaderButton label="Saved" active={route.page === 'saved'} onClick={() => go({ page: 'saved' })}><SaveIcon filled={savedVids.size > 0} /></HeaderButton>
            <HeaderButton label="Playlists" active={route.page === 'playlists' || route.page === 'playlist'} onClick={() => go({ page: 'playlists' })}><PlaylistIcon /></HeaderButton>
          </nav>
        </div>
        <div className="px-4 pb-3 sm:hidden">
          <SearchBar value={filters.search} onChange={handleSearch} />
        </div>
      </header>

      <div className="flex">
        <nav className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[72px] shrink-0 flex-col items-center py-2 md:flex" aria-label="Guide">
          <GuideButton label="Home" active={route.page === 'browse'} onClick={() => go({ page: 'browse' })}><HomeIcon /></GuideButton>
          <GuideButton label="History" active={route.page === 'history'} onClick={() => go({ page: 'history' })}><HistoryIcon /></GuideButton>
          <GuideButton label="Saved" active={route.page === 'saved'} onClick={() => go({ page: 'saved' })}><SaveIcon filled={savedVids.size > 0} /></GuideButton>
          <GuideButton label="Playlists" active={route.page === 'playlists' || route.page === 'playlist'} onClick={() => go({ page: 'playlists' })}><PlaylistIcon /></GuideButton>
        </nav>

        <main className="min-w-0 flex-1">
          {route.page === 'watch' && watching && (
            <VideoPlayer
              video={watching}
              details={detailsById?.[watching.vid] ?? null}
              upNext={upNext}
              similar={similar}
              playlists={playlists}
              onBack={() => {
                const state = window.history.state as { queue?: unknown } | null;
                if (state && Array.isArray(state.queue)) window.history.back();
                else go({ page: 'browse' });
              }}
              onSelect={(video) => playVideo(video)}
              onLibraryChange={bumpLibrary}
            />
          )}
          {route.page === 'watch' && !watching && (
            <div className="px-4 py-20 text-center">
              <p className="text-lg">This video is not in the library</p>
              <button type="button" onClick={() => go({ page: 'browse' })} className="mt-4 h-9 rounded-full bg-white px-4 text-sm font-medium text-black">
                Home
              </button>
            </div>
          )}
          {route.page === 'playlist' && !openPlaylist && (
            <div className="px-4 py-20 text-center">
              <p className="text-lg">This playlist is not in the library</p>
              <button type="button" onClick={() => go({ page: 'playlists' })} className="mt-4 h-9 rounded-full bg-white px-4 text-sm font-medium text-black">
                Playlists
              </button>
            </div>
          )}
          {(route.page === 'playlists' || (route.page === 'playlist' && openPlaylist)) && (
            <div className="px-4 pb-10">
              <LibraryView
                playlist={route.page === 'playlist' ? openPlaylist : null}
                playlists={playlists}
                videos={playlistVideos}
                watched={watchedVids}
                onOpenPlaylist={(playlistId) => go(playlistId ? { page: 'playlist', playlistId } : { page: 'playlists' })}
                onPlay={(video, nextQueue) => playVideo(video, nextQueue)}
                onLibraryChange={bumpLibrary}
              />
            </div>
          )}
          {listPage && (
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
                <Chip active={showFilters || extraFiltersActive} label="Filters" onClick={() => setShowFilters((open) => !open)} />
              </div>
              {showFilters && (
                <div className="mb-4">
                  <FilterPanel filters={filters} onChange={setFilters} taxonomy={taxonomy} />
                </div>
              )}
              {(filters.search || route.page !== 'browse') && (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#f1f1f1]">{viewHeading(route, filters.search, displayedVideos.length)}</p>
                  {route.page !== 'browse' && displayedVideos.length > 0 && (
                    <button type="button" onClick={handleClearLibrary} className="h-9 shrink-0 rounded-full bg-[#272727] px-4 text-sm font-medium hover:bg-[#3f3f3f]">
                      Clear all
                    </button>
                  )}
                </div>
              )}
              {visibleVideos.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-lg text-[#f1f1f1]">{emptyMessage(route, filters.search)}</p>
                  {route.page === 'browse' && (
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
                      playlists={playlists}
                      onSelect={(selected) => playVideo(selected)}
                      onLibraryChange={bumpLibrary}
                    />
                  ))}
                </div>
              )}
              {hasMore && <div ref={loadMoreRef} className="h-16" />}
              <p className="mt-10 text-center text-xs text-[#717171]">
                Data from{' '}
                <a href="https://hackertube.org" target="_blank" rel="noopener noreferrer" className="text-[#aaaaaa] underline">HackerTube</a>
                {' '}and{' '}
                <a href="https://huggingface.co/datasets/open-index/hacker-news" target="_blank" rel="noopener noreferrer" className="text-[#aaaaaa] underline">open-index/hacker-news</a>
                , ODC-By 1.0.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function viewHeading(route: Route, search: string, count: number): string {
  if (search) return `${count} result${count === 1 ? '' : 's'}`;
  switch (route.page) {
    case 'browse':
    case 'watch':
    case 'playlists':
    case 'playlist':
      return '';
    case 'history':
      return 'History';
    case 'saved':
      return 'Saved videos';
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}

function emptyMessage(route: Route, search: string): string {
  switch (route.page) {
    case 'history':
      return 'No videos in history yet';
    case 'saved':
      return 'No saved videos yet';
    case 'browse':
      return search ? 'No videos found' : 'No videos match these filters';
    case 'watch':
    case 'playlists':
    case 'playlist':
      return '';
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-8 shrink-0 rounded-lg px-3 text-sm font-medium ${active ? 'bg-white text-black' : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]'}`}>
      {label}
    </button>
  );
}

function GuideButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`flex w-16 flex-col items-center gap-1 rounded-xl py-4 text-[10px] ${active ? 'bg-white/10' : 'hover:bg-white/10'}`}>
      {children}
      {label}
    </button>
  );
}

function HeaderButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-current={active ? 'page' : undefined} className={`grid h-10 w-10 place-items-center rounded-full ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}>
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

function PlaylistIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M4 6h12v2H4V6zm0 4h12v2H4v-2zm0 4h8v2H4v-2zm11 1.5v6l5-3-5-3z" />
    </svg>
  );
}

export default App;
