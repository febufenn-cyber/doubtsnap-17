import { z } from 'zod'

export const PIPELINE_SCHEMA_VERSION = 'phase1-contracts-0.1.0' as const

export const InteractionModeSchema = z.enum([
  'quick_hint',
  'guide_me',
  'check_my_work',
  'explain_fully',
  'exam_revision',
])
export type InteractionMode = z.infer<typeof InteractionModeSchema>

export const TeachingLanguageSchema = z.enum(['english', 'tamil', 'tamil_english'])
export type TeachingLanguage = z.infer<typeof TeachingLanguageSchema>

export const ImageInputSchema = z.object({
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  base64: z.string().min(4),
  width: z.number().int().positive().max(8000).optional(),
  height: z.number().int().positive().max(8000).optional(),
})
export type ImageInput = z.infer<typeof ImageInputSchema>

export const RunRequestSchema = z
  .object({
    benchmarkId: z.string().min(1).max(128).optional(),
    problemText: z.string().min(1).max(20_000).optional(),
    image: ImageInputSchema.optional(),
    studentAttempt: z.string().max(20_000).optional(),
    studentStuckPoint: z.string().max(2_000).optional(),
    interactionMode: InteractionModeSchema.default('guide_me'),
    language: TeachingLanguageSchema.default('english'),
    context: z
      .object({
        curriculum: z.string().min(1).default('tamil_nadu_state_board'),
        grade: z.string().min(1).default('11'),
        subject: z.string().min(1).default('physics'),
      })
      .default({
        curriculum: 'tamil_nadu_state_board',
        grade: '11',
        subject: 'physics',
      }),
    confirmedTranscription: z.string().min(1).max(20_000).optional(),
  })
  .refine((value) => Boolean(value.problemText || value.image), {
    message: 'Provide problemText or image.',
    path: ['problemText'],
  })
export type RunRequest = z.infer<typeof RunRequestSchema>

export const QuantitySchema = z.object({
  name: z.string().min(1),
  symbol: z.string().nullable(),
  value: z.union([z.number(), z.string()]),
  unit: z.string(),
  source: z.enum(['observed', 'student_confirmed', 'inferred']),
  confidence: z.number().min(0).max(1),
})
export type Quantity = z.infer<typeof QuantitySchema>

export const UncertaintySpanSchema = z.object({
  text: z.string(),
  reason: z.string(),
  critical: z.boolean(),
  confidence: z.number().min(0).max(1),
})
export type UncertaintySpan = z.infer<typeof UncertaintySpanSchema>

export const TranscriptionSchema = z.object({
  originalText: z.string(),
  correctedText: z.string().nullable(),
  effectiveText: z.string(),
  knownValues: z.array(QuantitySchema),
  requiredQuantities: z.array(z.string()),
  diagramElements: z.array(z.string()),
  uncertaintySpans: z.array(UncertaintySpanSchema),
  imageQuality: z.object({
    score: z.number().min(0).max(1),
    issues: z.array(z.string()),
  }),
  criticalAmbiguity: z.boolean(),
  clarificationQuestions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})
export type Transcription = z.infer<typeof TranscriptionSchema>

export const ClassificationSchema = z.object({
  supported: z.boolean(),
  curriculum: z.string(),
  grade: z.string(),
  subject: z.string(),
  chapter: z.string(),
  topic: z.string(),
  problemType: z.enum([
    'numerical',
    'conceptual',
    'diagram',
    'graph',
    'check_my_work',
    'ambiguous',
    'unsupported',
  ]),
  reasons: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})
export type Classification = z.infer<typeof ClassificationSchema>

export const AnswerSchema = z.object({
  value: z.union([z.number(), z.string(), z.null()]),
  unit: z.string().nullable(),
  tolerance: z.number().nonnegative().nullable(),
  direction: z.string().nullable(),
})
export type Answer = z.infer<typeof AnswerSchema>

export const SolutionStepSchema = z.object({
  id: z.string(),
  expression: z.string(),
  explanation: z.string(),
  value: z.union([z.number(), z.string(), z.null()]),
  unit: z.string().nullable(),
})
export type SolutionStep = z.infer<typeof SolutionStepSchema>

export const SolutionSchema = z.object({
  governingPrinciples: z.array(z.string()).min(1),
  method: z.array(z.string()).min(1),
  steps: z.array(SolutionStepSchema).min(1),
  assumptions: z.array(z.string()),
  finalAnswer: AnswerSchema,
  confidence: z.number().min(0).max(1),
})
export type Solution = z.infer<typeof SolutionSchema>

