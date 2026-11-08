#!/usr/bin/env node
/**
 * Refresh the bundled HackerTube snapshot.
 *
 *   node scripts/refresh-dataset.mjs
 *   node scripts/refresh-dataset.mjs --refilter
 *
 * Downloads https://hackertube.org/download/hackertube-data.zip when the zip
 * is not already in data/, then writes:
 *   app/src/data/catalog.json   light fields for the grid and search
 *   app/src/data/details.json   summaries, quotes, and recommendation text
 *   app/src/data/related.json   co-recommendation ids
 *   app/src/data/similar.json   nearest embedding ids
 *   app/src/data/taxonomy.json
 *
 * By default the video set stays the curated ids already in catalog.json or
 * videos.json. Pass --refilter to select AI-related videos from videos.jsonl.
 */

import { execFile } from 'node:child_process';
import { createReadStream, existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const zipPath = path.join(dataDir, 'hackertube-data.zip');
const extractDir = path.join(dataDir, 'hackertube-data');
const outDir = path.join(root, 'app', 'src', 'data');
const datasetUrl = 'https://hackertube.org/download/hackertube-data.zip';
const refilter = process.argv.includes('--refilter');

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
  'paper review',
];

const words = new Set([
  'ai', 'ml', 'llm', 'gpt', 'nlp', 'cv', 'gan', 'vae', 'bert', 'rag',
  'transformer', 'robotics', 'autonomous', 'diffusion', 'generative',
  'resnet', 'attention', 'pytorch', 'tensorflow', 'keras', 'scikit',
  'embedding', 'chatbot', 'anthropic', 'openai', 'deepmind', 'arxiv',
]);

function isAiVideo(video) {
  const categories = video.categories ?? [];
  if (categories.some((category) => categoryIds.has(category.id))) return true;
  const blob = [
    video.title,
    video.summary,
    video.primary_topic,
    ...(video.tags ?? []),
  ].join('\n').toLowerCase();
  if (phrases.some((phrase) => blob.includes(phrase))) return true;
  const tokens = blob.split(/[^a-z0-9+]+/);
  return tokens.some((token) => words.has(token));
}

function curatedIds() {
  for (const name of ['catalog.json', 'videos.json']) {
    const file = path.join(outDir, name);
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    const rows = Array.isArray(parsed) ? parsed : Object.values(parsed);
    return new Set(rows.map((video) => video.vid).filter(Boolean));
  }
  return null;
}

