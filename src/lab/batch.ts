import { deterministicId } from "../core/hash";
import {
  BenchmarkItemSchema,
  BatchManifestSchema,
  LAB_SCHEMA_VERSION,
  type BatchManifest,
  type BenchmarkItem,
} from "./contracts";
import type { LabRepository } from "./repository";
import type { ValidationLabService } from "./service";
export interface BatchConfig {
  benchmarkVersion: string;
  providerConfigId: string;
  promptSetVersion: string;
  concurrency?: number;
}
export async function runBatch(
  items: BenchmarkItem[],
  config: BatchConfig,
  service: ValidationLabService,
  repository: LabRepository,
): Promise<BatchManifest> {
  const parsed = items.map((i) => BenchmarkItemSchema.parse(i)),
    concurrency = Math.min(10, Math.max(1, config.concurrency ?? 2)),
    manifestId = await deterministicId("batch", {
      benchmarkVersion: config.benchmarkVersion,
      providerConfigId: config.providerConfigId,
      promptSetVersion: config.promptSetVersion,
      itemIds: parsed.map((i) => i.id),
    });
  const existing = await repository.getBatch(manifestId),
    now = new Date().toISOString();
  let manifest: BatchManifest =
    existing ??
    BatchManifestSchema.parse({
      schemaVersion: LAB_SCHEMA_VERSION,
      manifestId,
      benchmarkVersion: config.benchmarkVersion,
      providerConfigId: config.providerConfigId,
      promptSetVersion: config.promptSetVersion,
      createdAt: now,
      updatedAt: now,
      status: "pending",
      concurrency,
      items: parsed.map((i) => ({
        itemId: i.id,
        status: "pending",
        runId: null,
        error: null,
        attempts: 0,
      })),
    });
  manifest = {
    ...manifest,
    status: "running",
    updatedAt: new Date().toISOString(),
  };
  await repository.upsertBatch(manifest);
  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= parsed.length) return;
      const item = parsed[index]!,
        state = manifest.items.find((s) => s.itemId === item.id)!;
      if (state.status === "complete") continue;
      state.status = "running";
      state.attempts++;
      state.error = null;
      manifest.updatedAt = new Date().toISOString();
      await repository.upsertBatch(manifest);
      try {
        await repository.saveBenchmarkItem(item);
        const record = await service.run(item.request, {
          benchmarkVersion: item.version,
          providerConfigId: config.providerConfigId,
        });
        state.status = "complete";
        state.runId = record.runId;
      } catch (error) {
        state.status = "failed";
        state.error = error instanceof Error ? error.message : String(error);
      }
      manifest.updatedAt = new Date().toISOString();
      await repository.upsertBatch(manifest);
    }
  });
  await Promise.all(workers);
  manifest.status = manifest.items.every((i) => i.status === "complete")
    ? "complete"
    : "failed";
  manifest.updatedAt = new Date().toISOString();
  await repository.upsertBatch(manifest);
  return BatchManifestSchema.parse(manifest);
}
