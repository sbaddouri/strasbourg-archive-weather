const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DAY_DIR = path.join(__dirname, '..', 'public', 'weather-icons', 'day');
const NIGHT_DIR = path.join(__dirname, '..', 'public', 'weather-icons', 'night');

const MAX_SIZE_KB = 200; // Target max 200KB (Vercel limit is 250KB)
const MAX_DIMENSION = 60; // Resize to 60x60 max (slightly smaller to ensure all under limit)

async function optimizeIcon(inputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const sizeKB = stats.size / 1024;
    
    if (sizeKB <= MAX_SIZE_KB) {
      return;
    }

    const outputPath = inputPath + '.tmp';
    await sharp(inputPath)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ compressionLevel: 9, palette: true })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSizeKB = newStats.size / 1024;
    
    // Replace original with optimized
    fs.renameSync(outputPath, inputPath);
    
    console.log(`✓ ${path.basename(inputPath)}: ${sizeKB.toFixed(1)}KB → ${newSizeKB.toFixed(1)}KB`);
  } catch (error) {
    console.error(`✗ ${path.basename(inputPath)}: ${error.message}`);
  }
}

async function optimizeDirectory(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  console.log(`\nOptimizing ${files.length} files in ${path.basename(dir)}...`);
  
  for (const file of files) {
    const inputPath = path.join(dir, file);
    await optimizeIcon(inputPath);
  }
}

async function main() {
  console.log('Optimizing weather icons for Vercel deployment...');
  console.log(`Max target size: ${MAX_SIZE_KB}KB, Max dimension: ${MAX_DIMENSION}px`);
  
  await optimizeDirectory(DAY_DIR);
  await optimizeDirectory(NIGHT_DIR);
  
  console.log('\nDone! Verifying all files under limit...');
  
  for (const dir of [DAY_DIR, NIGHT_DIR]) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    for (const file of files) {
      const stats = fs.statSync(path.join(dir, file));
      const sizeKB = stats.size / 1024;
      if (sizeKB > MAX_SIZE_KB) {
        console.warn(`⚠ ${file}: ${sizeKB.toFixed(1)}KB still exceeds ${MAX_SIZE_KB}KB`);
      }
    }
  }
}

main().catch(console.error);