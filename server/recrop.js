import sharp from 'sharp';

const input = 'C:/Users/hp/.gemini/antigravity-ide/brain/d9403a6d-9fd5-41d7-b328-cb270683eacc/scratch/tv_post.jpg';
const outDir = 'c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products';

// 1. AICON 4K Smart TV:
// tv_post is 600x900.
// TV starts at x: 5, y: 333, width: 380, height: 264.
// Let's crop it tightly so there's no blue badge at bottom right.
await sharp(input)
  .extract({ left: 6, top: 334, width: 378, height: 262 })
  .resize(756, 524, { kernel: sharp.kernel.lanczos3 })
  .sharpen()
  .toFile(`${outDir}/aicon-4k-smart-tv.jpg`);

// 2. AICON Semi-Automatic Washing Machine
await sharp(input)
  .extract({ left: 26, top: 743, width: 102, height: 93 })
  .resize(400, 365, { kernel: sharp.kernel.lanczos3 })
  .sharpen()
  .toFile(`${outDir}/aicon-semi-automatic-washing-machine.jpg`);

// 3. AICON Desert Air Cooler
await sharp(input)
  .extract({ left: 232, top: 751, width: 71, height: 83 })
  .resize(320, 374, { kernel: sharp.kernel.lanczos3 })
  .sharpen()
  .toFile(`${outDir}/aicon-air-cooler.jpg`);

// 4. AICON Split Air Conditioner
await sharp(input)
  .extract({ left: 390, top: 760, width: 174, height: 58 })
  .resize(522, 174, { kernel: sharp.kernel.lanczos3 })
  .sharpen()
  .toFile(`${outDir}/aicon-split-air-conditioner.jpg`);

console.log('Images recropped and saved cleanly!');
