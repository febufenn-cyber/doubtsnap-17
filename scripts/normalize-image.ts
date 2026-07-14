import { readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { normalizeImage } from "../src/lab/image-normalizer";
const [input, output] = process.argv.slice(2);
if (!input || !output)
  throw new Error("Usage: npm run normalize:image -- input.jpg output.json");
const bytes = await readFile(input),
  ext = extname(input).toLowerCase(),
  mediaType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
          ? "image/gif"
          : "image/jpeg";
const result = await normalizeImage(
  { mediaType, base64: bytes.toString("base64") },
  { includeBase64: false },
);
await writeFile(output, JSON.stringify(result, null, 2) + "\n");
console.log(`Normalized metadata written to ${output}`);