export const VerificationCheckSchema = z.object({
  name: z.string(),
  status: z.enum(['pass', 'fail', 'warning', 'not_applicable']),
  evidence: z.string(),
})
export type VerificationCheck = z.infer<typeof VerificationCheckSchema>

export const IndependentVerificationSchema = z.object({
  answer: AnswerSchema,
  methodSummary: z.string(),
  confidence: z.number().min(0).max(1),
})
export type IndependentVerification = z.infer<typeof IndependentVerificationSchema>

export const VerificationSchema = z.object({
  status: z.enum(['pass', 'fail', 'needs_clarification']),
  checks: z.array(VerificationCheckSchema),
  independent: IndependentVerificationSchema,
  disagreements: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})
export type Verification = z.infer<typeof VerificationSchema>

export const DiagnosisSchema = z.object({
  misconceptionCode: z.string().nullable(),
  firstError: z.string().nullable(),
  evidence: z.array(z.string()),
  interventionTarget: z.string(),
  confidence: z.number().min(0).max(1),
})
export type Diagnosis = z.infer<typeof DiagnosisSchema>

export const TeachingSchema = z.object({
  mode: InteractionModeSchema,
  language: TeachingLanguageSchema,
  opening: z.string(),
  minimalHint: z.string(),
  guidedSteps: z.array(z.string()),
  fullExplanation: z.string(),
  conceptRecap: z.string(),
  commonMistake: z.string(),
  confidence: z.number().min(0).max(1),
})
export type Teaching = z.infer<typeof TeachingSchema>

export const TransferQuestionSchema = z.object({
  question: z.string(),
  targetMisconception: z.string().nullable(),
  answer: AnswerSchema,
  method: z.array(z.string()),
  verified: z.boolean(),
  verificationNotes: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})
export type TransferQuestion = z.infer<typeof TransferQuestionSchema>

export const UsageSchema = z.object({
  inputTokens: z.number().int().nonnegative().nullable(),
  outputTokens: z.number().int().nonnegative().nullable(),
  estimatedCostUsd: z.number().nonnegative().nullable(),
})
export type Usage = z.infer<typeof UsageSchema>

export const StageNameSchema = z.enum([
  'input_validation',
  'transcription',
  'classification',
  'solving',
  'verification',
  'diagnosis',
  'teaching',
  'transfer_generation',
  'transfer_verification',
])
export type StageName = z.infer<typeof StageNameSchema>

export const StageTraceSchema = z.object({
  stage: StageNameSchema,
  status: z.enum(['completed', 'blocked', 'failed', 'skipped']),
  provider: z.string(),
  model: z.string().nullable(),
  promptVersion: z.string(),
  schemaVersion: z.literal(PIPELINE_SCHEMA_VERSION),
  startedAt: z.string(),
  durationMs: z.number().nonnegative(),
  usage: UsageSchema,
  notes: z.array(z.string()),
  error: z.string().nullable(),
})
export type StageTrace = z.infer<typeof StageTraceSchema>

export const RunStatusSchema = z.enum([
  'complete',
  'clarification_required',
  'unsupported',
  'verification_failed',
  'error',
])
export type RunStatus = z.infer<typeof RunStatusSchema>

export const RunResultSchema = z.object({
  schemaVersion: z.literal(PIPELINE_SCHEMA_VERSION),
  pipelineVersion: z.string(),
  runId: z.string(),
  itemId: z.string(),
  status: RunStatusSchema,
  request: RunRequestSchema,
  transcription: TranscriptionSchema.nullable(),
  classification: ClassificationSchema.nullable(),
  solution: SolutionSchema.nullable(),
  verification: VerificationSchema.nullable(),
  diagnosis: DiagnosisSchema.nullable(),
  teaching: TeachingSchema.nullable(),
  transferQuestion: TransferQuestionSchema.nullable(),
  trace: z.array(StageTraceSchema),
  totals: z.object({
    durationMs: z.number().nonnegative(),
    estimatedCostUsd: z.number().nonnegative().nullable(),
  }),
  blockingReasons: z.array(z.string()),
})
export type RunResult = z.infer<typeof RunResultSchema>

export interface Env {
  MODEL_PROVIDER?: 'mock' | 'anthropic'
  PIPELINE_VERSION?: string
  MAX_IMAGE_BYTES?: string
  ANTHROPIC_API_KEY?: string
  ANTHROPIC_API_URL?: string
  ANTHROPIC_VERSION?: string
  ANTHROPIC_VISION_MODEL?: string
  ANTHROPIC_REASONING_MODEL?: string
  ANTHROPIC_TUTOR_MODEL?: string
  ANTHROPIC_INPUT_USD_PER_MTOK?: string
  ANTHROPIC_OUTPUT_USD_PER_MTOK?: string
}
