# Phase 1 Architecture and Operations

## Code map

- `src/index.ts` — Cloudflare Worker entrypoint
- `src/app.ts` — Hono routes and HTTP error handling
- `src/contracts.ts` — runtime-validated Phase 1 contracts
- `src/core/pipeline.ts` — gated orchestration and stage tracing
- `src/core/verification.ts` — local checks and solver/verifier comparison
- `src/core/answer.ts` — answer and unit normalization
- `src/core/hash.ts` — stable serialization and deterministic identifiers
- `src/providers/provider.ts` — vendor-neutral provider interface
- `src/providers/mock.ts` — deterministic plumbing provider
- `src/providers/anthropic.ts` — image/text Messages API adapter
- `src/providers/factory.ts` — environment-driven provider selection
- `src/ui/internal.ts` — internal trace console
- `scripts/evaluate-starter.ts` — reproducible starter dataset smoke evaluation
- `tests/` — pipeline and HTTP regression tests

## Local operation

```bash
npm install
npm run check
npm run dev
```

Open the local Wrangler URL, submit a text problem or image, and inspect the full structured result and stage trace.

## Anthropic configuration

Copy `.dev.vars.example` to `.dev.vars` and configure:

- `MODEL_PROVIDER=anthropic`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_VISION_MODEL`
- `ANTHROPIC_REASONING_MODEL`
- `ANTHROPIC_TUTOR_MODEL`

Optional per-million-token rates enable estimated per-stage cost reporting. No API key or hardcoded production model name is committed.

The adapter sends image content before the text prompt, uses base64 image content blocks, and treats all problem and student content as untrusted data. Images should be resized and inspected before production use; the current implementation only enforces payload and declared-dimension limits.

## API request

```json
{
  "problemText": "A 5 kg block is pulled by 20 N while friction is 5 N. Find acceleration.",
  "studentAttempt": "I used 20/5.",
  "studentStuckPoint": "I do not understand net force.",
  "interactionMode": "check_my_work",
  "language": "english",
  "context": {
    "curriculum": "tamil_nadu_state_board",
    "grade": "11",
    "subject": "physics"
  }
}
```

An image request adds:

```json
{
  "image": {
    "mediaType": "image/jpeg",
    "base64": "...",
    "width": 1200,
    "height": 1600
  }
}
```

## Run statuses

- `complete` — original and transfer solutions passed verification
- `clarification_required` — critical transcription evidence is missing or ambiguous
- `unsupported` — input or subject is outside the Phase 1 boundary
- `verification_failed` — solution or transfer answer disagrees with independent verification
- `error` — malformed input, provider failure, schema failure, or unhandled stage error

## Verification boundary

Current local checks cover:

- method and step presence
- units on numerical answers
- basic requested-quantity unit expectations
- numeric/string answer agreement within declared tolerance
- normalized equivalent units such as `m/s^2` and `m/s²`

This is not a general symbolic physics verifier. Provider-independent calculators should be added per problem family as benchmark evidence reveals the highest-value targets.

## Validation commands

```bash
npm run typecheck
npm test
npm run eval:starter
npx wrangler deploy --dry-run
```

`npm run eval:starter` writes `evals/reports/starter-mock-smoke.json`. That report validates orchestration only and must never be presented as live-model accuracy.
