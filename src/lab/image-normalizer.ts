import { createHash } from "node:crypto";
import sharp from "sharp";
import type { ImageInput } from "../contracts";
import {
  LAB_SCHEMA_VERSION,
  NormalizedImageSchema,
  type NormalizedImage,
} from "./contracts";

export interface NormalizeOptions {
  maxDimension?: number;
  maxBytes?: number;
  quality?: number;
  includeBase64?: boolean;
}
function hash(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}
function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function mediaTypeFor(format: string) {
  return format === "jpeg"
    ? "image/jpeg"
    : format === "webp"
      ? "image/webp"
      : "image/png";
}
function laplacianScore(data: Buffer, width: number, height: number) {
  if (width < 3 || height < 3) return 0;
  let sum = 0,
    sumSq = 0,
    count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap =
        4 * data[i]! -
        data[i - 1]! -
        data[i + 1]! -
        data[i - width]! -
        data[i + width]!;
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }
  const variance = Math.max(0, sumSq / count - (sum / count) ** 2);
  return clamp01(variance / 4000);
}
function pixelSignals(data: Buffer, width: number, height: number) {
  let sum = 0,
    sumSq = 0,
    glare = 0,
    border = 0,
    borderCount = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const v = data[y * width + x]!;
      sum += v;
      sumSq += v * v;
      if (v >= 245) glare++;
      if (x < 3 || y < 3 || x >= width - 3 || y >= height - 3) {
        border += Math.abs(v - 255);
        borderCount++;
      }
    }
  const n = data.length,
    mean = sum / n,
    std = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
  return {
    contrastScore: clamp01(std / 80),
    glareFraction: clamp01(glare / n),
    borderRisk: clamp01(border / (borderCount * 255)),
    blurScore: laplacianScore(data, width, height),
  };
}

export async function normalizeImage(
  input: ImageInput,
  options: NormalizeOptions = {},
): Promise<NormalizedImage> {
  const maxDimension = options.maxDimension ?? 2200,
    maxBytes = options.maxBytes ?? 10_000_000,
    quality = options.quality ?? 88;
  const originalBuffer = Buffer.from(input.base64, "base64");
  if (!originalBuffer.length)
    throw new Error("Image payload decoded to zero bytes.");
  if (originalBuffer.length > maxBytes)
    throw new Error(`Image exceeds ${maxBytes}-byte normalization limit.`);
  const source = sharp(originalBuffer, {
    failOn: "error",
    limitInputPixels: 64_000_000,
    animated: true,
  });
  const metadata = await source.metadata();
  if (!metadata.width || !metadata.height || !metadata.format)
    throw new Error("Image dimensions or format could not be decoded.");
  if ((metadata.pages ?? 1) > 1)
    throw new Error(
      "Animated or multi-page images are not supported by the validation normalizer.",
    );
  const transformations = ["decode"];
  if (metadata.orientation && metadata.orientation !== 1)
    transformations.push(`auto-orient:${metadata.orientation}`);
  let pipeline = source.rotate();
  const orientedWidth = [5, 6, 7, 8].includes(metadata.orientation ?? 1)
      ? metadata.height
      : metadata.width,
    orientedHeight = [5, 6, 7, 8].includes(metadata.orientation ?? 1)
      ? metadata.width
      : metadata.height;
  if (Math.max(orientedWidth, orientedHeight) > maxDimension) {
    pipeline = pipeline.resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
      kernel: "lanczos3",
    });
    transformations.push(`resize-inside:${maxDimension}`);
  } else transformations.push("resize-not-required");
  let outputFormat = metadata.format;
  if (
    outputFormat === "gif" ||
    !["jpeg", "png", "webp"].includes(outputFormat)
  ) {
    outputFormat = "png";
    transformations.push("convert-to-png");
  }
  if (outputFormat === "jpeg")
    pipeline = pipeline.jpeg({ quality, progressive: false } as Parameters<
      typeof pipeline.jpeg
    >[0]);
  else if (outputFormat === "webp") pipeline = pipeline.webp({ quality });
  else
    pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
  const normalizedBuffer = await pipeline.toBuffer();
  const normalizedMeta = await sharp(normalizedBuffer).metadata();
  if (!normalizedMeta.width || !normalizedMeta.height)
    throw new Error("Normalized image dimensions are unavailable.");
  const sample = await sharp(normalizedBuffer)
    .greyscale()
    .resize({
      width: Math.min(256, normalizedMeta.width),
      height: Math.min(256, normalizedMeta.height),
      fit: "inside",
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const signals = pixelSignals(
    sample.data,
    sample.info.width,
    sample.info.height,
  );
  const metadataRemoved = ["exif", "xmp", "iptc", "comments"];
  if (metadata.icc) metadataRemoved.push("icc");
  return NormalizedImageSchema.parse({
    schemaVersion: LAB_SCHEMA_VERSION,
    originalHash: hash(originalBuffer),
    normalizedHash: hash(normalizedBuffer),
    original: {
      mediaType: input.mediaType,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      bytes: originalBuffer.length,
      orientation: metadata.orientation ?? null,
    },
    normalized: {
      mediaType: mediaTypeFor(outputFormat),
      format: outputFormat,
      width: normalizedMeta.width,
      height: normalizedMeta.height,
      bytes: normalizedBuffer.length,
      ...(options.includeBase64
        ? { base64: normalizedBuffer.toString("base64") }
        : {}),
    },
    transformations,
    metadataRemoved,
    signals: {
      ...signals,
      resolutionScore: clamp01(
        Math.min(normalizedMeta.width, normalizedMeta.height) / 1200,
      ),
    },
    uncertaintyRegions: [],
    warnings: [],
    createdAt: new Date().toISOString(),
  });
}
