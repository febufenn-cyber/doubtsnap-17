import { describe, expect, it } from "vitest";
import { MemoryLabRepository } from "../src/lab/repository";
import { ValidationLabService } from "../src/lab/service";
import { MockProvider } from "../src/providers/mock";
const request = { problemText: "Convert 72 km/h into m/s." };
describe("validation repository", () => {
  it("persists runs and append-only evaluation revisions", async () => {
    const repo = new MemoryLabRepository(),
      service = new ValidationLabService(new MockProvider(), repo, {
        MODEL_PROVIDER: "mock",
      }),
      record = await service.run(request);
    const a = await service.evaluate({
        runId: record.runId,
        evaluator: "alice",
        stage: "verification",
        decision: "accept",
        severity: "S0",
        corrections: [],
        notes: "ok",
      }),
      b = await service.evaluate({
        runId: record.runId,
        evaluator: "bob",
        stage: "teaching",
        decision: "reject",
        severity: "S1",
        corrections: [
          {
            field: "teaching.minimalHint",
            previous: "x",
            corrected: "y",
            reason: "clearer",
          },
        ],
        notes: "revise",
      });
    expect(a.revision).toBe(1);
    expect(b.revision).toBe(2);
    expect(await repo.listEvaluations(record.runId)).toHaveLength(2);
    expect(
      (await service.exportCorrected(record.runId)).latestCorrections[
        "teaching.minimalHint"
      ],
    ).toBe("y");
  });
});

describe("raw image retention", () => {
  it("redacts raw image data by default", async () => {
    const repo = new MemoryLabRepository();
    const service = new ValidationLabService(new MockProvider(), repo, {
      MODEL_PROVIDER: "mock",
      LAB_STORE_RAW_IMAGES: "false",
    });
    const record = await service.run({
      problemText: "Convert 72 km/h into m/s.",
      image: { mediaType: "image/png", base64: "YWJjZA==" },
    });
    expect(record.rawImageStored).toBe(false);
    expect(record.rawImageExpiresAt).toBeNull();
    expect(record.run.request.image?.base64).toMatch(
      /^\[redacted:[a-f0-9]{64}\]$/,
    );
  });

  it("purges retained image data after expiry", async () => {
    const repo = new MemoryLabRepository();
    const service = new ValidationLabService(new MockProvider(), repo, {
      MODEL_PROVIDER: "mock",
      LAB_STORE_RAW_IMAGES: "true",
      RAW_IMAGE_RETENTION_HOURS: "0.001",
    });
    const record = await service.run({
      problemText: "Convert 72 km/h into m/s.",
      image: { mediaType: "image/png", base64: "YWJjZA==" },
    });
    expect(record.rawImageStored).toBe(true);
    const purged = await service.purgeExpiredImages(
      new Date(Date.now() + 10_000),
    );
    expect(purged).toBe(1);
    const stored = await repo.getRun(record.runId);
    expect(stored?.rawImageStored).toBe(false);
    expect(stored?.run.request.image?.base64).toBe("[expired]");
  });
});
