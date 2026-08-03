import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const LOGO_URL = 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg';

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return fetchBuffer(response.headers.location).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
      }
      const data = [];
      response.on('data', chunk => data.push(chunk));
      response.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

const DENSITIES = [
  { dir: 'mipmap-mdpi', legacySize: 48, adaptiveSize: 108 },
  { dir: 'mipmap-hdpi', legacySize: 72, adaptiveSize: 162 },
  { dir: 'mipmap-xhdpi', legacySize: 96, adaptiveSize: 216 },
  { dir: 'mipmap-xxhdpi', legacySize: 144, adaptiveSize: 324 },
  { dir: 'mipmap-xxxhdpi', legacySize: 192, adaptiveSize: 432 },
];

async function main() {
  console.log('Downloading original CVVault logo...');
  const logoBuffer = await fetchBuffer(LOGO_URL);
  console.log('Logo downloaded successfully (size:', logoBuffer.length, 'bytes). Processing icons...');

  const resPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

  for (const { dir, legacySize, adaptiveSize } of DENSITIES) {
    const dirPath = path.join(resPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 1. Adaptive Foreground Layer (ic_launcher_foreground.png)
    // Canvas: adaptiveSize (e.g. 432x432). Logo: 58% of canvas size to fit within safe-zone circle (66%)
    const fgLogoSize = Math.round(adaptiveSize * 0.58);
    const resizedFgLogo = await sharp(logoBuffer)
      .resize(fgLogoSize, fgLogoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: adaptiveSize,
        height: adaptiveSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: resizedFgLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(dirPath, 'ic_launcher_foreground.png'));

    // 2. Standard Legacy Icon (ic_launcher.png) - Square with rounded corners & white background
    const legacyLogoSize = Math.round(legacySize * 0.72);
    const resizedLegacyLogo = await sharp(logoBuffer)
      .resize(legacyLogoSize, legacyLogoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    const cornerRadius = Math.round(legacySize * 0.2);
    const roundedRectSvg = Buffer.from(
      `<svg><rect x="0" y="0" width="${legacySize}" height="${legacySize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#FFFFFF"/></svg>`
    );

    const baseBackground = await sharp({
      create: {
        width: legacySize,
        height: legacySize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resizedLegacyLogo, gravity: 'center' }])
      .png()
      .toBuffer();

    await sharp(baseBackground)
      .composite([{ input: roundedRectSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(dirPath, 'ic_launcher.png'));

    // 3. Round Icon (ic_launcher_round.png) - Circle mask
    const circleSvg = Buffer.from(
      `<svg><circle cx="${legacySize / 2}" cy="${legacySize / 2}" r="${legacySize / 2}" fill="#FFFFFF"/></svg>`
    );

    const roundBase = await sharp({
      create: {
        width: legacySize,
        height: legacySize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resizedLegacyLogo, gravity: 'center' }])
      .png()
      .toBuffer();

    await sharp(roundBase)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(dirPath, 'ic_launcher_round.png'));

    console.log(`Generated perfectly sized icons for ${dir}`);
  }

  console.log('All Android app icons generated and centered with proper safe-zone padding!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
