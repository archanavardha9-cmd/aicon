import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const dir = 'C:/Users/hp/.gemini/antigravity-ide/brain/d9403a6d-9fd5-41d7-b328-cb270683eacc';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

console.log('--- STUDIO SOURCE IMAGES IN D9403A6D ---');
for (const file of files) {
  const filePath = path.join(dir, file);
  const metadata = await sharp(filePath).metadata();
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const pixelAt = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return Array.from(data.subarray(idx, idx + info.channels));
  };
  const topLeft = pixelAt(0, 0);
  console.log(`\n${file} (${info.width}x${info.height}): TopLeft = ${JSON.stringify(topLeft)}`);
}
