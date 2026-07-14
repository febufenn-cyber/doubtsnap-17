import { describe, expect, it } from "vitest";
import { ImageRegionSchema } from "../src/lab/contracts";
describe("lab contracts", () => {
  it("accepts normalized uncertainty coordinates", () => {
    expect(
      ImageRegionSchema.parse({
        x: 0.1,
        y: 0.2,
        width: 0.3,
        height: 0.4,
        label: "unclear exponent",
        critical: true,
        confidence: 0.5,
      }).critical,
    ).toBe(true);
  });
  it("rejects regions outside the image", () => {
    expect(() =>
      ImageRegionSchema.parse({
        x: 0.9,
        y: 0.2,
        width: 0.2,
        height: 0.4,
        label: "bad",
        critical: true,
        confidence: 0.5,
      }),
    ).toThrow();
  });
});
