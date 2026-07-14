---
phase: 2
name: Validation Lab
status: planned
depends_on: [1]
branch: agent/phase-2-validation-lab
implementation_commit: Implement Phase 2 validation lab
pr_title: Implement Phase 2 validation lab
---

# Phase 2 — Validation Lab

## Objective

Turn the Phase 1 truth-engine foundation into a persistent, human-reviewable, batch-measurable reliability system. Phase 2 must reveal exactly where image intake, transcription, solving, verification, diagnosis, teaching, or transfer generation fails.

This phase is successful when Doubtsnap can run a versioned benchmark across provider configurations, store every trace, accept human corrections, and generate reproducible S0–S4 reports.

## Strategic reason

The current engine proves orchestration, not truth. Building a student UI now would amplify unknown errors. Phase 2 converts model behavior into evidence that can support or reject the product thesis.

## Included scope

### Image normalization

- decode supported image formats safely
- strip EXIF and unnecessary metadata
- normalize orientation
- resize within configurable limits while preserving readable detail
- calculate basic blur, contrast, glare, crop, and resolution signals
- preserve original hash and normalized-image hash
- represent uncertainty regions with image coordinates
- prevent normalized images from silently changing mathematical content

### Persistence

Introduce repository interfaces and durable implementations for:

- truth-engine runs
- stage traces
- normalized image metadata
- benchmark items and versions
- provider/model configurations without secrets
- human evaluator labels
- transcription corrections
- expected and observed S0–S4 failures
- cost and latency measurements

Use test repositories for deterministic CI. Production-capable storage should follow the existing Worker/Supabase direction without hard-coding credentials.

### Human evaluation console

Extend the internal console to support:

- run search and filtering
- side-by-side source and normalized image inspection
- uncertainty-region highlighting
- correction of transcription, quantities, units, topic, method, answer, and misconception
- evaluator severity and notes
- accept/reject per stage
- audit history rather than destructive overwrite
- export of corrected benchmark records

### Batch benchmark runner

- execute JSONL benchmark sets
- select provider/model/prompt configurations
- concurrency and rate limits
- resumable runs
- deterministic run manifests
- per-item and aggregate reports
- comparison against prior benchmark versions
- failure clustering by topic, image quality, and stage

### Deterministic verification

Add calculator modules for the highest-volume supported families, beginning with:

- unit conversion
- uniform acceleration
- one-dimensional kinematics
- net force and Newton’s second law
- work, kinetic energy, and power
- simple graph-area questions

Each calculator must declare its supported assumptions and refuse unsupported forms.

### Evaluation reports

Generate reports for:

- critical-field transcription accuracy
- clarification precision/recall
- topic classification
- canonical-method validity
- value, sign, and unit accuracy
- solver/verifier disagreement
- high-confidence S3 error rate
- S4 count
- diagnosis agreement
- teaching-language preservation
- transfer-answer correctness
- latency and estimated cost distributions

## Explicit exclusions

- public student application
- production billing
- parent or teacher dashboards
- broad chemistry or mathematics support
- forced sign-in
- claims of accuracy from synthetic or mock data
- silent auto-correction of uncertain mathematical content

## Data and migration requirements

- migrations must be versioned and reproducible
- every mutable evaluation record must preserve audit history
- secrets must never be stored in benchmark configuration records
- raw images must have a configurable retention policy
- deleted benchmark images must leave non-sensitive hashes and audit events only when policy permits
- repository interfaces must allow tests without external services

## Required automated checks

- image metadata removal tests
- orientation and resize tests
- corrupt/oversized image rejection
- uncertainty-coordinate contract tests
- persistence repository tests
- migration tests
- evaluator audit-history tests
- batch resume/idempotency tests
- calculator unit and property tests
- report aggregation tests
- existing Phase 1 gate regression tests
- `npm run check`
- Wrangler dry-run

## Acceptance gate

### Technical merge gate

The phase may be merged as `implemented_pending_validation` when:

- image normalization is deterministic and tested
- durable repository adapters and migrations exist
- evaluator corrections are auditable
- batch runs are resumable and reproducible
- at least three deterministic calculator families are integrated
- S0–S4 reports are generated from fixtures
- no existing ambiguity or verification gate is weakened

### Evidence gate for `complete`

- at least 100 legally usable, human-verified benchmark items
- at least 30 real images across clear, handwritten, diagram, and poor-quality categories
- zero unresolved S4 failures in the supported benchmark
- zero high-confidence invented critical fields
- at least 95% critical-field accuracy on clear printed items
- at least 90% verified final value-and-unit accuracy for explicitly supported deterministic families
- clarification triggered for all benchmark items whose answer materially depends on unreadable data
- measured latency and cost report for configured live providers
- human review of English, Tamil, and Tamil-English preservation on a representative sample

Thresholds are provisional and must be tightened or documented after evidence review; they must not be weakened merely to enter Phase 3.

## Deliverables

- image normalization module
- persistence repositories and migrations
- human evaluator console
- batch benchmark CLI/API
- deterministic mechanics calculators
- comparison and severity reports
- expanded tests and CI
- updated `PHASE_2.md` or equivalent implementation report
- updated README and roadmap status

## Rollback and failure policy

- storage migrations need forward-repair instructions
- batch-run writes must be idempotent
- original images must never be overwritten by normalized versions
- a calculator disagreement blocks downstream teaching rather than being averaged away
- any discovered S4 becomes a committed regression test before merge or a documented merge blocker

## Next-phase entry

Phase 3 may start only after the Phase 2 technical implementation is merged and the selected student-facing problem families have passed the documented benchmark gate. Unvalidated problem families must remain hidden behind feature flags or unsupported-scope responses.
