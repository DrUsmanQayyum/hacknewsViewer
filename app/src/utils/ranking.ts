import type { CatalogVideo } from '../types';

const categoryIds = new Set([
  'machine-learning',
  'deep-learning',
  'natural-language-processing',
  'computer-vision',
  'robotics',
  'ai-ethics-safety',
  'research-papers',
  'llms-generative-ai',
]);

const phrases = [
  'machine learning',
  'deep learning',
  'neural network',
  'artificial intelligence',
  'computer vision',
  'reinforcement learning',
  'self-driving',
  'fine-tuning',
  'fine tuning',
  'prompt engineering',
];

const words = new Set([
  'ai', 'ml', 'llm', 'gpt', 'nlp', 'cv', 'gan', 'vae', 'bert', 'rag',
  'transformer', 'robotics', 'autonomous', 'diffusion', 'generative',
  'resnet', 'attention', 'pytorch', 'tensorflow', 'keras', 'embedding',
  'chatbot', 'anthropic', 'openai', 'deepmind',
]);

export function isAiVideo(video: CatalogVideo): boolean {
  if (video.categories.some((category) => categoryIds.has(category.id))) return true;
  const blob = [video.title, video.primary_topic, ...video.tags].join('\n').toLowerCase();
  if (phrases.some((phrase) => blob.includes(phrase))) return true;
  return blob.split(/[^a-z0-9+]+/).some((token) => words.has(token));
}

export function compareForFeed(a: CatalogVideo, b: CatalogVideo): number {
  const byYear = b.hn.last_year - a.hn.last_year;
  if (byYear !== 0) return byYear;
  const byAi = Number(isAiVideo(b)) - Number(isAiVideo(a));
  if (byAi !== 0) return byAi;
  const byViews = b.hn.recommenders - a.hn.recommenders;
  if (byViews !== 0) return byViews;
  const byScore = b.score - a.score;
  if (byScore !== 0) return byScore;
  if (a.vid < b.vid) return -1;
  if (a.vid > b.vid) return 1;
  return 0;
}
