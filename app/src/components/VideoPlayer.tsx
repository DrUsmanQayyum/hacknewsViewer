import { useEffect } from 'react';
import type { Video } from '../types';
import { addWatchedVideo, isSaved, toggleSavedVideo } from '../utils/storage';
import { useState } from 'react';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [saved, setSaved] = useState(isSaved(video.vid));

  useEffect(() => {
    addWatchedVideo(video.vid);
    
    // Prevent body scroll when player is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [video.vid]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSaveToggle = () => {
    const newSaved = toggleSavedVideo(video.vid);
    setSaved(newSaved);
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.vid}?autoplay=1`;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen p-4 flex flex-col">
        <div 
          className="max-w-7xl mx-auto w-full bg-gray-900 rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white truncate flex-1">
              {video.title}
            </h2>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleSaveToggle}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                aria-label={saved ? 'Remove from saved' : 'Save for later'}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill={saved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close player"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="aspect-video bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">About</h3>
              <p className="text-gray-300 mb-4">{video.summary}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded">
                  {video.content_type}
                </span>
                <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded">
                  {video.level}
                </span>
                <span className="px-3 py-1 text-sm bg-green-500/20 text-green-300 rounded">
                  Score: {video.score}
                </span>
              </div>

              <div className="text-sm text-gray-400 space-y-1">
                <p><strong className="text-gray-300">Channel:</strong> {video.channel}</p>
                <p><strong className="text-gray-300">Topic:</strong> {video.primary_topic}</p>
                <p>
                  <strong className="text-gray-300">Categories:</strong>{' '}
                  {video.categories.map(c => c.name).join(', ')}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Why HN Recommends This</h3>
              <p className="text-gray-300">{video.why_hn}</p>
            </div>

            {video.quote && (
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-300 italic mb-2">"{video.quote.text}"</p>
                <a
                  href={`https://news.ycombinator.com/item?id=${video.quote.hn_comment_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View HN comment from {video.quote.year} →
                </a>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2">HN Discussion Stats</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Mentions</p>
                  <p className="text-white font-semibold">{video.hn.mentions}</p>
                </div>
                <div>
                  <p className="text-gray-400">Recommenders</p>
                  <p className="text-white font-semibold">{video.hn.recommenders}</p>
                </div>
                <div>
                  <p className="text-gray-400">Active Months</p>
                  <p className="text-white font-semibold">{video.hn.rec_months}</p>
                </div>
                <div>
                  <p className="text-gray-400">Period</p>
                  <p className="text-white font-semibold">
                    {video.hn.first_year}–{video.hn.last_year}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-center font-medium transition-colors"
              >
                Watch on YouTube
              </a>
              <a
                href={`https://hn.algolia.com/?query=${encodeURIComponent(video.vid)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-center font-medium transition-colors"
              >
                View HN Discussions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
