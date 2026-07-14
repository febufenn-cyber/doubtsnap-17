import { runTruthEngine } from "../core/pipeline";
import { sha256Hex } from "../core/hash";
import type { TruthEngineProvider } from "../providers/provider";
import {
  LAB_SCHEMA_VERSION,
  NewEvaluationSchema,
  type NewEvaluation,
  type NormalizedImage,
  type ValidationRunRecord,
} from "./contracts";
import { applyDeterministicGate, deterministicCheck } from "./calculators";
import type { LabEnv } from "./env";
import type { LabRepository, RunFilters } from "./repository";

function retentionHours(env: LabEnv): number {
  const value = Number(env.RAW_IMAGE_RETENTION_HOURS ?? "24");
  return Number.isFinite(value) && value > 0 ? value : 24;
}

async function redactImageBase64(base64: string): Promise<string> {
  return `[redacted:${await sha256Hex(base64)}]`;
}

export class ValidationLabService {
  constructor(
    private provider: TruthEngineProvider,
    private repository: LabRepository,
    private env: LabEnv,
  ) {}

  async run(
    raw: unknown,
    options: {
      normalizedImage?: NormalizedImage | null;
      benchmarkVersion?: string | null;
      providerConfigId?: string | null;
    } = {},
  ): Promise<ValidationRunRecord> {
    let run = await runTruthEngine(raw, this.provider, this.env);
    const deterministicVerification = deterministicCheck(run);
    run = applyDeterministicGate(run, deterministicVerification);

    const hasRawImage = Boolean(run.request.image);
    const rawImageStored =
      hasRawImage && this.env.LAB_STORE_RAW_IMAGES === "true";
    const rawImageExpiresAt = rawImageStored
      ? new Date(
          Date.now() + retentionHours(this.env) * 3_600_000,
        ).toISOString()
      : null;

    if (run.request.image && !rawImageStored) {
      run = {
        ...run,
        request: {
          ...run.request,
          image: {
            ...run.request.image,
            base64: await redactImageBase64(run.request.image.base64),
          },
        },
      };
    }

    let normalizedImage = options.normalizedImage ?? null;
    if (normalizedImage?.normalized.base64 && !rawImageStored) {
      const { base64, ...safeNormalized } = normalizedImage.normalized;
      normalizedImage = {
        ...normalizedImage,
        normalized: safeNormalized,
      };
      void base64;
    }

    const now = new Date().toISOString();
    const record: ValidationRunRecord = {
      schemaVersion: LAB_SCHEMA_VERSION,
      runId: run.runId,
      itemId: run.itemId,
      createdAt: now,
      updatedAt: now,
      run,
      normalizedImage,
      deterministicVerification,
      benchmarkVersion: options.benchmarkVersion ?? null,
      providerConfigId: options.providerConfigId ?? null,
      rawImageStored,
      rawImageExpiresAt,
    };
    await this.repository.saveRun(record);
    return record;
  }

  list(filters?: RunFilters) {
    return this.repository.listRuns(filters);
  }

  get(runId: string) {
    return this.repository.getRun(runId);
  }

  purgeExpiredImages(now?: Date) {
    return this.repository.purgeExpiredImages(now);
  }

  async evaluate(raw: unknown) {
    const input = NewEvaluationSchema.parse(raw);
    const run = await this.repository.getRun(input.runId);
    if (!run) throw new Error(`Run ${input.runId} not found.`);
    return this.repository.appendEvaluation(input as NewEvaluation);
  }

  evaluations(runId?: string) {
    return this.repository.listEvaluations(runId);
  }

  async exportCorrected(runId: string) {
    const run = await this.repository.getRun(runId);
    if (!run) throw new Error(`Run ${runId} not found.`);
    const events = await this.repository.listEvaluations(runId);
    return {
      schemaVersion: LAB_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      run,
      evaluations: events,
      latestCorrections: events
        .flatMap((event) => event.corrections)
        .reduce<Record<string, unknown>>((accumulator, correction) => {
          accumulator[correction.field] = correction.corrected;
          return accumulator;
        }, {}),
    };
  }
}
