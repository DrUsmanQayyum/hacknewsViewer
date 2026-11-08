import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = fileURLToPath(new URL('..', import.meta.url));
const template = readFileSync(join(appDir, 'dist/index.html'), 'utf8');
const catalog = JSON.parse(readFileSync(join(appDir, 'src/data/catalog.json'), 'utf8'));

const homeDescription = 'AI and machine learning videos discussed on Hacker News.';

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderPreview(preview) {
  return template
    .replaceAll('__OG_TITLE__', escapeHtml(preview.title))
    .replaceAll('__OG_DESCRIPTION__', escapeHtml(preview.description))
    .replaceAll('__OG_IMAGE__', preview.image)
    .replaceAll('__OG_IMAGE_WIDTH__', preview.width)
    .replaceAll('__OG_IMAGE_HEIGHT__', preview.height)
    .replaceAll('__OG_URL__', preview.url)
    .replace('<title>HN AI videos</title>', `<title>${escapeHtml(preview.title)}</title>`);
}

writeFileSync(
  join(appDir, 'dist/index.html'),
  renderPreview({
    title: 'HN AI videos',
    description: homeDescription,
    image: '__HN_ORIGIN__/og-cover.jpg',
    width: '1200',
    height: '630',
    url: '__HN_ORIGIN__/',
  }),
);

const watchDir = join(appDir, 'dist/watch');
mkdirSync(watchDir, { recursive: true });

for (const video of catalog) {
  const recommenders = video.hn?.recommenders ?? 0;
  const recommendationLabel = recommenders === 1 ? 'recommendation' : 'recommendations';
  writeFileSync(
    join(watchDir, `${video.vid}.html`),
    renderPreview({
      title: video.title,
      description: `${video.channel} · ${recommenders} Hacker News ${recommendationLabel}`,
      image: `__HN_ORIGIN__/thumb/${video.vid}.jpg`,
      width: '480',
      height: '360',
      url: `__HN_ORIGIN__/watch/${video.vid}`,
    }),
  );
}

console.log(`Wrote link previews for ${catalog.length} videos`);
