import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const dir = 'C:/Users/hp/.gemini/antigravity-ide/brain/d9403a6d-9fd5-41d7-b328-cb270683eacc/.tempmediaStorage';
const files = fs.readdirSync(dir);

for (const file of files) {
  const meta = await sharp(path.join(dir, file)).metadata();
  console.log(`${file}: ${meta.width}x${meta.height}, ${meta.format}, size: ${meta.size}`);
}
