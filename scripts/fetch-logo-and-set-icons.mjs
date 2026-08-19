import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const DENSITIES = [
  { dir: 'mipmap-mdpi', legacySize: 48, adaptiveSize: 108 },
  { dir: 'mipmap-hdpi', legacySize: 72, adaptiveSize: 162 },
  { dir: 'mipmap-xhdpi', legacySize: 96, adaptiveSize: 216 },
  { dir: 'mipmap-xxhdpi', legacySize: 144, adaptiveSize: 324 },
  { dir: 'mipmap-xxxhdpi', legacySize: 192, adaptiveSize: 432 },
];

async function main() {
  console.log('Loading Pryvault logo...');
  const logoPath = path.join(projectRoot, 'public', 'logo.png');
  const logoBuffer = fs.readFileSync(logoPath);
  console.log('Pryvault logo loaded successfully. Processing Android icons...');

  const resPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

  for (const { dir, legacySize, adaptiveSize } of DENSITIES) {
    const dirPath = path.join(resPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 1. Adaptive Foreground Layer (ic_launcher_foreground.png)
    const fgLogoSize = Math.round(adaptiveSize * 0.70);
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

    // 2. Standard Legacy Icon (ic_launcher.png)
    const cornerRadius = Math.round(legacySize * 0.2);
    const roundedRectSvg = Buffer.from(
      `<svg><rect x="0" y="0" width="${legacySize}" height="${legacySize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#FFFFFF"/></svg>`
    );

    const baseBackground = await sharp(logoBuffer)
      .resize(legacySize, legacySize, { fit: 'cover' })
      .toBuffer();

    await sharp(baseBackground)
      .composite([{ input: roundedRectSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(dirPath, 'ic_launcher.png'));

    // 3. Round Icon (ic_launcher_round.png)
    const circleSvg = Buffer.from(
      `<svg><circle cx="${legacySize / 2}" cy="${legacySize / 2}" r="${legacySize / 2}" fill="#FFFFFF"/></svg>`
    );

    await sharp(baseBackground)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(dirPath, 'ic_launcher_round.png'));

    console.log(`Generated perfectly sized icons for ${dir}`);
  }

  console.log('All Pryvault Android app icons generated and centered with proper safe-zone padding!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
