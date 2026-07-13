import type { Env } from '../contracts'
import { AnthropicProvider } from './anthropic'
import { MockProvider } from './mock'
import type { TruthEngineProvider } from './provider'

export function createProvider(env: Env): TruthEngineProvider {
  const provider = env.MODEL_PROVIDER ?? 'mock'
  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider(env)
    case 'mock':
      return new MockProvider()
    default: {
      const unreachable: never = provider
      throw new Error(`Unsupported MODEL_PROVIDER: ${String(unreachable)}`)
    }
  }
}
