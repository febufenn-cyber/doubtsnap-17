import type {
  Answer,
  Classification,
  Diagnosis,
  RunRequest,
} from '../contracts'
import { type ProviderCall, localMeta } from './provider'

export const PROMPTS = {
  transcription: 'mock-transcription-0.1.0',
  classification: 'mock-classification-0.1.0',
  solving: 'mock-solving-0.1.0',
  verification: 'mock-verification-0.1.0',
  diagnosis: 'mock-diagnosis-0.1.0',
  teaching: 'mock-teaching-0.1.0',
  transfer: 'mock-transfer-0.1.0',
} as const

export function mockCall<T>(data: T, promptVersion: string, notes: string[] = []): ProviderCall<T> {
  return { data, meta: localMeta(promptVersion, ['deterministic mock provider', ...notes]) }
}

export function answer(value: number | string | null, unit: string | null, direction: string | null = null): Answer {
  return { value, unit, tolerance: typeof value === 'number' ? 0.01 : null, direction }
}

function supportedMechanicsText(text: string): boolean {
  const lower = text.toLowerCase()
  return [
    'force',
    'friction',
    'acceleration',
    'velocity',
    'displacement',
    'kinetic energy',
    'normal force',
    'newton',
    'km/h',
    'm/s',
    'mass',
    'motion',
    'graph',
  ].some((term) => lower.includes(term))
}

export function classifyText(text: string, request: RunRequest): Classification {
  const lower = text.toLowerCase()
  if (!supportedMechanicsText(text) || request.context.subject.toLowerCase() !== 'physics') {
    return {
      supported: false,
      curriculum: request.context.curriculum,
      grade: request.context.grade,
      subject: request.context.subject,
      chapter: 'unsupported',
      topic: 'unsupported',
      problemType: 'unsupported',
      reasons: ['The Phase 1 wedge supports Class 11 mechanics only.'],
      confidence: 0.98,
    }
  }

  let chapter = 'laws_of_motion'
  let topic = 'net_force'
  if (lower.includes('km/h') || lower.includes('convert')) {
    chapter = 'units_and_measurement'
    topic = 'unit_conversion'
  } else if (lower.includes('kinetic energy')) {
    chapter = 'work_energy_power'
    topic = 'kinetic_energy'
  } else if (lower.includes('velocity-time') || lower.includes('velocity time') || lower.includes('graph')) {
    chapter = 'motion_in_one_dimension'
    topic = 'motion_graphs'
  } else if (lower.includes('velocity') || lower.includes('acceleration')) {
    chapter = 'motion_in_one_dimension'
    topic = 'acceleration'
  } else if (lower.includes('normal force') || lower.includes('action-reaction')) {
    chapter = 'laws_of_motion'
    topic = 'force_pairs'
  }

  let problemType: Classification['problemType'] = 'numerical'
  if (request.studentAttempt) problemType = 'check_my_work'
  else if (lower.includes('explain') || lower.includes('are the')) problemType = 'conceptual'
  else if (lower.includes('graph')) problemType = 'graph'

  return {
    supported: true,
    curriculum: request.context.curriculum,
    grade: request.context.grade,
    subject: request.context.subject,
    chapter,
    topic,
    problemType,
    reasons: ['Matched the provisional Class 11 mechanics taxonomy.'],
    confidence: 0.92,
  }
}

export function inferMisconception(request: RunRequest, text: string): Diagnosis {
  const combined = `${request.studentAttempt ?? ''} ${text}`.toLowerCase()
  if (combined.includes('12 + 4') || combined.includes('opposite')) {
    return {
      misconceptionCode: 'wrong_force_direction',
      firstError: 'Opposing forces were added instead of subtracted.',
      evidence: ['The student attempt uses 12 + 4 although the forces point in opposite directions.'],
      interventionTarget: 'Represent direction before combining forces.',
      confidence: 0.99,
    }
  }
  if (combined.includes('friction')) {
    return {
      misconceptionCode: 'uses_applied_force_as_net_force',
      firstError: null,
      evidence: ['This problem requires subtracting friction from the applied force.'],
      interventionTarget: 'Distinguish applied force from net force.',
      confidence: 0.9,
    }
  }
  if (combined.includes('normal force')) {
    return {
      misconceptionCode: 'action_reaction_on_same_object',
      firstError: null,
      evidence: ['The compared forces both act on the book.'],
      interventionTarget: 'Identify the body on which each force acts.',
      confidence: 0.95,
    }
  }
  if (combined.includes('km/h')) {
    return {
      misconceptionCode: 'km_per_hour_to_m_per_second',
      firstError: null,
      evidence: ['The question tests conversion between speed units.'],
      interventionTarget: 'Convert numerator and denominator units explicitly.',
      confidence: 0.9,
    }
  }
  return {
    misconceptionCode: null,
    firstError: null,
    evidence: request.studentStuckPoint ? [`Student reported: ${request.studentStuckPoint}`] : [],
    interventionTarget: 'Connect the given quantities to the governing principle.',
    confidence: 0.65,
  }
}
