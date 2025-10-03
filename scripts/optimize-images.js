#!/usr/bin/env node
/*
  Image optimization script.
  Requires `sharp` to be installed. It will read `public/assets/hero.jpg` and
  emit hero-640.jpg, hero-1024.jpg, hero-1920.jpg and their .webp equivalents.
*/
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

const publicAssets = path.resolve(process.cwd(), 'public', 'assets');
const src = path.join(publicAssets, 'hero.jpg');

if (!fs.existsSync(src)) {
  console.error('Source hero.jpg not found in public/assets. Skipping.');
  process.exit(0);
}

const sizes = [640, 1024, 1920];

async function writeHashed(filePath, ext) {
  const buffer = await fs.promises.readFile(filePath);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 8);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath).replace(/\.(jpg|webp|avif)$/, '');
  const newName = `${base}.${hash}.${ext}`;
  const dest = path.join(dir, newName);
  await fs.promises.writeFile(dest, buffer);
  await fs.promises.unlink(filePath); // remove unhashed
  return newName;
}

async function run() {
  // manifest structured as { avif: {640: 'hero-640.hash.avif', ...}, webp: {...}, jpg: {...} }
  const manifest = { avif: {}, webp: {}, jpg: {} };

  for (const w of sizes) {
    const tmpJpg = path.join(publicAssets, `hero-${w}.jpg`);
    const tmpWebp = path.join(publicAssets, `hero-${w}.webp`);
    const tmpAvif = path.join(publicAssets, `hero-${w}.avif`);

    console.log(`Writing ${tmpJpg}`);
    await sharp(src).resize({ width: w }).jpeg({ quality: 80, mozjpeg: true }).toFile(tmpJpg);

    console.log(`Writing ${tmpWebp}`);
    await sharp(src).resize({ width: w }).webp({ quality: 72 }).toFile(tmpWebp);

    console.log(`Writing ${tmpAvif}`);
    await sharp(src).resize({ width: w }).avif({ quality: 64 }).toFile(tmpAvif);

    // Hash and rename files (replace tmp files with hashed versions)
    const hashedJpg = await writeHashed(tmpJpg, 'jpg');
    const hashedWebp = await writeHashed(tmpWebp, 'webp');
    const hashedAvif = await writeHashed(tmpAvif, 'avif');

    manifest.jpg[w] = `/assets/${hashedJpg}`;
    manifest.webp[w] = `/assets/${hashedWebp}`;
    manifest.avif[w] = `/assets/${hashedAvif}`;
  }

  // write manifest into src/generated so it can be imported
  const genDir = path.resolve(process.cwd(), 'src', 'generated');
  if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });
  const manifestPath = path.join(genDir, 'hero-manifest.json');
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('Image optimization complete. Manifest written to', manifestPath);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
