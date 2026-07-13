import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

const env = { MODEL_PROVIDER: 'mock' as const, PIPELINE_VERSION: 'phase1-test' }

describe('internal Hono app', () => {
  it('reports health', async () => {
    const response = await createApp().request('/health', {}, env)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ ok: true, provider: 'mock' })
  })

  it('runs a problem through the API', async () => {
    const response = await createApp().request(
      '/api/runs',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          problemText: 'Convert 72 km/h into m/s.',
          language: 'english',
          interactionMode: 'guide_me',
        }),
      },
      env,
    )
    expect(response.status).toBe(200)
    const body = (await response.json()) as { status: string; solution: { finalAnswer: { value: number } } }
    expect(body.status).toBe('complete')
    expect(body.solution.finalAnswer.value).toBe(20)
  })
})
