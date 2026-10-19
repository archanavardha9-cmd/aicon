import sharp from 'sharp';
import fs from 'node:fs';

const input = 'C:/Users/hp/.gemini/antigravity-ide/brain/d9403a6d-9fd5-41d7-b328-cb270683eacc/scratch/tv_post.jpg';
const outDir = 'c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. AICON 4K Ultra HD Smart LED TV
// Coordinates in 600x900 image:
// TV starts around x: 5, y: 330, width: 388, height: 280
await sharp(input)
  .extract({ left: 5, top: 332, width: 385, height: 280 })
  .toFile(`${outDir}/aicon-4k-smart-tv.jpg`);

// 2. AICON Semi-Automatic Washing Machine
// Bottom left product
// Around x: 25, y: 740, width: 105, height: 95
await sharp(input)
  .extract({ left: 25, top: 742, width: 105, height: 95 })
  .resize(400, 400, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .toFile(`${outDir}/aicon-semi-automatic-washing-machine.jpg`);

// 3. AICON Desert Air Cooler
// Bottom middle product
// Around x: 230, y: 750, width: 75, height: 85
await sharp(input)
  .extract({ left: 232, top: 750, width: 72, height: 85 })
  .resize(400, 400, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .toFile(`${outDir}/aicon-air-cooler.jpg`);

// 4. AICON Split Air Conditioner
// Bottom right product
// Around x: 390, y: 760, width: 175, height: 60
await sharp(input)
  .extract({ left: 390, top: 760, width: 175, height: 60 })
  .resize(500, 300, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .toFile(`${outDir}/aicon-split-air-conditioner.jpg`);

console.log('Appliance crops extracted successfully!');
