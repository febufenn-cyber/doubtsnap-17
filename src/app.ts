import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import type { Env } from './contracts'
import { runTruthEngine } from './core/pipeline'
import { createProvider } from './providers/factory'
import { INTERNAL_UI_HTML } from './ui/internal'

export function createApp() {
  const app = new Hono<{ Bindings: Env }>()

  app.use('*', secureHeaders())

  app.get('/health', (c) =>
    c.json({
      ok: true,
      service: 'doubtsnap-truth-engine',
      pipelineVersion: c.env.PIPELINE_VERSION ?? 'phase1-0.1.0',
      provider: c.env.MODEL_PROVIDER ?? 'mock',
    }),
  )

  app.get('/', (c) => c.html(INTERNAL_UI_HTML))

  app.post('/api/runs', async (c) => {
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json({ error: 'Request body must be valid JSON.' }, 400)
    }

    try {
      const provider = createProvider(c.env)
      const result = await runTruthEngine(body, provider, c.env)
      const status = result.status === 'error' ? 422 : 200
      return c.json(result, status)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return c.json({ error: message }, 500)
    }
  })

  app.notFound((c) => c.json({ error: 'Not found' }, 404))

  return app
}
