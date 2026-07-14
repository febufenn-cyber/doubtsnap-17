import type { LabEnv } from "./env";
import {
  LAB_SCHEMA_VERSION,
  type BatchManifest,
  type BenchmarkItem,
  type EvaluationEvent,
  type NewEvaluation,
  type ValidationRunRecord,
} from "./contracts";
import { deterministicId } from "../core/hash";

export interface RunFilters {
  status?: string;
  topic?: string;
  limit?: number;
}
export interface LabRepository {
  saveRun(record: ValidationRunRecord): Promise<void>;
  getRun(runId: string): Promise<ValidationRunRecord | null>;
  listRuns(filters?: RunFilters): Promise<ValidationRunRecord[]>;
  appendEvaluation(input: NewEvaluation): Promise<EvaluationEvent>;
  listEvaluations(runId?: string): Promise<EvaluationEvent[]>;
  saveBenchmarkItem(item: BenchmarkItem): Promise<void>;
  listBenchmarkItems(version?: string): Promise<BenchmarkItem[]>;
  upsertBatch(manifest: BatchManifest): Promise<void>;
  getBatch(manifestId: string): Promise<BatchManifest | null>;
  purgeExpiredImages(now?: Date): Promise<number>;
}

export class MemoryLabRepository implements LabRepository {
  private runs = new Map<string, ValidationRunRecord>();
  private evaluations: EvaluationEvent[] = [];
  private benchmarks = new Map<string, BenchmarkItem>();
  private batches = new Map<string, BatchManifest>();
  async saveRun(record: ValidationRunRecord) {
    this.runs.set(record.runId, structuredClone(record));
  }
  async getRun(runId: string) {
    const v = this.runs.get(runId);
    return v ? structuredClone(v) : null;
  }
  async listRuns(filters: RunFilters = {}): Promise<ValidationRunRecord[]> {
    let values = [...this.runs.values()];
    if (filters.status)
      values = values.filter((v) => v.run.status === filters.status);
    if (filters.topic)
      values = values.filter(
        (v) => v.run.classification?.topic === filters.topic,
      );
    return values
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, filters.limit ?? 100)
      .map((v) => structuredClone(v));
  }
  async appendEvaluation(input: NewEvaluation) {
    const prior = this.evaluations.filter((v) => v.runId === input.runId),
      revision = prior.length + 1,
      eventId = await deterministicId("evaluation", { ...input, revision });
    const event: EvaluationEvent = {
      schemaVersion: LAB_SCHEMA_VERSION,
      eventId,
      revision,
      createdAt: new Date().toISOString(),
      ...input,
    };
    this.evaluations.push(structuredClone(event));
    return event;
  }
  async listEvaluations(runId?: string): Promise<EvaluationEvent[]> {
    return this.evaluations
      .filter((v) => !runId || v.runId === runId)
      .map((v) => structuredClone(v));
  }
  async saveBenchmarkItem(item: BenchmarkItem) {
    this.benchmarks.set(`${item.version}:${item.id}`, structuredClone(item));
  }
  async listBenchmarkItems(version?: string): Promise<BenchmarkItem[]> {
    return [...this.benchmarks.values()]
      .filter((v) => !version || v.version === version)
      .map((v) => structuredClone(v));
  }
  async upsertBatch(manifest: BatchManifest) {
    this.batches.set(manifest.manifestId, structuredClone(manifest));
  }
  async getBatch(manifestId: string) {
    const v = this.batches.get(manifestId);
    return v ? structuredClone(v) : null;
  }
  async purgeExpiredImages(now = new Date()): Promise<number> {
    let purged = 0;
    for (const [runId, record] of this.runs) {
      if (
        !record.rawImageStored ||
        !record.rawImageExpiresAt ||
        record.rawImageExpiresAt > now.toISOString()
      )
        continue;
      const next = structuredClone(record);
      if (next.run.request.image) next.run.request.image.base64 = "[expired]";
      if (next.normalizedImage?.normalized.base64)
        delete next.normalizedImage.normalized.base64;
      next.rawImageStored = false;
      next.rawImageExpiresAt = null;
      next.updatedAt = now.toISOString();
      this.runs.set(runId, next);
      purged += 1;
    }
    return purged;
  }
}

