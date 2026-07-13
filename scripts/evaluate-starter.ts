import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { runTruthEngine } from '../src/core/pipeline'
import { MockProvider } from '../src/providers/mock'

interface StarterItem {
  id: string
  canonical_transcription: string
  clarification_required: boolean
  final_answer: { value: number | string | null; unit: string | null; tolerance: number | null } | null
}

const datasetPath = new URL('../evals/starter-dataset.jsonl', import.meta.url)
const reportPath = new URL('../evals/reports/starter-mock-smoke.json', import.meta.url)
const text = await readFile(datasetPath, 'utf8')
const items = text
  .split('\n')
  .filter(Boolean)
  .map((line: string) => JSON.parse(line) as StarterItem)

const provider = new MockProvider()
const results = []
for (const item of items) {
  const run = await runTruthEngine(
    {
      benchmarkId: item.id,
      problemText: item.canonical_transcription,
      interactionMode: item.id.includes('_work_') ? 'check_my_work' : 'guide_me',
      language: 'english',
      context: { curriculum: 'tamil_nadu_state_board', grade: '11', subject: 'physics' },
    },
    provider,
    { MODEL_PROVIDER: 'mock', PIPELINE_VERSION: 'phase1-0.1.0' },
  )

  const expectedStatus = item.clarification_required ? 'clarification_required' : 'complete'
  const statusPass = run.status === expectedStatus
  const answerPass = item.final_answer === null || run.solution?.finalAnswer.value === item.final_answer.value
  results.push({
    id: item.id,
    expectedStatus,
    actualStatus: run.status,
    statusPass,
    answerPass,
    runId: run.runId,
    durationMs: run.totals.durationMs,
  })
}

const report = {
  generatedAt: new Date().toISOString(),
  purpose: 'Pipeline plumbing smoke test using the deterministic mock provider; not a model-accuracy claim.',
  provider: 'mock',
  pipelineVersion: 'phase1-0.1.0',
  total: results.length,
  passed: results.filter((result) => result.statusPass && result.answerPass).length,
  failed: results.filter((result) => !result.statusPass || !result.answerPass).length,
  results,
}

await mkdir(dirname(reportPath.pathname), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (report.failed > 0) process.exitCode = 1