async function ensureZip() {
  await mkdir(dataDir, { recursive: true });
  if (existsSync(zipPath)) return;
  console.log('Downloading HackerTube dataset...');
  const response = await fetch(datasetUrl, {
    headers: { 'User-Agent': 'HN-Videos-dataset-refresh' },
  });
  if (!response.ok) throw new Error(`Dataset download failed (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(zipPath, bytes);
}

async function extract() {
  await execFileAsync('unzip', ['-o', '-q', zipPath, '-d', dataDir]);
}

async function readJsonl(file) {
  const videos = [];
  const lines = createInterface({ input: createReadStream(file) });
  for await (const line of lines) {
    if (line) videos.push(JSON.parse(line));
  }
  return videos;
}

function toCatalog(video) {
  return {
    vid: video.vid,
    url: video.url,
    title: video.title,
    channel: video.channel,
    content_type: video.content_type,
    level: video.level,
    shelf_life: video.shelf_life,
    primary_topic: video.primary_topic,
    tags: video.tags ?? [],
    categories: (video.categories ?? []).map((category) => ({
      id: category.id,
      area: category.area,
    })),
    hn: {
      mentions: video.hn?.mentions ?? 0,
      recommenders: video.hn?.recommenders ?? 0,
      rec_months: video.hn?.rec_months ?? 0,
      strong_recs: video.hn?.strong_recs ?? 0,
      first_year: video.hn?.first_year ?? 0,
      last_year: video.hn?.last_year ?? 0,
    },
    score: video.score ?? 0,
  };
}

function toDetails(video) {
  return {
    summary: video.summary ?? '',
    why_hn: video.why_hn ?? '',
    quote: video.quote?.text ? video.quote : null,
    stances: video.hn?.stances ?? {},
  };
}

function readRelated(file, allowed) {
  const related = {};
  const text = readFileSync(file, 'utf8');
  for (const line of text.split('\n')) {
    if (!line) continue;
    const row = JSON.parse(line);
    if (!allowed.has(row.vid)) continue;
    const ids = (row.related ?? [])
      .filter((item) => allowed.has(item.vid))
      .sort((a, b) => b.shared_recommenders - a.shared_recommenders)
      .slice(0, 20)
      .map((item) => item.vid);
    if (ids.length > 0) related[row.vid] = ids;
  }
  return related;
}

async function similarIds(videos, embeddingPath, idsPath) {
  const code = `
import json, sys
import numpy as np
videos_path, emb_path, ids_path, out_path = sys.argv[1:]
wanted = json.load(open(videos_path))
ids = json.load(open(ids_path))
row = {vid: index for index, vid in enumerate(ids)}
order = [vid for vid in wanted if vid in row]
matrix = np.load(emb_path).astype(np.float32)
picked = matrix[[row[vid] for vid in order]]
norms = np.linalg.norm(picked, axis=1, keepdims=True)
norms[norms == 0] = 1
picked /= norms
scores = picked @ picked.T
np.fill_diagonal(scores, -np.inf)
neighbor_count = min(10, max(len(order) - 1, 0))
result = {}
if neighbor_count:
    chosen = np.argpartition(-scores, kth=neighbor_count - 1, axis=1)[:, :neighbor_count]
    for index, vid in enumerate(order):
        neighbors = chosen[index]
        neighbors = neighbors[np.argsort(-scores[index, neighbors])]
        result[vid] = [order[int(neighbor)] for neighbor in neighbors]
json.dump(result, open(out_path, "w"))
print(len(result))
`;
  const idFile = path.join(dataDir, 'similar-ids.json');
  const outFile = path.join(dataDir, 'similar.json');
  writeFileSync(idFile, JSON.stringify(videos.map((video) => video.vid)));
  await execFileAsync('python3', ['-c', code, idFile, embeddingPath, idsPath, outFile], {
    maxBuffer: 1024 * 1024,
  });
  const similar = JSON.parse(readFileSync(outFile, 'utf8'));
  unlinkSync(idFile);
  unlinkSync(outFile);
  return similar;
}

async function main() {
  await ensureZip();
  await extract();
  const source = await readJsonl(path.join(extractDir, 'videos.jsonl'));
  const keep = refilter ? null : curatedIds();
  const selected = keep
    ? source.filter((video) => keep.has(video.vid))
    : source.filter((video) => isAiVideo(video));
  if (keep) {
    const found = new Set(selected.map((video) => video.vid));
    const missing = [...keep].filter((vid) => !found.has(vid)).length;
    console.log(`Keeping ${selected.length} curated videos (${missing} ids missing from the snapshot)`);
  } else {
    console.log(`Refiltered to ${selected.length} AI-related videos`);
  }

  const catalog = selected.map(toCatalog);
  const details = {};
  for (const video of selected) details[video.vid] = toDetails(video);
  const allowed = new Set(selected.map((video) => video.vid));
  const related = readRelated(path.join(extractDir, 'related.jsonl'), allowed);
  console.log('Computing similar videos...');
  const similar = await similarIds(
    selected,
    path.join(extractDir, 'embeddings.npy'),
    path.join(extractDir, 'embedding_ids.json'),
  );

  writeFileSync(path.join(outDir, 'catalog.json'), JSON.stringify(catalog));
  writeFileSync(path.join(outDir, 'details.json'), JSON.stringify(details));
  writeFileSync(path.join(outDir, 'related.json'), JSON.stringify(related));
  writeFileSync(path.join(outDir, 'similar.json'), JSON.stringify(similar));
  const taxonomy = path.join(extractDir, 'taxonomy.json');
  if (existsSync(taxonomy)) {
    writeFileSync(path.join(outDir, 'taxonomy.json'), readFileSync(taxonomy));
  }
  const legacy = path.join(outDir, 'videos.json');
  if (existsSync(legacy)) unlinkSync(legacy);
  console.log('Wrote catalog, details, related, and similar maps');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
