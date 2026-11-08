import { useState, useMemo } from 'react';
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

type View = 'browse' | 'watched' | 'saved';

function App() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    contentType: 'all',
    level: 'all',
    area: 'all',
    category: 'all',
    shelfLife: 'all',
    sortBy: 'score',
  });
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [view, setView] = useState<View>('browse');
  const [showFilters, setShowFilters] = useState(false);

  const watchedVids = useMemo(() => {
    return new Set(getWatchedVideos().map(v => v.vid));
  }, [selectedVideo]);

  const savedVids = useMemo(() => {
    return new Set(getSavedVideos().map(v => v.vid));
  }, [selectedVideo]);

  const displayedVideos = useMemo(() => {
    let baseVideos = videos;
    
    if (view === 'watched') {
      const watched = getWatchedVideos();
      baseVideos = watched
        .map(w => videos.find(v => v.vid === w.vid))
        .filter((v): v is Video => v !== undefined);
    } else if (view === 'saved') {
      const saved = getSavedVideos();
      baseVideos = saved
        .map(s => videos.find(v => v.vid === s.vid))
        .filter((v): v is Video => v !== undefined);
    }
    
    return filterVideos(baseVideos, filters);
  }, [filters, view, selectedVideo]);

  const handleClearHistory = () => {
    if (view === 'watched' && confirm('Clear all watch history?')) {
      clearWatchedVideos();
      setView('browse');
    } else if (view === 'saved' && confirm('Clear all saved videos?')) {
      clearSavedVideos();
      setView('browse');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">
              HackerNews AI Video Viewer
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <nav className="flex gap-2 mb-4">
            <button
              onClick={() => setView('browse')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'browse'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Browse ({videos.length})
            </button>
            <button
              onClick={() => setView('watched')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'watched'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Watched ({watchedVids.size})
            </button>
            <button
              onClick={() => setView('saved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'saved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Saved ({savedVids.size})
            </button>
            {(view === 'watched' || view === 'saved') && (
              <button
                onClick={handleClearHistory}
                className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear {view === 'watched' ? 'History' : 'Saved'}
              </button>
            )}
          </nav>

          <SearchBar
            value={filters.search}
            onChange={(search) => setFilters({ ...filters, search })}
            resultsCount={displayedVideos.length}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              taxonomy={taxonomy}
            />
          </aside>

          <main className="flex-1">
            {displayedVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-400 mb-2">
                  {view === 'watched' && 'No watched videos yet'}
                  {view === 'saved' && 'No saved videos yet'}
                  {view === 'browse' && filters.search && 'No videos found'}
                  {view === 'browse' && !filters.search && 'No videos match your filters'}
                </p>
                {view === 'browse' && (
                  <button
                    onClick={() => setFilters({
                      search: '',
                      contentType: 'all',
                      level: 'all',
                      area: 'all',
                      category: 'all',
                      shelfLife: 'all',
                      sortBy: 'score',
                    })}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedVideos.map(video => (
                  <VideoCard
                    key={video.vid}
                    video={video}
                    onSelect={setSelectedVideo}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <footer className="bg-gray-800 border-t border-gray-700 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p className="mb-2">
            Data from{' '}
            <a
              href="https://hackertube.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              HackerTube
            </a>{' '}
            (ODC-By 1.0) and{' '}
            <a
              href="https://huggingface.co/datasets/open-index/hacker-news"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              open-index/hacker-news
            </a>
          </p>
          <p>
            {videos.length} AI-related videos curated from Hacker News recommendations
          </p>
        </div>
      </footer>

      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

export default App;
