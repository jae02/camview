import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runOcr() {
  const imagesDir = path.join(__dirname, 'public/images/slrclub');
  const dataDir = path.join(__dirname, 'data/slrclub');

  if (!fs.existsSync(imagesDir)) {
    console.log('No images directory found.');
    return;
  }

  const slugs = fs.readdirSync(imagesDir);
  console.log(`Found ${slugs.length} camera image folders.`);

  // Initialize Tesseract worker
  const worker = await createWorker('kor+eng');

  for (const slug of slugs) {
    const slugDir = path.join(imagesDir, slug);
    if (!fs.statSync(slugDir).isDirectory()) continue;

    const images = fs.readdirSync(slugDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    if (images.length === 0) continue;

    console.log(`Processing ${slug} (${images.length} images)...`);
    
    let combinedText = '';
    for (const image of images) {
      const imagePath = path.join(slugDir, image);
      try {
        const { data: { text } } = await worker.recognize(imagePath);
        combinedText += `\n\n--- OCR Image: ${image} ---\n` + text;
      } catch (e) {
        console.error(`Failed to OCR ${imagePath}:`, e);
      }
    }

    // Append OCR text to JSON file
    const jsonPath = path.join(dataDir, `${slug}.json`);
    if (fs.existsSync(jsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      jsonData.critique_ocr_text = combinedText.trim();
      fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
      console.log(`Updated JSON for ${slug} with OCR text.`);
    }
  }

  await worker.terminate();
  console.log('OCR processing complete.');
}

runOcr().catch(console.error);
