import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const sourceImage = 'C:\\Users\\qwoph\\.gemini\\antigravity-ide\\brain\\5de09c8f-7135-4d63-8957-5e491ae28eb1\\.user_uploaded\\media_1787175569584.png';
const publicDir = path.join(projectRoot, 'public');
const srcAppDir = path.join(projectRoot, 'src', 'app');

async function main() {
  console.log('Reading Pryvault logo source image...');
  const imgBuffer = fs.readFileSync(sourceImage);

  // 1. Save main public logos
  await sharp(imgBuffer).png().toFile(path.join(publicDir, 'logo.png'));
  await sharp(imgBuffer).png().toFile(path.join(publicDir, 'pryvault-logo.png'));
  await sharp(imgBuffer).jpeg({ quality: 95 }).toFile(path.join(publicDir, 'logo.jpg'));
  await sharp(imgBuffer).jpeg({ quality: 95 }).toFile(path.join(publicDir, 'cvvault-logo.jpeg'));

  // 2. Favicon & Web icon
  await sharp(imgBuffer).resize(512, 512).png().toFile(path.join(srcAppDir, 'icon.png'));
  await sharp(imgBuffer).resize(64, 64).png().toFile(path.join(srcAppDir, 'favicon.ico'));
  await sharp(imgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon.png'));

  // 3. Android Mipmaps
  const DENSITIES = [
    { dir: 'mipmap-mdpi', legacySize: 48, adaptiveSize: 108 },
    { dir: 'mipmap-hdpi', legacySize: 72, adaptiveSize: 162 },
    { dir: 'mipmap-xhdpi', legacySize: 96, adaptiveSize: 216 },
    { dir: 'mipmap-xxhdpi', legacySize: 144, adaptiveSize: 324 },
    { dir: 'mipmap-xxxhdpi', legacySize: 192, adaptiveSize: 432 },
  ];

  const resPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
  if (fs.existsSync(resPath)) {
    for (const { dir, legacySize, adaptiveSize } of DENSITIES) {
      const dirPath = path.join(resPath, dir);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

      // Foreground: scaled inside safe area
      const fgLogoSize = Math.round(adaptiveSize * 0.70);
      const resizedFg = await sharp(imgBuffer)
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
        .composite([{ input: resizedFg, gravity: 'center' }])
        .png()
        .toFile(path.join(dirPath, 'ic_launcher_foreground.png'));

      // Legacy icon (rounded rect)
      const cornerRadius = Math.round(legacySize * 0.2);
      const roundedRectSvg = Buffer.from(
        `<svg><rect x="0" y="0" width="${legacySize}" height="${legacySize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#FFFFFF"/></svg>`
      );

      const baseImg = await sharp(imgBuffer)
        .resize(legacySize, legacySize, { fit: 'cover' })
        .toBuffer();

      await sharp(baseImg)
        .composite([{ input: roundedRectSvg, blend: 'dest-in' }])
        .png()
        .toFile(path.join(dirPath, 'ic_launcher.png'));

      // Round icon (circle)
      const circleSvg = Buffer.from(
        `<svg><circle cx="${legacySize / 2}" cy="${legacySize / 2}" r="${legacySize / 2}" fill="#FFFFFF"/></svg>`
      );

      await sharp(baseImg)
        .composite([{ input: circleSvg, blend: 'dest-in' }])
        .png()
        .toFile(path.join(dirPath, 'ic_launcher_round.png'));

      console.log(`Generated Android mipmap icons for ${dir}`);
    }
  }

  console.log('Pryvault assets generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
