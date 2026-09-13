import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const svgPath = path.join(root, "scripts/icon-source.svg");
const outDir = path.join(root, "public/icons");

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-192.png", size: 192 },
  { file: "icon-maskable-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

await mkdir(outDir, { recursive: true });

for (const { file, size } of targets) {
  await sharp(svgPath, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, file));
  console.log("gerado", file);
}

// favicon simples (32x32) na raiz de public
await sharp(svgPath, { density: 384 })
  .resize(32, 32)
  .png()
  .toFile(path.join(root, "public/favicon-32.png"));

console.log("ícones prontos em public/icons");
