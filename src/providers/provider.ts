import type {
  Classification,
  Diagnosis,
  IndependentVerification,
  RunRequest,
  Solution,
  Teaching,
  TransferQuestion,
  Transcription,
  Usage,
} from '../contracts'

export interface ProviderMetadata {
  provider: string
  model: string | null
  promptVersion: string
  usage: Usage
  notes: string[]
}

export interface ProviderCall<T> {
  data: T
  meta: ProviderMetadata
}

export interface TruthEngineProvider {
  readonly name: string

  transcribe(request: RunRequest): Promise<ProviderCall<Transcription>>
  classify(request: RunRequest, transcription: Transcription): Promise<ProviderCall<Classification>>
  solve(
    request: RunRequest,
    transcription: Transcription,
    classification: Classification,
  ): Promise<ProviderCall<Solution>>
  verifyIndependently(
    request: RunRequest,
    transcription: Transcription,
    classification: Classification,
  ): Promise<ProviderCall<IndependentVerification>>
  diagnose(
    request: RunRequest,
    transcription: Transcription,
    classification: Classification,
    solution: Solution,
  ): Promise<ProviderCall<Diagnosis>>
  teach(
    request: RunRequest,
    transcription: Transcription,
    classification: Classification,
    solution: Solution,
    diagnosis: Diagnosis,
  ): Promise<ProviderCall<Teaching>>
  generateTransfer(
    request: RunRequest,
    classification: Classification,
    solution: Solution,
    diagnosis: Diagnosis,
  ): Promise<ProviderCall<TransferQuestion>>
  verifyTransfer(
    request: RunRequest,
    transfer: TransferQuestion,
  ): Promise<ProviderCall<IndependentVerification>>
}

export const EMPTY_USAGE: Usage = {
  inputTokens: null,
  outputTokens: null,
  estimatedCostUsd: null,
}

export function localMeta(promptVersion: string, notes: string[] = []): ProviderMetadata {
  return {
    provider: 'local',
    model: null,
    promptVersion,
    usage: EMPTY_USAGE,
    notes,
  }
}
