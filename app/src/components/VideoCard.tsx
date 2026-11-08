import type { Video } from '../types';
import { isSaved, toggleSavedVideo } from '../utils/storage';
import { useState } from 'react';

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
}

export function VideoCard({ video, onSelect }: VideoCardProps) {
  const [saved, setSaved] = useState(isSaved(video.vid));

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = toggleSavedVideo(video.vid);
    setSaved(newSaved);
  };

  const thumbnailUrl = `https://i.ytimg.com/vi/${video.vid}/hq2.jpg`;

  return (
    <div
      onClick={() => onSelect(video)}
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(video);
        }
      }}
    >
      <div className="relative aspect-video bg-gray-700">
        <img
          src={thumbnailUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.vid}/hqdefault.jpg`;
          }}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={handleSaveToggle}
            className="p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
            aria-label={saved ? 'Remove from saved' : 'Save for later'}
            title={saved ? 'Remove from saved' : 'Save for later'}
          >
            <svg
              className="w-5 h-5 text-white"
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
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        
        <p className="text-sm text-gray-400 mb-2">{video.channel}</p>
        
        <p className="text-sm text-gray-300 line-clamp-2 mb-3">
          {video.summary}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">
            {video.content_type}
          </span>
          <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
            {video.level}
          </span>
          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">
            Score: {video.score}
          </span>
        </div>

        <div className="text-xs text-gray-400">
          {video.hn.recommenders} HN recommenders • {video.hn.rec_months} months active
        </div>
      </div>
    </div>
  );
}
