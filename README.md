# HackerNews AI Video Viewer

A polished, responsive web application for discovering and watching AI-related videos curated from Hacker News recommendations. Built with React, TypeScript, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

This application provides a streamlined interface to explore **3,837 AI-related videos** selected from HackerTube's dataset of 6,454 HN-recommended videos. Videos are filtered to include only content related to machine learning, deep learning, NLP, computer vision, robotics, and AI research.

### Features

- **🔍 Advanced Search & Filtering**
  - Full-text search across titles, summaries, channels, topics, and tags
  - Filter by content type (talk, course, tutorial, demo, etc.)
  - Filter by difficulty level (beginner, intermediate, advanced)
  - Filter by topic area and category
  - Exclude time-sensitive content (news vs. evergreen)
  - Sort by HN score, recency, or age

- **📺 YouTube Video Player**
  - Privacy-enhanced YouTube embeds (youtube-nocookie.com)
  - Fullscreen support with keyboard shortcuts (ESC to close)
  - Direct links to YouTube and HN discussions
  - Automatic fallback for unavailable thumbnails

- **💾 Local Storage Features**
  - Watch history tracking (last 100 videos)
  - Save videos for later viewing
  - Clear history with confirmation
  - No login or account required

- **📱 Responsive Design**
  - Mobile-first approach
  - Adaptive layout for all screen sizes
  - Accessible with proper ARIA labels
  - Dark theme optimized for readability

- **📊 Rich Metadata**
  - HN recommendation statistics (mentions, recommenders, active months)
  - Curated summaries and "why HN recommends" explanations
  - Featured quotes from HN discussions with source links
  - Topic tags and categorization

## Dataset Attribution

This project uses data from:

