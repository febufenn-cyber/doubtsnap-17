# Phase 1 — Internal Truth Engine

Status: **implementation foundation complete; real-model and human benchmark validation pending**

Phase 1 turns the Phase 0 product theory into an inspectable engineering system. It is deliberately an internal console and API, not a polished student application.

## Positional objective

The strategic move is not “call a vision model and display its answer.” The move is to make every failure observable and to prevent one uncertain stage from contaminating everything that follows.

The engine therefore treats the workflow as a sequence of gated positions:

1. validate the payload and image limits
2. transcribe without silently repairing missing evidence
3. stop for student confirmation when a critical field is ambiguous
4. classify against the narrow supported curriculum
5. create a canonical solution
6. solve independently and compare values and units
7. diagnose the first supported misconception or error
8. transform only verified reasoning into teaching
9. generate a near-transfer question
10. independently verify the transfer answer
11. record stage provider, model, prompt version, schema version, latency, and cost

A blocked or failed stage skips dependent stages. The trace makes that decision visible.

## Candidate lines considered

### One multimodal call

Rejected as the core architecture. It is fast to prototype but merges transcription, interpretation, solving, teaching, and quiz generation into one opaque failure surface. A wrong exponent can become a polished false lesson without a clear point of correction.

### Unrestricted autonomous agent

Rejected for Phase 1. An agent with broad tools increases nondeterminism before the basic problem contracts, verification policy, and benchmark are mature.

### Staged provider-adapter pipeline

Chosen. It costs more calls, but creates intervention points, model substitutability, reproducible traces, and explicit stop conditions. The benchmark can later determine which stages may safely be collapsed.

## Hidden threats and current countermeasures

### False independence

Two calls to the same model family can make correlated mistakes. The implementation uses a separate verification call that does not see the canonical solution, but real independence still requires later experiments with alternative models, symbolic solvers, or deterministic calculators.

### JSON compliance is not truth

Schema validation proves shape, not correctness. Zod contracts prevent malformed state from moving forward, while independent answer comparison, unit rules, ambiguity gates, and human evaluation address truth separately.

### Image prompt injection

Text found inside an uploaded image is explicitly fenced as untrusted data. Provider prompts instruct the model not to follow instructions found inside student material. This reduces but does not eliminate model-level prompt injection risk.

### Low-quality images

The API enforces media type, dimensions through the request contract, and a configurable payload ceiling. The Anthropic adapter requests uncertainty spans and clarification. Actual pixel-level blur, crop, rotation, and EXIF processing remain a future image-normalization workstream.

### Teaching before verification

Teaching and transfer generation are unreachable when the solver and independent verifier disagree. This is a binding invariant of the pipeline.

### Language drift

The teaching contract requires equations, values, units, symbols, and directions to remain unchanged across English, Tamil, and Tamil-English output. Real bilingual quality still needs human review.

### Misleading mock success

The deterministic mock provider exists to test orchestration, gating, schemas, API behavior, and regression logic. Its 8/8 starter result is explicitly not a claim about model accuracy.

## Implemented system

### Cloudflare Worker and Hono API

- `GET /` — internal trace console
- `GET /health` — provider and pipeline health metadata
- `POST /api/runs` — execute one structured truth-engine run

The Worker defaults to the deterministic mock provider. Set `MODEL_PROVIDER=anthropic` and supply model names and an API secret to use the Anthropic adapter.

### Versioned contracts

`src/contracts.ts` defines validated contracts for:

- run requests and image input
- transcription and uncertainty spans
- curriculum classification
- canonical solutions and answers
- independent verification
- misconception diagnosis
- teaching variants
- transfer questions
- stage traces and cost metadata
- final run results

### Provider boundary

`TruthEngineProvider` separates business logic from a model vendor. Phase 1 includes:

- `MockProvider` for deterministic tests and starter-eval plumbing
- `AnthropicProvider` using the Messages API through standard `fetch`

Model names and token pricing are configuration, not business logic.

### Safety gates

- no request without text or image
- allowed image formats only
- configurable image-byte ceiling
- critical ambiguity stops before classification and solving
- unsupported scope stops before solving
- solver/verifier disagreement stops teaching
- unverified transfer question prevents a complete run
- student material is treated as untrusted data

### Reproducibility

Run and item identifiers are deterministic hashes of normalized input, pipeline version, provider, mode, language, and confirmed transcription. Every stage records provider, model, prompt version, contract version, timing, usage, notes, and failure state.

## What Phase 1 does not claim

The implementation does not prove:

- reliable handwriting or diagram transcription
- production-grade image preprocessing
- independence when solver and verifier use related models
- correctness across the full mechanics curriculum
- high-quality Tamil or Tamil-English pedagogy
- sustainable live-model cost
- production security, authentication, persistence, or child-data compliance

Those claims require the Phase 0 evidence program and a real-model benchmark.

## Acceptance state

Implemented and automated:

- stage boundaries and provider adapters
- ambiguity and unsupported-scope gates
- independent answer comparison
- unit-presence and basic expected-unit checks
- verified transfer gate
- deterministic identifiers
- structured traces and configurable cost accounting
- internal Hono interface
- Cloudflare Worker configuration
- unit and API tests
- CI workflow
- starter mock evaluation report

Still pending before Phase 1 can be called validated:

- 100+ human-verified benchmark items
- real image corpus with permissions
- baseline runs with configured production candidates
- human review of solution, diagnosis, and bilingual teaching quality
- symbolic or deterministic verification coverage by problem family
- measured latency and cost distributions
- regression cases for every observed S3 and S4 failure

## Next implementation slice inside Phase 1

Do not jump to billing or a student-facing app. The next slice should add:

1. image normalization and uncertainty-region metadata
2. persistent run/evaluation storage
3. human correction and evaluator labels in the internal console
4. benchmark batch execution across provider/model configurations
5. deterministic calculators for the highest-volume mechanics families
6. model-comparison reports with S0–S4 failure classification
