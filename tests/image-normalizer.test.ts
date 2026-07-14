import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { normalizeImage } from "../src/lab/image-normalizer";
describe("image normalization", () => {
  it("strips metadata, auto-orients, and resizes deterministically", async () => {
    const source = await sharp({
      create: {
        width: 1600,
        height: 900,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg()
      .withMetadata({
        orientation: 6,
        exif: { IFD0: { Artist: "student-name" } },
      })
      .toBuffer();
    const input = {
      mediaType: "image/jpeg" as const,
      base64: source.toString("base64"),
    };
    const first = await normalizeImage(input, {
        maxDimension: 1000,
        includeBase64: true,
      }),
      second = await normalizeImage(input, { maxDimension: 1000 });
    expect(first.original.orientation).toBe(6);
    expect(Math.max(first.normalized.width, first.normalized.height)).toBe(
      1000,
    );
    expect(first.normalizedHash).toBe(second.normalizedHash);
    const meta = await sharp(
      Buffer.from(first.normalized.base64!, "base64"),
    ).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.orientation).toBeUndefined();
  });
  it("rejects corrupt and oversized payloads", async () => {
    await expect(
      normalizeImage({
        mediaType: "image/jpeg",
        base64: Buffer.from("not-image").toString("base64"),
      }),
    ).rejects.toThrow();
    const png = await sharp({
      create: { width: 10, height: 10, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    await expect(
      normalizeImage(
        { mediaType: "image/png", base64: png.toString("base64") },
        { maxBytes: 4 },
      ),
    ).rejects.toThrow(/exceeds/);
  });
});