- **[HackerTube](https://hackertube.org)** - Licensed under [ODC-By 1.0](https://opendatacommons.org/licenses/by/1-0/)
  - 6,454 videos curated from 20 years of HN comments
  - 39,834 labeled HN comments
  - Generated October 31, 2026
  
- **[open-index/hacker-news](https://huggingface.co/datasets/open-index/hacker-news)** - Original HN comment dataset

### Data Processing

The application filters the full HackerTube dataset to include only AI-related content:

- **Total videos in source dataset:** 6,454
- **AI-related videos in this app:** 3,837 (59.5%)
- **Filtering criteria:** Videos tagged or categorized as ML, DL, NLP, CV, robotics, AI research, or containing AI-related keywords in title/summary

Data is processed at build time and included in the application bundle. No external API calls are required for basic functionality.

### Dataset Schema

Each video includes:
- YouTube video ID and URL
- Title, channel, summary
- Content type (talk, course, tutorial, demo, interview, documentary)
- Difficulty level (intro, intermediate, advanced)
- Shelf life (evergreen, news)
- Primary topic and tags
- Category classifications (16 areas, 150 categories)
- HN statistics (mentions, recommenders, active months, recommendation score)
- Featured quote from HN discussion

## Technology Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4 with PostCSS
- **Testing:** Vitest with React Testing Library
- **Type Checking:** TypeScript 7
- **Linting:** Oxlint

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with localStorage support

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hacknewsViewer
   ```

2. **Navigate to the app directory:**
   ```bash
   cd app
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Build for Production

```bash
npm run build
```

The production build will be created in the `app/dist` directory. You can preview it with:

```bash
npm run preview
```

## Development

### Project Structure

```
hacknewsViewer/
├── app/                          # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── VideoCard.tsx
│   │   │   └── VideoPlayer.tsx
│   │   ├── data/                # Processed video data (generated)
│   │   │   ├── videos.json
│   │   │   └── taxonomy.json
│   │   ├── utils/               # Utility functions
│   │   │   ├── storage.ts       # localStorage utilities
│   │   │   ├── filters.ts       # Video filtering logic
│   │   │   └── __tests__/       # Unit tests
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── App.tsx              # Main application component
│   │   ├── main.tsx             # Application entry point
│   │   └── index.css            # Global styles
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── data/                         # Source data (gitignored)
│   └── hackertube-data/
├── LICENSE                       # MIT License
└── README.md                     # This file
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code with Oxlint
```

### Testing

The project includes unit tests for core functionality:

- **Storage utilities:** localStorage operations for watch history and saved videos
- **Filter utilities:** Video filtering and sorting logic

Run tests with:

```bash
npm test
```

Test coverage includes:
- 21 test cases
- Storage: watch history, saved videos, limits, clear operations
- Filters: search, content type, level, area, category, shelf life, sorting

## Data Import & Processing

The data processing script (`data/process.py`) filters AI-related videos from the HackerTube dataset:

### Running Data Import

```bash
# From repository root
python3 << 'EOF'
import json

# AI-related keywords and categories
AI_KEYWORDS = {
    'machine learning', 'deep learning', 'neural network', 'artificial intelligence',
    'ai', 'ml', 'llm', 'gpt', 'transformer', 'nlp', 'computer vision', 'cv',
    'reinforcement learning', 'robotics', 'autonomous', 'self-driving',
    'diffusion', 'generative', 'gan', 'vae', 'bert', 'resnet', 'attention',
    'pytorch', 'tensorflow', 'keras', 'scikit', 'embedding', 'fine-tuning',
    'prompt engineering', 'agent', 'rag', 'vector', 'chatbot', 'anthropic',
    'openai', 'deepmind', 'research talk', 'paper review', 'arxiv'
}

def is_ai_related(video):
    """Determine if a video is AI-related based on multiple signals"""
    # Check primary topic, tags, categories, title, and summary
    # ... (full implementation in repository)
    
# Load, filter, and save
# ... (full script in repository)
EOF
```

### Data Validation

The import process includes:
- **Deduplication:** No duplicate video IDs
- **URL validation:** All YouTube video IDs are valid format
- **XSS protection:** All user-generated content is rendered as text only
- **Provenance tracking:** HN comment IDs link to original discussions

## Security & Privacy

- **No server-side code:** Static site, no backend required
- **No user tracking:** All data stored in browser localStorage only
- **No API keys required:** Video data bundled at build time
- **Privacy-enhanced embeds:** Uses `youtube-nocookie.com` domain
- **XSS protection:** All user-generated content properly escaped
- **Safe external links:** Uses `rel="noopener noreferrer"`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

Requires JavaScript and localStorage enabled.

## Known Limitations

1. **Bundle size:** The video data file is ~5MB compressed (contains 3,837 videos)
2. **YouTube metadata:** Duration and view counts not included (YouTube API ToS)
3. **Thumbnail source:** Uses YouTube-generated thumbnails (hq2.jpg for mid-frame when available)
4. **Offline support:** Not a PWA, requires internet connection for video playback
5. **Data freshness:** Dataset snapshot from October 31, 2026

## Future Enhancements

Potential improvements for future versions:

- **Optional YouTube API integration:** Fetch durations, view counts (server-side only, no committed keys)
- **Semantic search:** Use included embeddings for similarity-based recommendations
- **Related videos:** Use included "co-recommended" graph
- **Playlist creation:** Custom playlists with local persistence
- **Export/import:** Share saved videos and watch history
- **PWA support:** Offline browsing of metadata
- **RSS/JSON feed:** Subscribe to new additions

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Data Licenses

- **HackerTube dataset:** [ODC-By 1.0](https://opendatacommons.org/licenses/by/1-0/)
- **open-index/hacker-news:** [ODC-By 1.0](https://opendatacommons.org/licenses/by/1-0/)

## Acknowledgments

- **Andrej Karpathy** and the **Claude AI** team for creating HackerTube
- **HackerTube project** for the curated dataset and taxonomy
- **Hacker News community** for 20 years of quality recommendations
- **open-index** for maintaining the HN dataset

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Note:** This application is not affiliated with Y Combinator, Hacker News, YouTube, or HackerTube. It is an independent viewer for publicly available data.
