import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const OLD_SUPABASE_LOGO_REGEX = /https:\/\/slelguoygbfzlpylpxfs\.supabase\.co\/storage\/v1\/(?:render\/image\/public|object\/public)\/project-uploads\/WhatsApp-Image-2025-11-05-at-13\.03\.39-1770063498606\.jpeg(?:\?[^"'\s`]*)?/g;

const textReplacements = [
  // Exact case matchings
  { from: /CVVault/g, to: 'Pryvault' },
  { from: /CVVAULT/g, to: 'PRYVAULT' },
  { from: /cvvault\.vercel\.app/g, to: 'pryvault.vercel.app' },
  { from: /cvvault\.com/g, to: 'pryvault.com' },
  { from: /cvvault\.io/g, to: 'pryvault.io' },
  { from: /cvvault\.app/g, to: 'pryvault.app' },
  { from: /cv-vault\.vercel\.app/g, to: 'pryvault.vercel.app' },
  { from: /cvvault_new_registration/g, to: 'pryvault_new_registration' },
  { from: /cvvault_secure_verification_secret_key_2026/g, to: 'pryvault_secure_verification_secret_key_2026' },
  { from: /cvvault-logo\.jpeg/g, to: 'logo.png' },
];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (['node_modules', '.next', '.git', 'out', 'build'].includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, fileList);
    } else {
      const ext = path.extname(fullPath);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.xml', '.css', '.md', '.txt'].includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const files = walk(projectRoot);
let modifiedCount = 0;

for (const filePath of files) {
  // skip the rebrand script itself
  if (filePath.endsWith('rebrand-to-pryvault.mjs')) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace hardcoded old logo URLs with /logo.png
  content = content.replace(OLD_SUPABASE_LOGO_REGEX, '/logo.png');

  // 2. Replace text replacements
  for (const { from, to } of textReplacements) {
    content = content.replace(from, to);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
    console.log(`Updated: ${path.relative(projectRoot, filePath)}`);
  }
}

console.log(`\nRebranding complete! Modified ${modifiedCount} files.`);