export class SupabaseLabRepository implements LabRepository {
  constructor(private env: LabEnv) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for LAB_REPOSITORY=supabase.",
      );
  }
  private async request(path: string, init: RequestInit = {}) {
    const response = await fetch(`${this.env.SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
        authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
        "content-type": "application/json",
        prefer: "return=representation,resolution=merge-duplicates",
        ...(init.headers ?? {}),
      },
    });
    if (!response.ok)
      throw new Error(
        `Supabase lab repository failed (${response.status}): ${await response.text()}`,
      );
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }
  async saveRun(record: ValidationRunRecord) {
    await this.request("validation_runs?on_conflict=run_id", {
      method: "POST",
      body: JSON.stringify({
        run_id: record.runId,
        item_id: record.itemId,
        payload: record,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        raw_image_stored: record.rawImageStored,
        raw_image_expires_at: record.rawImageExpiresAt,
      }),
    });
  }
  async getRun(runId: string) {
    const rows = (await this.request(
      `validation_runs?run_id=eq.${encodeURIComponent(runId)}&select=payload&limit=1`,
    )) as Array<{ payload: ValidationRunRecord }>;
    return rows[0]?.payload ?? null;
  }
  async listRuns(filters: RunFilters = {}) {
    let path = "validation_runs?select=payload&order=created_at.desc";
    if (filters.status)
      path += `&status=eq.${encodeURIComponent(filters.status)}`;
    path += `&limit=${filters.limit ?? 100}`;
    const rows = (await this.request(path)) as Array<{
      payload: ValidationRunRecord;
    }>;
    return rows
      .map((r) => r.payload)
      .filter(
        (r) => !filters.topic || r.run.classification?.topic === filters.topic,
      );
  }
  async appendEvaluation(input: NewEvaluation) {
    const prior = await this.listEvaluations(input.runId),
      revision = prior.length + 1,
      eventId = await deterministicId("evaluation", { ...input, revision }),
      event: EvaluationEvent = {
        schemaVersion: LAB_SCHEMA_VERSION,
        eventId,
        revision,
        createdAt: new Date().toISOString(),
        ...input,
      };
    await this.request("evaluation_events", {
      method: "POST",
      body: JSON.stringify({
        event_id: eventId,
        run_id: event.runId,
        revision,
        payload: event,
        created_at: event.createdAt,
      }),
    });
    return event;
  }
  async listEvaluations(runId?: string) {
    let p = "evaluation_events?select=payload&order=created_at.asc";
    if (runId) p += `&run_id=eq.${encodeURIComponent(runId)}`;
    const rows = (await this.request(p)) as Array<{ payload: EvaluationEvent }>;
    return rows.map((r) => r.payload);
  }
  async saveBenchmarkItem(item: BenchmarkItem) {
    await this.request("benchmark_items?on_conflict=version,item_id", {
      method: "POST",
      body: JSON.stringify({
        version: item.version,
        item_id: item.id,
        payload: item,
      }),
    });
  }
  async listBenchmarkItems(version?: string) {
    let p = "benchmark_items?select=payload";
    if (version) p += `&version=eq.${encodeURIComponent(version)}`;
    const rows = (await this.request(p)) as Array<{ payload: BenchmarkItem }>;
    return rows.map((r) => r.payload);
  }
  async upsertBatch(manifest: BatchManifest) {
    await this.request("batch_manifests?on_conflict=manifest_id", {
      method: "POST",
      body: JSON.stringify({
        manifest_id: manifest.manifestId,
        status: manifest.status,
        payload: manifest,
        updated_at: manifest.updatedAt,
      }),
    });
  }
  async getBatch(manifestId: string) {
    const rows = (await this.request(
      `batch_manifests?manifest_id=eq.${encodeURIComponent(manifestId)}&select=payload&limit=1`,
    )) as Array<{ payload: BatchManifest }>;
    return rows[0]?.payload ?? null;
  }
  async purgeExpiredImages(now = new Date()): Promise<number> {
    const rows = (await this.request(
      `validation_runs?raw_image_stored=eq.true&raw_image_expires_at=lte.${encodeURIComponent(now.toISOString())}&select=run_id,payload`,
    )) as Array<{ run_id: string; payload: ValidationRunRecord }>;
    for (const row of rows) {
      const payload = structuredClone(row.payload);
      if (payload.run.request.image)
        payload.run.request.image.base64 = "[expired]";
      if (payload.normalizedImage?.normalized.base64)
        delete payload.normalizedImage.normalized.base64;
      payload.rawImageStored = false;
      payload.rawImageExpiresAt = null;
      payload.updatedAt = now.toISOString();
      await this.request(
        `validation_runs?run_id=eq.${encodeURIComponent(row.run_id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            payload,
            updated_at: payload.updatedAt,
            raw_image_stored: false,
            raw_image_expires_at: null,
          }),
        },
      );
    }
    return rows.length;
  }
}

const memoryRepository = new MemoryLabRepository();
export function createLabRepository(env: LabEnv): LabRepository {
  return env.LAB_REPOSITORY === "supabase"
    ? new SupabaseLabRepository(env)
    : memoryRepository;
}
