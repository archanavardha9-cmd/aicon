import fs from 'node:fs';
import path from 'node:path';

const artifactsDir = 'C:/Users/hp/.gemini/antigravity-ide/brain/d9403a6d-9fd5-41d7-b328-cb270683eacc';
const targetDir = 'c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const copyMap = {
  'washing_machine_studio_1792398522708.jpg': 'aicon-twin-tub-washing-machine.jpg',
  'air_cooler_studio_1792398548368.jpg': 'aicon-desert-cooler-70l.jpg',
  'split_ac_studio_1792398575558.jpg': 'aicon-inverter-split-ac.jpg',
  'mixer_grinder_studio_1792398602929.jpg': 'aicon-smart-mixer-grinder-750w.jpg',
  'water_heater_studio_1792398631051.jpg': 'aicon-storage-water-heater-25l.jpg',
  'ceiling_fan_studio_1792398650202.jpg': 'aicon-aeroflow-ceiling-fan.jpg',
};

for (const [src, dest] of Object.entries(copyMap)) {
  const srcPath = path.join(artifactsDir, src);
  const destPath = path.join(targetDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} -> ${dest}`);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
}

// Generate image manifest
const files = fs.readdirSync(targetDir);
const manifest = {
  updatedAt: new Date().toISOString(),
  totalProductsWithImages: files.length,
  images: files.map(file => ({
    filename: file,
    path: `/images/products/${file}`,
    sizeBytes: fs.statSync(path.join(targetDir, file)).size
  }))
};

fs.writeFileSync(
  path.join(targetDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('Image manifest created with', files.length, 'images.');
