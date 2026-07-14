import { describe, expect, it } from "vitest";
import { MemoryLabRepository } from "../src/lab/repository";
import { ValidationLabService } from "../src/lab/service";
import { MockProvider } from "../src/providers/mock";
import { runBatch } from "../src/lab/batch";
import { buildValidationReport } from "../src/lab/reporting";
describe("batch and reports", () => {
  it("resumes idempotently and aggregates severities", async () => {
    const repo = new MemoryLabRepository(),
      service = new ValidationLabService(new MockProvider(), repo, {
        MODEL_PROVIDER: "mock",
      }),
      items = [
        {
          id: "u1",
          version: "v1",
          request: { problemText: "Convert 72 km/h into m/s." },
          expected: {},
          tags: [],
        },
        {
          id: "a1",
          version: "v1",
          request: {
            problemText:
              "A car increases its velocity from 10 m/s to 25 m/s in 5 s. Find its uniform acceleration.",
          },
          expected: {},
          tags: [],
        },
      ],
      cfg = {
        benchmarkVersion: "v1",
        providerConfigId: "mock",
        promptSetVersion: "p1",
        concurrency: 2,
      };
    const first = await runBatch(items, cfg, service, repo),
      second = await runBatch(items, cfg, service, repo);
    expect(first.manifestId).toBe(second.manifestId);
    expect(second.items.every((i) => i.attempts === 1)).toBe(true);
    const runs = await repo.listRuns();
    await service.evaluate({
      runId: runs[0]!.runId,
      evaluator: "e",
      stage: "solving",
      decision: "reject",
      severity: "S3",
      corrections: [],
      notes: "fixture",
    });
    const report = buildValidationReport(
      runs,
      await repo.listEvaluations(),
      "synthetic",
    );
    expect(report.totals.runs).toBe(2);
    expect(report.severityCounts.S3).toBe(1);
    expect(report.calculator.supported).toBe(2);
  });
});
