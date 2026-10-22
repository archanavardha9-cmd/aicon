import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = "c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products";
const targets = [
  "aicon-split-ac-1t.png",
  "aicon-quartz-metal-heater.png",
  "aicon-electric-kettle-1.5l.png",
  "aicon-electric-kettle-1.8l.png",
  "aicon-dry-iron.png",
  "aicon-juicer-mixer-grinder.png",
];

const containerBg = { r: 244, g: 248, b: 251 };

for (const file of targets) {
  try {
    const filePath = path.join(dir, file);
    const image = sharp(filePath);
    const meta = await image.metadata();
    const { width, height } = meta;
    
    // Flatten onto container background
    const flattened = await sharp({
      create: { width, height, channels: 3, background: containerBg }
    })
      .composite([{ input: await image.ensureAlpha().png().toBuffer(), blend: "over" }])
      .png()
      .toBuffer();
    
    fs.writeFileSync(filePath, flattened);
    console.log("done", file);
  } catch (e) {
    console.error("err", file, e.message);
  }
}
