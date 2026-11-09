import { describe, expect, it } from 'vitest';
import type { CatalogVideo } from '../../types';
import { isAiVideo } from '../ranking';

function video(overrides: Partial<CatalogVideo>): CatalogVideo {
  return {
    vid: 'vid',
    url: 'https://www.youtube.com/watch?v=vid',
    title: 'Untitled',
    channel: 'Channel',
    content_type: 'explainer',
    level: 'general',
    shelf_life: 'evergreen',
    primary_topic: 'topic',
    tags: [],
    categories: [],
    hn: { mentions: 1, recommenders: 1, rec_months: 1, strong_recs: 0, first_year: 2023, last_year: 2026 },
    score: 1,
    ...overrides,
  };
}

describe('isAiVideo', () => {
  it('keeps videos in a core AI category', () => {
    const neuralNet = video({
      title: 'Deep Dive into LLMs like ChatGPT',
      categories: [{ id: 'llms-generative-ai', area: 'ai-data' }],
    });
    expect(isAiVideo(neuralNet)).toBe(true);
  });

  it('drops the Hacker News truck video that is about road safety', () => {
    const trucks = video({
      vid: 'jN7mSXMruEo',
      title: 'These Stupid Trucks are Literally Killing Us',
      primary_topic: 'SUVs and light truck regulation',
      tags: ['suvs', 'pickup trucks', 'road safety', 'cafe standards', 'urbanism'],
      categories: [
        { id: 'transit-urbanism', area: 'engineering-making' },
        { id: 'automotive-ev', area: 'engineering-making' },
      ],
    });
    expect(isAiVideo(trucks)).toBe(false);
  });

  it('drops city-planning videos that only mention self-driving cars', () => {
    const cities = video({
      title: 'How Self-Driving Cars will Destroy Cities (and what to do about it)',
      primary_topic: 'self-driving cars and cities',
      tags: ['urban planning', 'autonomous vehicles'],
      categories: [
        { id: 'transit-urbanism', area: 'engineering-making' },
        { id: 'self-driving-cars', area: 'ai-data' },
      ],
    });
    expect(isAiVideo(cities)).toBe(false);
  });

  it('drops math and language videos that only mention AI in passing', () => {
    const algebra = video({
      title: 'Vectors | Chapter 1, Essence of linear algebra',
      primary_topic: 'linear algebra',
      tags: ['vectors', 'linear algebra', 'machine learning math'],
      categories: [
        { id: 'pure-mathematics', area: 'math-theory' },
        { id: 'recreational-math', area: 'math-theory' },
      ],
    });
    const zig = video({
      title: 'Zig 2026: No-AI Policy',
      primary_topic: 'zig programming language',
      tags: ['zig', 'ai policy'],
      categories: [{ id: 'systems-programming-languages', area: 'software' }],
    });
    expect(isAiVideo(algebra)).toBe(false);
    expect(isAiVideo(zig)).toBe(false);
  });

  it('keeps a self-driving video that is about the technology', () => {
    const waymo = video({
      title: 'How Google\'s Self-Driving Car Works',
      categories: [{ id: 'self-driving-cars', area: 'ai-data' }],
    });
    expect(isAiVideo(waymo)).toBe(true);
  });

  it('drops comedy talks that were only tagged as machine learning', () => {
    const mickens = video({
      vid: 'ajGX7odA87k',
      title: 'USENIX Security \'18-Q: Why Do Keynote Speakers Keep Suggesting That Improving Security Is Possible?',
      primary_topic: 'security and ml skepticism',
      tags: ['james mickens', 'security', 'machine learning', 'humor', 'keynote'],
      categories: [
        { id: 'security-hacking', area: 'systems-security' },
        { id: 'satire-parody', area: 'arts-entertainment' },
        { id: 'machine-learning', area: 'ai-data' },
      ],
    });
    expect(isAiVideo(mickens)).toBe(false);
  });

  it('keeps cybersecurity, robotics, and framework programming', () => {
    const stuxnet = video({
      title: 'Adventures in analyzing Stuxnet',
      categories: [{ id: 'security-hacking', area: 'systems-security' }],
    });
    const robot = video({
      title: 'Introduction to Robotics',
      categories: [{ id: 'robotics', area: 'ai-data' }],
    });
    const tensorflow = video({
      title: 'Tensorflow and deep learning - without a PhD',
      categories: [{ id: 'machine-learning', area: 'ai-data' }],
    });
    expect(isAiVideo(stuxnet)).toBe(true);
    expect(isAiVideo(robot)).toBe(true);
    expect(isAiVideo(tensorflow)).toBe(true);
  });

  it('drops signal-processing videos that are not machine learning', () => {
    const jpeg = video({
      title: 'JPEG DCT, Discrete Cosine Transform (JPEG Pt2)- Computerphile',
      categories: [
        { id: 'information-theory', area: 'math-theory' },
        { id: 'computer-vision-speech', area: 'ai-data' },
      ],
    });
    expect(isAiVideo(jpeg)).toBe(false);
  });
});
