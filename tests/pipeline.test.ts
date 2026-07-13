import { describe, expect, it } from 'vitest'
import type { IndependentVerification } from '../src/contracts'
import { runTruthEngine } from '../src/core/pipeline'
import { MockProvider } from '../src/providers/mock'
import type { ProviderCall } from '../src/providers/provider'

const env = { MODEL_PROVIDER: 'mock' as const, PIPELINE_VERSION: 'phase1-test' }

const frictionRequest = {
  problemText: 'A 5 kg block is pulled horizontally by a 20 N force. Friction opposing the motion is 5 N. Find the acceleration.',
  interactionMode: 'guide_me' as const,
  language: 'english' as const,
  context: { curriculum: 'tamil_nadu_state_board', grade: '11', subject: 'physics' },
}

describe('truth engine pipeline', () => {
  it('completes a supported problem with independent verification and a verified transfer item', async () => {
    const result = await runTruthEngine(frictionRequest, new MockProvider(), env)

    expect(result.status).toBe('complete')
    expect(result.solution?.finalAnswer.value).toBe(3)
    expect(result.verification?.status).toBe('pass')
    expect(result.transferQuestion?.verified).toBe(true)
    expect(result.trace.map((stage) => stage.stage)).toEqual([
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
  })

  it('stops before solving when critical information is ambiguous', async () => {
    const result = await runTruthEngine(
      {
        problemText: 'A block of mass 4 kg is acted on by a force shown in the cropped diagram. Find the acceleration.',
      },
      new MockProvider(),
      env,
    )

    expect(result.status).toBe('clarification_required')
    expect(result.solution).toBeNull()
    expect(result.transcription?.criticalAmbiguity).toBe(true)
    expect(result.trace.find((stage) => stage.stage === 'solving')?.status).toBe('skipped')
  })

  it('returns unsupported for material outside the narrow physics wedge', async () => {
    const result = await runTruthEngine(
      { problemText: 'Balance the chemical equation H2 + O2 -> H2O.', context: { curriculum: 'tn', grade: '11', subject: 'chemistry' } },
      new MockProvider(),
      env,
    )

    expect(result.status).toBe('unsupported')
    expect(result.classification?.supported).toBe(false)
    expect(result.solution).toBeNull()
  })

  it('makes solver and verifier disagreement visible and blocks teaching', async () => {
    class DisagreeingProvider extends MockProvider {
      override async verifyIndependently(): Promise<ProviderCall<IndependentVerification>> {
        return {
          data: {
            answer: { value: 99, unit: 'm/s²', tolerance: 0.01, direction: null },
            methodSummary: 'Intentional test disagreement',
            confidence: 0.99,
          },
          meta: {
            provider: 'test',
            model: 'disagreement-fixture',
            promptVersion: 'test-0.1.0',
            usage: { inputTokens: null, outputTokens: null, estimatedCostUsd: null },
            notes: [],
          },
        }
      }
    }

    const result = await runTruthEngine(frictionRequest, new DisagreeingProvider(), env)
    expect(result.status).toBe('verification_failed')
    expect(result.verification?.disagreements).toHaveLength(1)
    expect(result.teaching).toBeNull()
    expect(result.trace.find((stage) => stage.stage === 'teaching')?.status).toBe('skipped')
  })

  it('generates reproducible identifiers for identical inputs and configuration', async () => {
    const first = await runTruthEngine(frictionRequest, new MockProvider(), env)
    const second = await runTruthEngine(frictionRequest, new MockProvider(), env)
    expect(first.itemId).toBe(second.itemId)
    expect(first.runId).toBe(second.runId)
  })

  it('rejects oversized images before any model stage', async () => {
    const result = await runTruthEngine(
      {
        image: { mediaType: 'image/png', base64: 'a'.repeat(100) },
      },
      new MockProvider(),
      { ...env, MAX_IMAGE_BYTES: '10' },
    )
    expect(result.status).toBe('unsupported')
    expect(result.transcription).toBeNull()
    expect(result.trace[0]?.stage).toBe('input_validation')
    expect(result.trace[0]?.status).toBe('blocked')
  })
})
