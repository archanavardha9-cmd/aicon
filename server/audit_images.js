import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const dir = 'c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products';
const files = fs.readdirSync(dir).filter(f => !f.endsWith('.json'));

console.log('--- AUDITING PRODUCT IMAGES ---');
for (const file of files) {
  const filePath = path.join(dir, file);
  const metadata = await sharp(filePath).metadata();
  console.log(`\nFile: ${file}`);
  console.log(`  Format: ${metadata.format}, Size: ${metadata.width}x${metadata.height}, Channels: ${metadata.channels}, HasAlpha: ${metadata.hasAlpha}`);
  
  // Inspect corners and borders
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const pixelAt = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return Array.from(data.subarray(idx, idx + info.channels));
  };
  
  const topLeft = pixelAt(0, 0);
  const topRight = pixelAt(info.width - 1, 0);
  const bottomLeft = pixelAt(0, info.height - 1);
  const bottomRight = pixelAt(info.width - 1, info.height - 1);
  const center = pixelAt(Math.floor(info.width / 2), Math.floor(info.height / 2));
  
  console.log(`  TopLeft pixel: ${JSON.stringify(topLeft)}`);
  console.log(`  TopRight pixel: ${JSON.stringify(topRight)}`);
  console.log(`  BottomLeft pixel: ${JSON.stringify(bottomLeft)}`);
  console.log(`  BottomRight pixel: ${JSON.stringify(bottomRight)}`);
}
