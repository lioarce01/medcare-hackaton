import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// Convert PNG to WebP
async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log(`Converted ${inputPath} to WebP`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
}

// Process all PNG files in the public directory
async function processImages() {
  const files = fs.readdirSync(publicDir);
  
  for (const file of files) {
    if (file.endsWith('.png')) {
      const inputPath = path.join(publicDir, file);
      const outputPath = path.join(publicDir, file.replace('.png', '.webp'));
      await convertToWebP(inputPath, outputPath);
    }
  }
}

processImages().catch(console.error); 