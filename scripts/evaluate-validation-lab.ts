import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { MemoryLabRepository } from "../src/lab/repository";
import { ValidationLabService } from "../src/lab/service";
import { MockProvider } from "../src/providers/mock";
import { runBatch } from "../src/lab/batch";
import { buildValidationReport } from "../src/lab/reporting";
const rows = (
  await readFile(
    new URL("../evals/starter-dataset.jsonl", import.meta.url),
    "utf8",
  )
)
  .split("\n")
  .filter(Boolean)
  .map((line: string) => JSON.parse(line));
const items = rows.map((r: any) => ({
  id: r.id,
  version: "starter-v1",
  request: {
    benchmarkId: r.id,
    problemText: r.canonical_transcription,
    interactionMode: r.id.includes("_work_") ? "check_my_work" : "guide_me",
    language: "english",
    context: {
      curriculum: "tamil_nadu_state_board",
      grade: "11",
      subject: "physics",
    },
  },
  expected: {
    clarificationRequired: r.clarification_required,
    finalAnswer: r.final_answer,
  },
  tags: ["synthetic", "starter"],
}));
const repository = new MemoryLabRepository(),
  service = new ValidationLabService(new MockProvider(), repository, {
    MODEL_PROVIDER: "mock",
    PIPELINE_VERSION: "phase2-0.1.0",
  });
const manifest = await runBatch(
  items,
  {
    benchmarkVersion: "starter-v1",
    providerConfigId: "mock-local",
    promptSetVersion: "phase2-mock",
    concurrency: 3,
  },
  service,
  repository,
);
const report = buildValidationReport(
  await repository.listRuns({ limit: 100 }),
  await repository.listEvaluations(),
  "mock",
);
const output = {
  purpose:
    "Phase 2 deterministic validation-lab plumbing report; not a live-model accuracy claim.",
  manifest,
  report,
};
const path = new URL(
  "../evals/reports/phase2-validation-lab-smoke.json",
  import.meta.url,
);
await mkdir(dirname(path.pathname), { recursive: true });
await writeFile(path, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
if (manifest.status !== "complete" || report.totals.runs !== items.length)
  process.exitCode = 1;
