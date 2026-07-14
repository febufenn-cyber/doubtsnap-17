import { z } from "zod";
import { AnswerSchema, RunResultSchema, StageNameSchema } from "../contracts";

export const LAB_SCHEMA_VERSION = "phase2-lab-0.1.0" as const;
export const SeveritySchema = z.enum(["S0", "S1", "S2", "S3", "S4"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const ImageRegionSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().positive().max(1),
    height: z.number().positive().max(1),
    label: z.string().min(1),
    critical: z.boolean(),
    confidence: z.number().min(0).max(1),
  })
  .refine(
    (v) => v.x + v.width <= 1 && v.y + v.height <= 1,
    "Image region must fit normalized coordinates.",
  );
export type ImageRegion = z.infer<typeof ImageRegionSchema>;

export const ImageSignalsSchema = z.object({
  blurScore: z.number().min(0).max(1),
  contrastScore: z.number().min(0).max(1),
  glareFraction: z.number().min(0).max(1),
  borderRisk: z.number().min(0).max(1),
  resolutionScore: z.number().min(0).max(1),
});
export const NormalizedImageSchema = z.object({
  schemaVersion: z.literal(LAB_SCHEMA_VERSION),
  originalHash: z.string().length(64),
  normalizedHash: z.string().length(64),
  original: z.object({
    mediaType: z.string(),
    format: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    bytes: z.number().int().positive(),
    orientation: z.number().int().nullable(),
  }),
  normalized: z.object({
    mediaType: z.string(),
    format: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    bytes: z.number().int().positive(),
    base64: z.string().optional(),
  }),
  transformations: z.array(z.string()),
  metadataRemoved: z.array(z.string()),
  signals: ImageSignalsSchema,
  uncertaintyRegions: z.array(ImageRegionSchema),
  warnings: z.array(z.string()),
  createdAt: z.string(),
});
export type NormalizedImage = z.infer<typeof NormalizedImageSchema>;

export const CalculatorFamilySchema = z.enum([
  "unit_conversion",
  "uniform_acceleration",
  "net_force",
  "kinetic_energy",
  "graph_area",
]);
export const DeterministicVerificationSchema = z.object({
  family: CalculatorFamilySchema.nullable(),
  supported: z.boolean(),
  assumptions: z.array(z.string()),
  answer: AnswerSchema.nullable(),
  agreesWithModel: z.boolean().nullable(),
  reason: z.string(),
});
export type DeterministicVerification = z.infer<
  typeof DeterministicVerificationSchema
>;

export const ValidationRunRecordSchema = z.object({
  schemaVersion: z.literal(LAB_SCHEMA_VERSION),
  runId: z.string(),
  itemId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  run: RunResultSchema,
  normalizedImage: NormalizedImageSchema.nullable(),
  deterministicVerification: DeterministicVerificationSchema,
  benchmarkVersion: z.string().nullable(),
  providerConfigId: z.string().nullable(),
  rawImageStored: z.boolean(),
  rawImageExpiresAt: z.string().nullable(),
});
export type ValidationRunRecord = z.infer<typeof ValidationRunRecordSchema>;

export const EvaluationCorrectionSchema = z.object({
  field: z.string().min(1),
  previous: z.unknown().optional(),
  corrected: z.unknown(),
  reason: z.string().min(1),
});
export const EvaluationEventSchema = z.object({
  schemaVersion: z.literal(LAB_SCHEMA_VERSION),
  eventId: z.string(),
  runId: z.string(),
  revision: z.number().int().positive(),
  evaluator: z.string().min(1),
  stage: StageNameSchema.nullable(),
  decision: z.enum(["accept", "reject", "needs_clarification"]),
  severity: SeveritySchema,
  corrections: z.array(EvaluationCorrectionSchema),
  notes: z.string(),
  createdAt: z.string(),
});
export type EvaluationEvent = z.infer<typeof EvaluationEventSchema>;
export const NewEvaluationSchema = EvaluationEventSchema.omit({
  schemaVersion: true,
  eventId: true,
  revision: true,
  createdAt: true,
});
export type NewEvaluation = z.infer<typeof NewEvaluationSchema>;

export const BenchmarkItemSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  request: z.unknown(),
  expected: z.record(z.string(), z.unknown()).default({}),
  tags: z.array(z.string()).default([]),
});
export type BenchmarkItem = z.infer<typeof BenchmarkItemSchema>;
export const BatchItemStateSchema = z.object({
  itemId: z.string(),
  status: z.enum(["pending", "running", "complete", "failed"]),
  runId: z.string().nullable(),
  error: z.string().nullable(),
  attempts: z.number().int().nonnegative(),
});
export const BatchManifestSchema = z.object({
  schemaVersion: z.literal(LAB_SCHEMA_VERSION),
  manifestId: z.string(),
  benchmarkVersion: z.string(),
  providerConfigId: z.string(),
  promptSetVersion: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(["pending", "running", "complete", "failed"]),
  concurrency: z.number().int().min(1).max(10),
  items: z.array(BatchItemStateSchema),
});
export type BatchManifest = z.infer<typeof BatchManifestSchema>;

export const ValidationReportSchema = z.object({
  schemaVersion: z.literal(LAB_SCHEMA_VERSION),
  generatedAt: z.string(),
  evidenceClass: z.enum(["synthetic", "mock", "internal", "real"]),
  totals: z.object({
    runs: z.number().int().nonnegative(),
    evaluations: z.number().int().nonnegative(),
    s4: z.number().int().nonnegative(),
    highConfidenceS3: z.number().int().nonnegative(),
  }),
  statusCounts: z.record(z.string(), z.number().int().nonnegative()),
  severityCounts: z.record(z.string(), z.number().int().nonnegative()),
  calculator: z.object({
    supported: z.number().int().nonnegative(),
    agreements: z.number().int().nonnegative(),
    disagreements: z.number().int().nonnegative(),
  }),
  latencyMs: z.object({
    p50: z.number().nonnegative(),
    p95: z.number().nonnegative(),
    max: z.number().nonnegative(),
  }),
  estimatedCostUsd: z.object({
    total: z.number().nonnegative(),
    p50: z.number().nonnegative(),
    p95: z.number().nonnegative(),
  }),
  clusters: z.array(
    z.object({ key: z.string(), count: z.number().int().positive() }),
  ),
  limitations: z.array(z.string()),
});
export type ValidationReport = z.infer<typeof ValidationReportSchema>;
