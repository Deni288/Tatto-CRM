import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');
const LOGO_PATH = join(ICONS_DIR, 'logo.png');
mkdirSync(ICONS_DIR, { recursive: true });

const BG = '#0a0a0a';

const icons = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable-192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
];

for (const icon of icons) {
  if (icon.maskable) {
    // Maskable icons need ~10% safe zone padding on each side
    // Logo occupies 80% of the canvas, centered on background
    const logoSize = Math.round(icon.size * 0.8);
    const offset = Math.round((icon.size - logoSize) / 2);

    const resizedLogo = await sharp(LOGO_PATH)
      .resize(logoSize, logoSize, { fit: 'contain', background: BG })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: icon.size,
        height: icon.size,
        channels: 4,
        background: BG,
      },
    })
      .composite([{ input: resizedLogo, left: offset, top: offset }])
      .png()
      .toFile(join(ICONS_DIR, icon.name));
  } else {
    // Regular icons — just resize the logo directly
    await sharp(LOGO_PATH)
      .resize(icon.size, icon.size, { fit: 'contain', background: BG })
      .png()
      .toFile(join(ICONS_DIR, icon.name));
  }

  console.log(`Created ${icon.name}`);
}

console.log('Done — all icons generated from logo.png');
