# Phase 2 — Validation Lab

Status: **implemented pending real-world validation**

Phase 2 turns the Phase 1 truth-engine pipeline into a persistent, human-reviewable and batch-measurable reliability system. The implementation proves the technical plumbing with deterministic fixtures; it does not claim live-model or student-facing accuracy.

## Implemented

### Image normalization

- safe decoding for JPEG, PNG, WebP and single-page GIF inputs
- configurable byte and pixel ceilings
- EXIF orientation normalization
- dimension-preserving resize with no enlargement
- metadata removal through clean re-encoding
- original and normalized SHA-256 hashes
- blur, contrast, glare, border and resolution signals
- normalized coordinate contracts for uncertainty regions
- explicit rejection of corrupt, oversized, animated and multi-page inputs

The `sharp` normalizer is an internal Node ingestion tool. The Worker does not import the native module, keeping the Cloudflare runtime deployable.

### Persistence and retention

- `LabRepository` interface
- deterministic in-memory repository for CI
- Supabase REST repository adapter
- versioned SQL migration with RLS enabled and no public client policies
- stored truth-engine runs, traces, benchmark records, batch manifests and evaluation events
- append-only evaluator revisions
- default redaction of raw image bytes
- opt-in raw image retention with an expiry timestamp
- purge operation that removes expired image bytes while preserving non-sensitive run evidence

### Human evaluation console

- `/lab` run list and filters
- source and normalized image inspection when bytes are retained
- uncertainty-region display
- complete structured trace inspection
- append-only stage or run decisions
- S0–S4 labels and evaluator notes
- corrected-record export without destructive overwrite

### Batch validation

- deterministic manifest IDs
- JSONL-compatible benchmark records
- bounded concurrency
- resumable/idempotent manifests
- per-item attempts and errors
- provider, prompt-set and benchmark version identifiers
- aggregate status, severity, latency, cost and failure-cluster reports

### Deterministic verification

The validation gate currently supports:

- km/h to m/s conversion
- uniform acceleration
- opposing-force/Newton's second-law problems
- kinetic energy
- rectangular velocity-time graph area

A deterministic disagreement changes the run to `verification_failed` and removes teaching and transfer output. Results are never averaged together.

## API surface

- `POST /api/runs` — run and persist one truth-engine evaluation
- `GET /api/lab/runs` — filter stored runs
- `GET /api/lab/runs/:runId` — inspect a run
- `GET /api/lab/runs/:runId/export` — export run plus correction history
- `POST /api/lab/evaluations` — append evaluator evidence
- `GET /api/lab/evaluations` — list audit events
- `POST /api/lab/batches` — run a bounded benchmark batch
- `GET /api/lab/reports` — aggregate validation evidence

## Technical validation

Passed in the implementation environment:

- strict TypeScript typecheck
- 9 Vitest files / 23 tests
- Phase 1 ambiguity, unsupported-scope and verification regression tests
- image metadata, orientation, resize, corrupt-input and size-limit tests
- uncertainty-coordinate contract tests
- append-only repository and raw-image retention/purge tests
- migration structure tests
- resumable batch and report tests
- five calculator-family tests and deterministic disagreement gate
- original starter evaluation: 8/8
- Phase 2 mock batch: 8/8 processed
- deterministic calculator coverage in fixture report: 6 supported, 6 agreements, 0 disagreements
- Wrangler deployment dry-run
- npm audit: zero known vulnerabilities at the configured severity
- repository secret-pattern scan: no committed credentials detected

## Evidence boundary

Still required before Phase 2 can be marked `complete`:

- at least 100 legally usable, human-verified benchmark items
- at least 30 real images spanning printed, handwritten, diagram and poor-quality inputs
- live provider cost and latency distributions
- zero unresolved S4 failures in the supported benchmark
- zero high-confidence invented critical fields
- threshold evidence for clear printed critical fields and deterministic problem families
- representative English, Tamil and Tamil-English human review

Until those gates pass, the correct status is `implemented_pending_validation`.

## Phase 3 boundary

The Phase 3 Student MVP must expose only problem families that pass the documented Phase 2 benchmark gate. Other families remain hidden or return an unsupported-scope response. Billing, forced sign-in and public launch remain excluded.
