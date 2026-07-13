import {
  ClassificationSchema,
  DiagnosisSchema,
  IndependentVerificationSchema,
  SolutionSchema,
  TeachingSchema,
  TransferQuestionSchema,
  TranscriptionSchema,
  type Classification,
  type Diagnosis,
  type Env,
  type IndependentVerification,
  type RunRequest,
  type Solution,
  type Teaching,
  type TransferQuestion,
  type Transcription,
} from '../contracts'
import { ANTHROPIC_PROMPT_VERSION, AnthropicJsonClient, dataFence } from './anthropic-client'
import { type ProviderCall, type TruthEngineProvider, localMeta } from './provider'

export class AnthropicProvider implements TruthEngineProvider {
  readonly name = 'anthropic'
  private readonly client: AnthropicJsonClient

  constructor(env: Env) {
    this.client = new AnthropicJsonClient(env)
  }

  async transcribe(request: RunRequest): Promise<ProviderCall<Transcription>> {
    if (!request.image) {
      const originalText = request.problemText ?? ''
      return {
        data: {
          originalText,
          correctedText: request.confirmedTranscription ?? null,
          effectiveText: request.confirmedTranscription ?? originalText,
          knownValues: [],
          requiredQuantities: [],
          diagramElements: [],
          uncertaintySpans: [],
          imageQuality: { score: 1, issues: [] },
          criticalAmbiguity: false,
          clarificationQuestions: [],
          confidence: 1,
        },
        meta: localMeta(`${ANTHROPIC_PROMPT_VERSION}:direct-text`, ['No image call was needed.']),
      }
    }
    const prompt = [
      'Inspect the image as a school-physics problem. Reconstruct only what is visible.',
      'Return originalText, correctedText, effectiveText, knownValues, requiredQuantities, diagramElements, uncertaintySpans, imageQuality, criticalAmbiguity, clarificationQuestions, confidence.',
      'Each quantity needs name, symbol, value, unit, source, confidence. Each uncertainty needs text, reason, critical, confidence.',
      'If any missing value, sign, exponent, unit, vector direction, or diagram label can change the solution, set criticalAmbiguity=true.',
      dataFence('student-confirmed-transcription', request.confirmedTranscription ?? null),
      dataFence('supplemental-problem-text', request.problemText ?? null),
    ].join('\n')
    return this.client.callJson({
      stage: 'transcription',
      model: this.client.model('vision'),
      schema: TranscriptionSchema,
      prompt,
      image: request.image,
    })
  }

  async classify(request: RunRequest, transcription: Transcription): Promise<ProviderCall<Classification>> {
    return this.client.callJson({
      stage: 'classification',
      model: this.client.model('reasoning'),
      schema: ClassificationSchema,
      prompt: [
        'Classify against Tamil Nadu State Board Class 11 Physics mechanics only.',
        'Return supported, curriculum, grade, subject, chapter, topic, problemType, reasons, confidence.',
        dataFence('request-context', request.context),
        dataFence('problem-data', transcription),
      ].join('\n'),
    })
  }

  async solve(request: RunRequest, transcription: Transcription, classification: Classification): Promise<ProviderCall<Solution>> {
    return this.client.callJson({
      stage: 'canonical-solving',
      model: this.client.model('reasoning'),
      schema: SolutionSchema,
      prompt: [
        'Create a syllabus-compatible canonical solution, without tutoring or diagnosis.',
        'Return governingPrinciples, method, steps, assumptions, finalAnswer, confidence.',
        'Each step needs id, expression, explanation, value, unit. finalAnswer needs value, unit, tolerance, direction.',
        dataFence('problem-data', transcription),
        dataFence('classification-data', classification),
        dataFence('student-attempt-data', request.studentAttempt ?? null),
      ].join('\n'),
    })
  }

  async verifyIndependently(
    _request: RunRequest,
    transcription: Transcription,
    classification: Classification,
  ): Promise<ProviderCall<IndependentVerification>> {
    return this.client.callJson({
      stage: 'independent-verification',
      model: this.client.model('reasoning'),
      schema: IndependentVerificationSchema,
      prompt: [
        'Independently solve without seeing any prior answer. Check signs, dimensions, units, direction, and plausibility.',
        'Return answer, methodSummary, confidence. answer needs value, unit, tolerance, direction.',
        dataFence('problem-data', transcription),
        dataFence('classification-data', classification),
      ].join('\n'),
    })
  }

  async diagnose(
    request: RunRequest,
    transcription: Transcription,
    classification: Classification,
    solution: Solution,
  ): Promise<ProviderCall<Diagnosis>> {
    return this.client.callJson({
      stage: 'misconception-diagnosis',
      model: this.client.model('reasoning'),
      schema: DiagnosisSchema,
      prompt: [
        'Identify the first supported error or likely misconception. Do not invent a student error without evidence.',
        'Return misconceptionCode, firstError, evidence, interventionTarget, confidence.',
        dataFence('problem-data', transcription),
        dataFence('classification-data', classification),
        dataFence('canonical-solution-data', solution),
        dataFence('student-attempt-data', request.studentAttempt ?? null),
        dataFence('student-stuck-point-data', request.studentStuckPoint ?? null),
      ].join('\n'),
    })
  }

  async teach(
    request: RunRequest,
    transcription: Transcription,
    classification: Classification,
    solution: Solution,
    diagnosis: Diagnosis,
  ): Promise<ProviderCall<Teaching>> {
    return this.client.callJson({
      stage: 'teaching-transformation',
      model: this.client.model('tutor'),
      schema: TeachingSchema,
      prompt: [
        'Transform verified reasoning into patient teaching. Preserve equations, values, units, symbols, and directions exactly.',
        'Return mode, language, opening, minimalHint, guidedSteps, fullExplanation, conceptRecap, commonMistake, confidence.',
        dataFence('preferences', { mode: request.interactionMode, language: request.language }),
        dataFence('problem-data', transcription),
        dataFence('classification-data', classification),
        dataFence('verified-solution-data', solution),
        dataFence('diagnosis-data', diagnosis),
      ].join('\n'),
    })
  }

  async generateTransfer(
    _request: RunRequest,
    classification: Classification,
    solution: Solution,
    diagnosis: Diagnosis,
  ): Promise<ProviderCall<TransferQuestion>> {
    return this.client.callJson({
      stage: 'transfer-generation',
      model: this.client.model('tutor'),
      schema: TransferQuestionSchema,
      prompt: [
        'Create one near-transfer question testing the same concept with different surface details.',
        'Return question, targetMisconception, answer, method, verified=false, verificationNotes=[], confidence.',
        dataFence('classification-data', classification),
        dataFence('canonical-solution-data', solution),
        dataFence('diagnosis-data', diagnosis),
      ].join('\n'),
    })
  }

  async verifyTransfer(_request: RunRequest, transfer: TransferQuestion): Promise<ProviderCall<IndependentVerification>> {
    return this.client.callJson({
      stage: 'transfer-verification',
      model: this.client.model('reasoning'),
      schema: IndependentVerificationSchema,
      prompt: [
        'Independently solve this generated transfer question without trusting its supplied answer.',
        'Return answer, methodSummary, confidence. answer needs value, unit, tolerance, direction.',
        dataFence('transfer-question-data', { question: transfer.question }),
      ].join('\n'),
    })
  }
}
