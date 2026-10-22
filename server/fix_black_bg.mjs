import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = "c:/Users/hp/OneDrive/Desktop/aicon/client/public/images/products";
const targets = [
  "aicon-split-ac-1t.jpg",
  "aicon-quartz-metal-heater.jpg",
  "aicon-electric-kettle-1.5l.jpg",
  "aicon-electric-kettle-1.8l.jpg",
];

for (const file of targets) {
  try {
    const filePath = path.join(dir, file);
    const ext = path.extname(file).toLowerCase();
    const image = sharp(filePath);
    const meta = await image.metadata();
    const { width, height } = meta;

    const result = await sharp({
      create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
    })
      .composite([{ input: filePath, blend: "over" }])
      .png()
      .toBuffer();

    const outPath = ext === ".jpg" ? filePath.replace(".jpg", ".png") : filePath;
    fs.writeFileSync(outPath, result);
    if (ext === ".jpg" && outPath !== filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log("done", file, "->", path.basename(outPath));
  } catch (e) {
    console.error("err", file, e.message);
  }
}
