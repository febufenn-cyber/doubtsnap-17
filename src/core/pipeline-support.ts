import {
  PIPELINE_SCHEMA_VERSION,
  RunResultSchema,
  type RunResult,
  type StageName,
  type StageTrace,
  type Usage,
} from '../contracts'
import type { ProviderCall } from '../providers/provider'

const ZERO_USAGE: Usage = { inputTokens: null, outputTokens: null, estimatedCostUsd: null }

export const REMAINING_STAGES: StageName[] = [
  'classification',
  'solving',
  'verification',
  'diagnosis',
  'teaching',
  'transfer_generation',
  'transfer_verification',
]

export interface StageOutcome<T> {
  data: T
  trace: StageTrace
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function imageByteSize(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding)
}

export function localTrace(args: {
  stage: StageName
  status: StageTrace['status']
  startedAt: string
  durationMs: number
  promptVersion: string
  notes?: string[]
  error?: string
}): StageTrace {
  return {
    stage: args.stage,
    status: args.status,
    provider: 'local',
    model: null,
    promptVersion: args.promptVersion,
    schemaVersion: PIPELINE_SCHEMA_VERSION,
    startedAt: args.startedAt,
    durationMs: args.durationMs,
    usage: ZERO_USAGE,
    notes: args.notes ?? [],
    error: args.error ?? null,
  }
}

export async function providerStage<T>(
  stage: StageName,
  operation: () => Promise<ProviderCall<T>>,
): Promise<StageOutcome<T>> {
  const startedAt = nowIso()
  const start = performance.now()
  const result = await operation()
  return {
    data: result.data,
    trace: {
      stage,
      status: 'completed',
      provider: result.meta.provider,
      model: result.meta.model,
      promptVersion: result.meta.promptVersion,
      schemaVersion: PIPELINE_SCHEMA_VERSION,
      startedAt,
      durationMs: Math.max(0, performance.now() - start),
      usage: result.meta.usage,
      notes: result.meta.notes,
      error: null,
    },
  }
}

export function skippedTrace(stage: StageName, reason: string): StageTrace {
  return localTrace({
    stage,
    status: 'skipped',
    startedAt: nowIso(),
    durationMs: 0,
    promptVersion: 'pipeline-control-0.1.0',
    notes: [reason],
  })
}

function totalCost(trace: StageTrace[]): number | null {
  const costs = trace
    .map((stage) => stage.usage.estimatedCostUsd)
    .filter((cost): cost is number => cost !== null)
  return costs.length ? costs.reduce((sum, cost) => sum + cost, 0) : null
}

export function finish(result: Omit<RunResult, 'totals'>, started: number): RunResult {
  return RunResultSchema.parse({
    ...result,
    totals: {
      durationMs: Math.max(0, performance.now() - started),
      estimatedCostUsd: totalCost(result.trace),
    },
  })
}
