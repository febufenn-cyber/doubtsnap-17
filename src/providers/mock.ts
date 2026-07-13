import type {
  Classification,
  Diagnosis,
  IndependentVerification,
  RunRequest,
  Solution,
  Teaching,
  TransferQuestion,
  Transcription,
} from '../contracts'
import { answer, classifyText, inferMisconception, mockCall, PROMPTS } from './mock-common'
import { solveText } from './mock-solver'
import type { ProviderCall, TruthEngineProvider } from './provider'

export class MockProvider implements TruthEngineProvider {
  readonly name = 'mock'

  async transcribe(request: RunRequest): Promise<ProviderCall<Transcription>> {
    const original = request.problemText ?? '[image supplied to mock provider]'
    const effective = request.confirmedTranscription ?? original
    const lower = effective.toLowerCase()
    const criticalAmbiguity = lower.includes('cropped') || lower.includes('[unclear]') || lower.includes('missing because')
    const uncertaintySpans = criticalAmbiguity
      ? [
          {
            text: lower.includes('diagram') ? 'diagram force' : 'critical value',
            reason: 'The input explicitly indicates missing or unreadable critical information.',
            critical: true,
            confidence: 0.25,
          },
        ]
      : []

    return mockCall(
      {
        originalText: original,
        correctedText: request.confirmedTranscription ?? null,
        effectiveText: effective,
        knownValues: [],
        requiredQuantities: lower.includes('find') ? [effective.split(/find/i)[1]?.trim() || 'requested quantity'] : [],
        diagramElements: lower.includes('diagram') || lower.includes('graph') ? ['visual element mentioned in problem text'] : [],
        uncertaintySpans,
        imageQuality: {
          score: criticalAmbiguity ? 0.35 : 1,
          issues: criticalAmbiguity ? ['critical content missing or unclear'] : [],
        },
        criticalAmbiguity,
        clarificationQuestions: criticalAmbiguity
          ? ['Please upload the complete diagram or confirm the missing force magnitude and direction.']
          : [],
        confidence: criticalAmbiguity ? 0.4 : 1,
      },
      PROMPTS.transcription,
      request.image ? ['mock provider does not inspect pixels'] : ['direct text path'],
    )
  }

  async classify(request: RunRequest, transcription: Transcription): Promise<ProviderCall<Classification>> {
    return mockCall(classifyText(transcription.effectiveText, request), PROMPTS.classification)
  }

  async solve(
    request: RunRequest,
    transcription: Transcription,
    _classification: Classification,
  ): Promise<ProviderCall<Solution>> {
    return mockCall(solveText(transcription.effectiveText, request), PROMPTS.solving)
  }

  async verifyIndependently(
    request: RunRequest,
    transcription: Transcription,
    _classification: Classification,
  ): Promise<ProviderCall<IndependentVerification>> {
    const independent = solveText(transcription.effectiveText, { ...request, studentAttempt: undefined })
    return mockCall(
      {
        answer: independent.finalAnswer,
        methodSummary: independent.method.join(' → '),
        confidence: Math.min(independent.confidence, 0.99),
      },
      PROMPTS.verification,
      ['independent deterministic recomputation'],
    )
  }

  async diagnose(
    request: RunRequest,
    transcription: Transcription,
    _classification: Classification,
    _solution: Solution,
  ): Promise<ProviderCall<Diagnosis>> {
    return mockCall(inferMisconception(request, transcription.effectiveText), PROMPTS.diagnosis)
  }

  async teach(
    request: RunRequest,
    _transcription: Transcription,
    _classification: Classification,
    solution: Solution,
    diagnosis: Diagnosis,
  ): Promise<ProviderCall<Teaching>> {
    const final = `${solution.finalAnswer.value}${solution.finalAnswer.unit ? ` ${solution.finalAnswer.unit}` : ''}`
    const languagePrefix = request.language === 'tamil_english' ? 'Concept-a first identify pannuvom.' : request.language === 'tamil' ? 'முதலில் கருத்தை கண்டறிவோம்.' : 'Let us identify the key idea first.'
    return mockCall(
      {
        mode: request.interactionMode,
        language: request.language,
        opening: languagePrefix,
        minimalHint: diagnosis.interventionTarget,
        guidedSteps: solution.steps.map((step) => `${step.explanation} ${step.expression}`),
        fullExplanation: `${solution.method.join(' Then ')}. The verified answer is ${final}.`,
        conceptRecap: solution.governingPrinciples.join('; '),
        commonMistake: diagnosis.firstError ?? diagnosis.interventionTarget,
        confidence: 0.9,
      },
      PROMPTS.teaching,
    )
  }

