# Dataset Documentation

## Source & Licensing

### HackerTube Dataset

- **Source URL:** https://hackertube.org/download/hackertube-data.zip
- **License:** [ODC-By 1.0 (Open Data Commons Attribution License)](https://opendatacommons.org/licenses/by/1-0/)
- **Size:** 17.8 MB compressed
- **Generated:** October 31, 2026
- **Attribution Required:** Yes - must credit HackerTube and open-index/hacker-news

### License Terms (ODC-By 1.0)

You are free to:
- **Share:** Copy and redistribute the data
- **Adapt:** Modify, transform, and build upon the data
- **Use commercially:** Use for any purpose, including commercial

Under these terms:
- **Attribution:** Must give appropriate credit, provide a link to the license, and indicate if changes were made
- **No additional restrictions:** Cannot apply legal terms or technological measures that legally restrict others from doing anything the license permits

### Upstream Sources

The HackerTube dataset derives from:

1. **[open-index/hacker-news](https://huggingface.co/datasets/open-index/hacker-news)**
   - Complete archive of Hacker News (~43M comments)
   - Also licensed under ODC-By 1.0
   
2. **YouTube metadata** (not redistributed)
   - Video IDs and URLs only
   - Durations, view counts, descriptions not included per YouTube API ToS
   - Users must fetch via YouTube Data API if needed

## Dataset Contents

### Files Included

| File | Description | Rows | Size |
|------|-------------|------|------|
| `videos.jsonl` | Video records with metadata | 6,454 | 8.3 MB |
| `mentions.jsonl` | Labeled HN comments linking videos | 39,834 | 34 MB |
| `taxonomy.json` | Topic areas and categories | 16 areas, 150 categories | 44 KB |
| `related.jsonl` | Co-recommendation graph | 3,778 | 1.5 MB |
| `embeddings.npy` | 384-dim vectors (bge-small) | 6,454 | 4.8 MB |
| `embedding_ids.json` | Video ID to embedding index | 6,454 | 95 KB |
| `DATA.md` | Dataset documentation | - | 14 KB |

### Video Record Schema

```typescript
{
  vid: string;              // YouTube video ID (11 chars)
  url: string;              // Full YouTube URL
  title: string;            // Video title
  channel: string;          // Channel name
  summary: string;          // AI-generated summary
  why_hn: string;           // Why HN recommends this
  content_type: string;     // talk, course, tutorial, demo, interview, documentary
  level: string;            // intro, intermediate, advanced
  shelf_life: string;       // evergreen, news
  primary_topic: string;    // Main topic
  tags: string[];           // Searchable tags
  categories: Category[];   // Taxonomy classifications
  quote: {                  // Featured HN quote
    text: string;
    hn_comment_id: number;
    year: string;
  };
  hn: {                     // HN statistics
    mentions: number;       // Total mentions (capped at 20)
    recommenders: number;   // Unique recommenders
    rec_months: number;     // Active recommendation months
    strong_recs: number;    // Strong recommendations
    stances: {              // Breakdown by stance
      rec?: number;
      strong_rec?: number;
      reference?: number;
      joke?: number;
      critical?: number;
    };
    first_year: number;
    last_year: number;
  };
  score: number;            // Ranking score (distinct months + bonus for strong recs)
}
```

### Important Notes from DATA.md

1. **Score calculation:** Number of distinct months with recommendations, with strong recommendations counting extra
2. **Mention limit:** Maximum 20 mentions per video included
3. **Comment text:** Truncated at 1,500 characters, links replaced with `[VIDEO]` or `[LINK]`
4. **Shelf life "news":** Time-sensitive content, should be hidden by default
5. **LLM-generated content:** Summaries, stances, and categories written by Claude AI - expect ~few percent noise
6. **Duplicate videos:** Some talks uploaded twice with different IDs but similar titles

### Thumbnail Handling

The dataset documentation specifies:

- **Standard thumbnail:** `https://i.ytimg.com/vi/<vid>/hqdefault.jpg`
- **Mid-frame thumbnail:** `https://i.ytimg.com/vi/<vid>/hq2.jpg`

HackerTube uses `hq2.jpg` (automatic frame from video middle) instead of uploader's custom thumbnail. This application:
1. Attempts to load `hq2.jpg` first
2. Falls back to `hqdefault.jpg` on error
3. Does NOT download videos or extract frames locally

### YouTube Data API (Not Used in v1)

The dataset does not include:
- Video duration
- View counts
- Publish dates
- Descriptions

These can be fetched with YouTube Data API v3:
- Endpoint: `videos.list` 
- Cost: ~130 quota units for all 6,454 videos
- Daily quota: 10,000 units (free tier)
- Rate: 50 video IDs per request

**Implementation notes for future versions:**
- Must use server-side fetching (never expose API key in client)
- Requires Google Cloud project and API key
- Must display "Data provided by YouTube" attribution
- Should refresh periodically as videos may be deleted (~6% deletion rate)

## AI Content Filtering

### Filtering Methodology

This application filters the full HackerTube dataset to include only AI-related content.

**Keywords matched in title, summary, topic, tags, or description:**

```
machine learning, deep learning, neural network, artificial intelligence,
ai, ml, llm, gpt, transformer, nlp, computer vision, cv,
reinforcement learning, robotics, autonomous, self-driving,
diffusion, generative, gan, vae, bert, resnet, attention,
pytorch, tensorflow, keras, scikit, embedding, fine-tuning,
prompt engineering, agent, rag, vector, chatbot, anthropic,
openai, deepmind, research talk, paper review, arxiv
```

**Categories explicitly included:**
- `machine-learning`
- `deep-learning`
- `natural-language-processing`
- `computer-vision`
- `robotics`
- `ai-ethics-safety`
- `research-papers`

### Filtering Results

- **Total videos in source:** 6,454
- **AI-related videos:** 3,837
- **Percentage:** 59.5%
- **Excluded:** General software engineering, web development, databases, security, etc.

### Sample Included Videos

Top 5 by score:
1. "Vectors | Chapter 1, Essence of linear algebra" (3Blue1Brown, score: 25.0)
2. "Y Not- Adventures in Functional Programming" (Jim Weirich, score: 22.5)
3. "Building micrograd: intro to neural networks and backpropagation" (Andrej Karpathy, score: 21.0)
4. Various ML/DL/AI research talks and courses

### Validation

The filtering script:
1. Loads all 6,454 videos from `videos.jsonl`
2. Applies multi-signal AI detection (keywords, categories, topics)
3. Validates video IDs (11 characters, valid format)
4. Checks for duplicates (none found)
5. Preserves all source fields
6. Outputs to `app/src/data/videos.json`

## Reuse Guidelines

### Permitted Uses

✅ Display videos in your own interface  
✅ Create playlists and recommendations  
✅ Build search and filtering tools  
✅ Analyze trends and statistics  
✅ Create visualizations  
✅ Combine with other datasets  
✅ Commercial use  

### Required

✅ Credit HackerTube and open-index/hacker-news  
✅ Link to license (ODC-By 1.0)  
✅ Indicate if you modified the data  

### Prohibited

❌ Redistribute as competing raw dataset without transformation  
❌ Claim original authorship of the data  
❌ Apply additional legal restrictions  
❌ Redistribute YouTube metadata (durations, view counts) obtained via API  

### Attribution Template

```
Data from HackerTube (https://hackertube.org) and 
open-index/hacker-news (https://huggingface.co/datasets/open-index/hacker-news)
licensed under ODC-By 1.0.
```

## Privacy & Content Concerns

### User-Generated Content

- **HN comments:** Publicly posted on news.ycombinator.com, attributable by comment ID
- **AI labels:** Generated by Claude, not reviewed by humans - may contain errors
- **Quotes:** Selected automatically, may not represent commenter's full view

### Video Content

- Videos remain on YouTube under their original terms
- Application does not host or redistribute video files
- Playback through privacy-enhanced embed (youtube-nocookie.com)
- Links to original sources for verification

### Takedown Requests

If you believe your content should not be included:

1. For video removal: Contact YouTube directly
2. For HN comment concerns: Contact HN moderators
3. For dataset inclusion: Contact HackerTube maintainers
4. For this application: Open a GitHub issue

## Data Quality Notes

### Known Issues

1. **LLM hallucinations:** ~5% of summaries/categories may be inaccurate
2. **Duplicate videos:** Some talks uploaded multiple times with different IDs
3. **Deleted videos:** ~6% of video IDs no longer available on YouTube
4. **Stale data:** Snapshot from Oct 31, 2026 - newer videos not included
5. **Incomplete coverage:** Only videos explicitly linked in HN comments

### Validation Performed

✅ Video ID format validation  
✅ URL structure validation  
✅ Duplicate detection (by video ID)  
✅ Category reference integrity  
✅ HN comment ID validation  
✅ Score calculation verification  

### Not Validated

⚠️ Video availability (done at runtime via thumbnail fallback)  
⚠️ Channel name accuracy  
⚠️ AI-generated content accuracy  
⚠️ Completeness of HN mentions  

## Updates & Freshness

This application uses a **static snapshot** from October 31, 2026.

To update:
1. Download latest dataset from https://hackertube.org/download/hackertube-data.zip
2. Run filtering script
3. Rebuild application

Expected update frequency: Quarterly or when major dataset changes occur.

## Technical Details

### Processing Script

Location: Repository root (inline Python script in README)

Dependencies:
- Python 3.7+
- Standard library only (json, re)

Runtime: ~1 second on modern hardware

### Storage Format

- **Source:** JSONL (one JSON object per line)
- **Application:** Single JSON array (all videos in memory)
- **Size tradeoff:** Larger bundle, faster runtime filtering

Alternative approaches:
- SQLite database with FTS5 for search
- Split by category for code-splitting
- Server-side filtering with API

## References

- [HackerTube About Page](https://hackertube.org/about)
- [HackerTube Data Page](https://hackertube.org/data)
- [ODC-By 1.0 License](https://opendatacommons.org/licenses/by/1-0/)
- [DATA.md in dataset](data/hackertube-data/DATA.md)
- [open-index/hacker-news on Hugging Face](https://huggingface.co/datasets/open-index/hacker-news)

---

Last updated: November 8, 2026
