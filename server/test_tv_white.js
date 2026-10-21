import sharp from 'sharp';

const input = 'C:/Users/hp/.gemini/antigravity-ide/brain/d9403a6d-9fd5-41d7-b328-cb270683eacc/scratch/tv_post.jpg';

// Crop TV with its full frame and stand
const tvCrop = await sharp(input)
  .extract({ left: 10, top: 372, width: 376, height: 240 })
  .toBuffer();

// Composite onto a 800x600 pure white background canvas
await sharp({
  create: {
    width: 800,
    height: 600,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
  .composite([
    {
      input: await sharp(tvCrop).resize(720, null, { fit: 'contain' }).toBuffer(),
      gravity: 'center'
    }
  ])
  .jpeg({ quality: 95 })
  .toFile('c:/Users/hp/OneDrive/Desktop/aicon/server/test_tv_white.jpg');

console.log('test_tv_white.jpg generated');
