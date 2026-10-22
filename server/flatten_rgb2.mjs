import sharp from "sharp";
import fs from "node:fs";

const dir = "c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products";
const targets = [
  "aicon-split-ac-1t.jpg",
  "aicon-quartz-metal-heater.jpg",
  "aicon-electric-kettle-1.5l.jpg",
  "aicon-electric-kettle-1.8l.jpg",
  "aicon-dry-iron.jpg",
  "aicon-juicer-mixer-grinder.jpg",
];
const containerBg = "#f4f8fb";

for (const file of targets) {
  try {
    const filePath = dir + "/" + file;
    const image = sharp(filePath);
    const meta = await image.metadata();
    const { width, height } = meta;
    // Flatten: composite onto solid color background
    const result = await sharp({
      create: { width, height, channels: 3, background: containerBg }
    })
      .composite([{ input: await image.removeAlpha().jpeg({ quality: 95 }).toBuffer() }])
      .jpeg({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(filePath, result);
    console.log("done", file);
  } catch (e) {
    console.error("err", file, e.message);
  }
}
