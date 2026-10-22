import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = "c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products";
const targets = [
  "aicon-split-ac-1t.png",
  "aicon-quartz-metal-heater.png",
  "aicon-electric-kettle-1.5l.png",
  "aicon-electric-kettle-1.8l.png",
];

for (const file of targets) {
  try {
    const filePath = path.join(dir, file);
    const image = sharp(filePath);
    const meta = await image.metadata();
    const { width, height } = meta;
    
    // Get raw pixel data
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Make near-black pixels transparent or white
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      // If pixel is very dark (black/dark grey background)
      if (r < 30 && g < 30 && b < 30) {
        // Make it white
        data[i] = 255;
        data[i+1] = 255;
        data[i+2] = 255;
        data[i+3] = 255;
      }
    }
    
    const result = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    })
      .png()
      .toBuffer();
    
    fs.writeFileSync(filePath, result);
    console.log("done", file);
  } catch (e) {
    console.error("err", file, e.message);
  }
}
