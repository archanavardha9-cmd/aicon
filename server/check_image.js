import sharp from 'sharp';

const meta = await sharp('C:/Users/hp/.gemini/antigravity-ide/brain/d9403a6d-9fd5-41d7-b328-cb270683eacc/scratch/tv_post.jpg').metadata();
console.log('Dimensions:', meta.width, 'x', meta.height);