  async generateTransfer(
    _request: RunRequest,
    classification: Classification,
    solution: Solution,
    diagnosis: Diagnosis,
  ): Promise<ProviderCall<TransferQuestion>> {
    let transfer: TransferQuestion
    if (classification.topic === 'net_force') {
      transfer = {
        question: 'A 4 kg block is pulled right by 18 N while friction is 6 N left. Find its acceleration.',
        targetMisconception: diagnosis.misconceptionCode,
        answer: answer(3, 'm/s²', 'right'),
        method: ['Fnet = 18 - 6 = 12 N', 'a = 12/4 = 3 m/s²'],
        verified: false,
        verificationNotes: [],
        confidence: 0.95,
      }
    } else if (classification.topic === 'unit_conversion') {
      transfer = {
        question: 'Convert 54 km/h into m/s.',
        targetMisconception: diagnosis.misconceptionCode,
        answer: answer(15, 'm/s'),
        method: ['54 × 5/18 = 15'],
        verified: false,
        verificationNotes: [],
        confidence: 0.98,
      }
    } else if (classification.topic === 'kinetic_energy') {
      transfer = {
        question: 'Find the kinetic energy of a 4 kg object moving at 2 m/s.',
        targetMisconception: diagnosis.misconceptionCode,
        answer: answer(8, 'J'),
        method: ['K = 1/2 × 4 × 2² = 8 J'],
        verified: false,
        verificationNotes: [],
        confidence: 0.98,
      }
    } else if (classification.topic === 'acceleration') {
      transfer = {
        question: 'A cyclist changes velocity from 4 m/s to 16 m/s in 6 s. Find the uniform acceleration.',
        targetMisconception: diagnosis.misconceptionCode,
        answer: answer(2, 'm/s²'),
        method: ['a = (16 - 4) / 6 = 2 m/s²'],
        verified: false,
        verificationNotes: [],
        confidence: 0.98,
      }
    } else if (classification.topic === 'motion_graphs') {
      transfer = {
        question: 'A velocity-time graph is horizontal at 5 m/s for 3 s. Find the displacement.',
        targetMisconception: diagnosis.misconceptionCode,
        answer: answer(15, 'm'),
        method: ['Displacement = area under graph = 5 × 3 = 15 m'],
        verified: false,
        verificationNotes: [],
        confidence: 0.98,
      }
    } else if (classification.topic === 'force_pairs') {
      transfer = {
        question: 'A hand pushes a wall. Are the force of the hand on the wall and the force of the wall on the hand an action-reaction pair?',
        targetMisconception: diagnosis.misconceptionCode,
        answer: answer('Yes', null),
        method: ['The forces are equal and opposite and act on different bodies.'],
        verified: false,
        verificationNotes: [],
        confidence: 0.98,
      }
    } else {
      transfer = {
        question: `Use the same principle (${solution.governingPrinciples[0]}) in a problem with different numbers.`,
        targetMisconception: diagnosis.misconceptionCode,
        answer: answer(null, null),
        method: ['Teacher review required for this fallback transfer item.'],
        verified: false,
        verificationNotes: ['Fallback transfer item is intentionally not auto-verified.'],
        confidence: 0.4,
      }
    }
    return mockCall(transfer, PROMPTS.transfer)
  }

  async verifyTransfer(_request: RunRequest, transfer: TransferQuestion): Promise<ProviderCall<IndependentVerification>> {
    return mockCall(
      {
        answer: transfer.answer,
        methodSummary: transfer.method.join(' → '),
        confidence: transfer.answer.value === null ? 0.4 : 0.99,
      },
      PROMPTS.verification,
      ['deterministic transfer-answer check'],
    )
  }
}
