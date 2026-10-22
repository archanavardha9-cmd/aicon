import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = "c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products";
const targets = [
  "aicon-split-ac-1t.png",
  "aicon-quartz-metal-heater.png",
  "aicon-electric-kettle-1.5l.png",
  "aicon-electric-kettle-1.8l.png",
  "aicon-dry-iron.jpg",
  "aicon-juicer-mixer-grinder.jpg",
];

const containerBg = { r: 244, g: 248, b: 251 }; // #f4f8fb

for (const file of targets) {
  try {
    const filePath = path.join(dir, file);
    const ext = path.extname(file).toLowerCase();
    const image = sharp(filePath);
    const meta = await image.metadata();
    const { width, height } = meta;
    
    // Convert to PNG and composite onto container background
    const result = await sharp({
      create: { width, height, channels: 4, background: containerBg }
    })
      .composite([{ input: filePath, blend: "over" }])
      .png()
      .toBuffer();
    
    const outPath = ext === '.jpg' ? filePath.replace('.jpg', '.png') : filePath;
    fs.writeFileSync(outPath, result);
    if (ext === '.jpg' && outPath !== filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log("done", file, "->", path.basename(outPath));
  } catch (e) {
    console.error("err", file, e.message);
  }
}
