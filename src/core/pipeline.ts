import {
  PIPELINE_SCHEMA_VERSION,
  RunRequestSchema,
  type Env,
  type RunRequest,
  type RunResult,
  type StageName,
  type StageTrace,
} from '../contracts'
import type { TruthEngineProvider } from '../providers/provider'
import { deterministicId } from './hash'
import {
  REMAINING_STAGES,
  finish,
  imageByteSize,
  localTrace,
  nowIso,
  providerStage,
  skippedTrace,
} from './pipeline-support'
import { combineVerification, verifyTransferAgreement } from './verification'

export async function runTruthEngine(
  rawRequest: unknown,
  provider: TruthEngineProvider,
  env: Env = {},
): Promise<RunResult> {
  const started = performance.now()
  const trace: StageTrace[] = []
  let currentStage: StageName = 'input_validation'
  const pipelineVersion = env.PIPELINE_VERSION ?? 'phase1-0.1.0'

  let request: RunRequest
  try {
    request = RunRequestSchema.parse(rawRequest)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    trace.push(
      localTrace({
        stage: 'input_validation',
        status: 'failed',
        startedAt: nowIso(),
        durationMs: Math.max(0, performance.now() - started),
        promptVersion: 'input-validation-0.1.0',
        error: message,
      }),
    )
    const fallbackRequest = RunRequestSchema.parse({ problemText: 'Invalid request placeholder' })
    const itemId = await deterministicId('item', rawRequest)
    const runId = await deterministicId('run', { rawRequest, pipelineVersion, provider: provider.name })
    return finish(
      {
        schemaVersion: PIPELINE_SCHEMA_VERSION,
        pipelineVersion,
        runId,
        itemId,
        status: 'error',
        request: fallbackRequest,
        transcription: null,
        classification: null,
        solution: null,
        verification: null,
        diagnosis: null,
        teaching: null,
        transferQuestion: null,
        trace,
        blockingReasons: [message],
      },
      started,
    )
  }

  const itemId = await deterministicId('item', {
    benchmarkId: request.benchmarkId ?? null,
    problemText: request.problemText ?? null,
    image: request.image
      ? { mediaType: request.image.mediaType, base64Hash: await deterministicId('image', request.image.base64) }
      : null,
    studentAttempt: request.studentAttempt ?? null,
  })
  const runId = await deterministicId('run', {
    itemId,
    pipelineVersion,
    provider: provider.name,
    mode: request.interactionMode,
    language: request.language,
    confirmedTranscription: request.confirmedTranscription ?? null,
  })

  const validationStarted = performance.now()
  const validationNotes: string[] = ['Student-supplied text and image contents are treated as untrusted data.']
  const maxImageBytes = Number(env.MAX_IMAGE_BYTES ?? 10_000_000)
  if (request.image) {
    const bytes = imageByteSize(request.image.base64)
    validationNotes.push(`Estimated image payload: ${bytes} bytes.`)
    if (!Number.isFinite(maxImageBytes) || maxImageBytes <= 0) {
      validationNotes.push('MAX_IMAGE_BYTES was invalid; default safety ceiling was used.')
    }
    const ceiling = Number.isFinite(maxImageBytes) && maxImageBytes > 0 ? maxImageBytes : 10_000_000
    if (bytes > ceiling) {
      const reason = `Image exceeds the configured ${ceiling}-byte limit.`
      trace.push(
        localTrace({
          stage: 'input_validation',
          status: 'blocked',
          startedAt: nowIso(),
          durationMs: Math.max(0, performance.now() - validationStarted),
          promptVersion: 'input-validation-0.1.0',
          notes: validationNotes,
          error: reason,
        }),
      )
      trace.push(...REMAINING_STAGES.map((stage) => skippedTrace(stage, reason)))
      return finish(
        {
          schemaVersion: PIPELINE_SCHEMA_VERSION,
          pipelineVersion,
          runId,
          itemId,
          status: 'unsupported',
          request,
          transcription: null,
          classification: null,
          solution: null,
          verification: null,
          diagnosis: null,
          teaching: null,
          transferQuestion: null,
          trace,
          blockingReasons: [reason],
        },
        started,
      )
    }
  }
  trace.push(
    localTrace({
      stage: 'input_validation',
      status: 'completed',
      startedAt: nowIso(),
      durationMs: Math.max(0, performance.now() - validationStarted),
      promptVersion: 'input-validation-0.1.0',
      notes: validationNotes,
    }),
  )

  let transcription = null
  let classification = null
  let solution = null
  let verification = null
  let diagnosis = null
  let teaching = null
  let transferQuestion = null

  try {
    currentStage = 'transcription'
    const transcriptionOutcome = await providerStage('transcription', () => provider.transcribe(request))
    transcription = transcriptionOutcome.data
    trace.push(transcriptionOutcome.trace)

    if (transcription.criticalAmbiguity && !request.confirmedTranscription) {
      const reason = transcription.clarificationQuestions[0] ?? 'Critical problem information is ambiguous.'
      trace.push(...REMAINING_STAGES.map((stage) => skippedTrace(stage, reason)))
      return finish(
        {
          schemaVersion: PIPELINE_SCHEMA_VERSION,
          pipelineVersion,
          runId,
          itemId,
          status: 'clarification_required',
          request,
          transcription,
          classification: null,
          solution: null,
          verification: null,
          diagnosis: null,
          teaching: null,
          transferQuestion: null,
          trace,
          blockingReasons: [reason],
        },
        started,
      )
    }

    currentStage = 'classification'
    const classificationOutcome = await providerStage('classification', () => provider.classify(request, transcription!))
    classification = classificationOutcome.data
    trace.push(classificationOutcome.trace)

    if (!classification.supported) {
      const reason = classification.reasons.join(' ') || 'Problem is outside the supported Phase 1 scope.'
      trace.push(...REMAINING_STAGES.slice(1).map((stage) => skippedTrace(stage, reason)))
      return finish(
        {
          schemaVersion: PIPELINE_SCHEMA_VERSION,
          pipelineVersion,
          runId,
          itemId,
          status: 'unsupported',
          request,
          transcription,
          classification,
          solution: null,
          verification: null,
          diagnosis: null,
          teaching: null,
          transferQuestion: null,
          trace,
          blockingReasons: [reason],
        },
        started,
      )
    }

    currentStage = 'solving'
    const solutionOutcome = await providerStage('solving', () => provider.solve(request, transcription!, classification!))
    solution = solutionOutcome.data
    trace.push(solutionOutcome.trace)

    currentStage = 'verification'
    const independentOutcome = await providerStage('verification', () =>
      provider.verifyIndependently(request, transcription!, classification!),
    )
    trace.push(independentOutcome.trace)
    verification = combineVerification({
      solution,
      independent: independentOutcome.data,
      requiredQuantities: transcription.requiredQuantities,
    })

    if (verification.status !== 'pass') {
      const reason = verification.disagreements[0] ?? 'Canonical solution failed verification.'
      trace.push(...REMAINING_STAGES.slice(3).map((stage) => skippedTrace(stage, reason)))
      return finish(
        {
          schemaVersion: PIPELINE_SCHEMA_VERSION,
          pipelineVersion,
          runId,
          itemId,
          status: 'verification_failed',
          request,
          transcription,
          classification,
          solution,
          verification,
          diagnosis: null,
          teaching: null,
          transferQuestion: null,
          trace,
          blockingReasons: [reason],
        },
        started,
      )
    }

    currentStage = 'diagnosis'
    const diagnosisOutcome = await providerStage('diagnosis', () =>
      provider.diagnose(request, transcription!, classification!, solution!),
    )
    diagnosis = diagnosisOutcome.data
    trace.push(diagnosisOutcome.trace)

    currentStage = 'teaching'
    const teachingOutcome = await providerStage('teaching', () =>
      provider.teach(request, transcription!, classification!, solution!, diagnosis!),
    )
    teaching = teachingOutcome.data
    trace.push(teachingOutcome.trace)

    currentStage = 'transfer_generation'
    const transferOutcome = await providerStage('transfer_generation', () =>
      provider.generateTransfer(request, classification!, solution!, diagnosis!),
    )
    transferQuestion = transferOutcome.data
    trace.push(transferOutcome.trace)

    currentStage = 'transfer_verification'
    const transferVerificationOutcome = await providerStage('transfer_verification', () =>
      provider.verifyTransfer(request, transferQuestion!),
    )
    trace.push(transferVerificationOutcome.trace)
    const transferAgreement = verifyTransferAgreement(transferQuestion, transferVerificationOutcome.data)
    transferQuestion = {
      ...transferQuestion,
      verified: transferAgreement.verified,
      verificationNotes: transferAgreement.notes,
    }

    if (!transferQuestion.verified) {
      return finish(
        {
          schemaVersion: PIPELINE_SCHEMA_VERSION,
          pipelineVersion,
          runId,
          itemId,
          status: 'verification_failed',
          request,
          transcription,
          classification,
          solution,
          verification,
          diagnosis,
          teaching,
          transferQuestion,
          trace,
          blockingReasons: ['Generated transfer question did not pass independent verification.'],
        },
        started,
      )
    }

    return finish(
      {
        schemaVersion: PIPELINE_SCHEMA_VERSION,
        pipelineVersion,
        runId,
        itemId,
        status: 'complete',
        request,
        transcription,
        classification,
        solution,
        verification,
        diagnosis,
        teaching,
        transferQuestion,
        trace,
        blockingReasons: [],
      },
      started,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    trace.push(
      localTrace({
        stage: currentStage,
        status: 'failed',
        startedAt: nowIso(),
        durationMs: 0,
        promptVersion: 'pipeline-error-0.1.0',
        error: message,
      }),
    )
    return finish(
      {
        schemaVersion: PIPELINE_SCHEMA_VERSION,
        pipelineVersion,
        runId,
        itemId,
        status: 'error',
        request,
        transcription,
        classification,
        solution,
        verification,
        diagnosis,
        teaching,
        transferQuestion,
        trace,
        blockingReasons: [message],
      },
      started,
    )
  }
}
