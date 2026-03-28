import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');
mkdirSync(ICONS_DIR, { recursive: true });

const BG = '#0a0a0a';
const GOLD = '#d4af37';

function createSVG(size, padding) {
  const textSize = Math.round(size / 4);
  const cx = size / 2;
  const cy = size / 2;
  const textY = cy + textSize / 3;
  const margin = Math.round(size * padding / 100);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}" rx="${Math.round(size / 8)}"/>
  <rect x="${margin}" y="${margin}" width="${size - margin * 2}" height="${size - margin * 2}" fill="none" stroke="${GOLD}" stroke-width="${Math.max(2, Math.round(size / 100))}" rx="${Math.round(size / 10)}"/>
  <text x="${cx}" y="${textY}" font-family="Arial, Helvetica, sans-serif" font-size="${textSize}" font-weight="bold" fill="${GOLD}" text-anchor="middle">TC</text>
</svg>`);
}

const icons = [
  { name: 'icon-192.png', size: 192, padding: 5 },
  { name: 'icon-512.png', size: 512, padding: 5 },
  { name: 'icon-maskable-192.png', size: 192, padding: 15 },
  { name: 'icon-maskable-512.png', size: 512, padding: 15 },
];

for (const icon of icons) {
  const svg = createSVG(icon.size, icon.padding);
  await sharp(svg)
    .png()
    .toFile(join(ICONS_DIR, icon.name));
  console.log(`Created ${icon.name}`);
}

console.log('Done — all icons are real PNGs now');
