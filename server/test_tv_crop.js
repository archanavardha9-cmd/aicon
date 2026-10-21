import sharp from 'sharp';

const input = 'C:/Users/hp/.gemini/antigravity-ide/brain/d9403a6d-9fd5-41d7-b328-cb270683eacc/scratch/tv_post.jpg';

// Let's test a crop of the TV from tv_post.jpg
await sharp(input)
  .extract({ left: 6, top: 370, width: 382, height: 236 })
  .resize(800, null)
  .toFile('c:/Users/hp/OneDrive/Desktop/aicon/server/test_tv_crop.jpg');

console.log('test_tv_crop.jpg created');
