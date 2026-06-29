import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const svgPath = path.join(rootDir, "public", "favicon.svg");
const icoPath = path.join(rootDir, "public", "favicon.ico");

const svg = await fs.readFile(svgPath);
const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
);

await fs.writeFile(icoPath, await toIco(pngBuffers));
console.log("Generated public/favicon.ico");
