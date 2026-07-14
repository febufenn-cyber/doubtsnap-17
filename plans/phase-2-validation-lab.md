---
phase: 2
name: Validation Lab
status: implemented_pending_validation
depends_on: [1]
started_from_main: 340d923ad2da0fe36372a0922bbf07e4d8e27e23
branch: agent/phase-2-validation-lab
implementation_commit: db227fe4e5494a3f299223994882d13685727d98
pr_title: Implement Phase 2 validation lab
validation:
  passed:
    - strict_typecheck
    - 23_automated_tests
    - phase1_regression_suite
    - starter_mock_8_of_8
    - phase2_batch_8_items
    - calculators_6_agreements_0_disagreements
    - wrangler_dry_run
    - npm_audit_zero
    - secret_scan_clean
  pending:
    - human_verified_100_item_benchmark
    - real_image_corpus
    - live_provider_cost_latency
    - bilingual_human_review
    - evidence_thresholds
---

# Phase 2 — Validation Lab

## Objective

Turn the Phase 1 truth-engine foundation into a persistent, human-reviewable and batch-measurable reliability system. It must reveal whether failure occurred during image intake, transcription, solving, verification, diagnosis, teaching or transfer generation.

## Implemented scope

### Image normalization

- safe decode and byte/pixel limits
- EXIF orientation normalization
- resize without enlargement
- clean re-encoding and metadata removal
- original and normalized SHA-256 hashes
- blur, contrast, glare, border and resolution signals
- normalized uncertainty-coordinate contract
- corrupt, oversized, animated and multi-page rejection

The normalizer is a Node ingestion component and CLI. It is deliberately not bundled into the Cloudflare Worker native runtime.

### Persistence

Repository abstractions and implementations now cover:

- validation runs and all Phase 1 traces
- normalized image metadata
- benchmark items and versions
- provider configuration identifiers without secrets
- append-only human evaluator events
- corrections and S0–S4 labels
- batch manifests
- cost and latency data

The memory adapter supports deterministic CI. The Supabase adapter is backed by a versioned migration with RLS enabled and no public policies.

### Image retention

- raw bytes are redacted by default
- storage is opt-in through `LAB_STORE_RAW_IMAGES=true`
- retained bytes receive a configurable expiry
- purge removes source and normalized bytes while preserving non-sensitive evidence
- normalized images never overwrite original inputs

### Human evaluation console

`/lab` provides run search, status/topic filters, source/normalized image panels, uncertainty regions, structured trace inspection, stage decisions, severity labels, notes and corrected-record export. Evaluation history is append-only.

### Batch benchmark runner

- deterministic manifests
- benchmark/provider/prompt versioning
- bounded concurrency
- resumable and idempotent processing
- per-item attempts and errors
- aggregate comparison-ready reports

### Deterministic mechanics calculators

Implemented families:

- unit conversion
- uniform acceleration
- net force and Newton's second law
- kinetic energy
- rectangular velocity-time graph area

Each module declares assumptions and refuses unmatched forms. A disagreement blocks teaching and transfer output.

### Evaluation reports

Fixture reports include:

- run status counts
- S0–S4 counts
- high-confidence S3 count
- calculator support/agreement/disagreement
- p50, p95 and max latency
- total and percentile estimated cost
- failure clusters by stage, topic and severity
- explicit evidence-class limitations

## Explicit exclusions

- public student application
- production billing
- parent or teacher dashboards
- chemistry or broad mathematics support
- forced sign-in
- accuracy claims from mock or synthetic data
- silent mathematical auto-correction

## Technical merge gate

Satisfied by the implementation:

- deterministic and tested normalization
- repository adapters and migration
- auditable corrections
- resumable batch manifests
- at least three calculator families; five are implemented
- S0–S4 fixture reports
- unchanged Phase 1 ambiguity and verification gates
- raw-image minimization and expiry tests

## Evidence gate for `complete`

Still pending:

- 100+ legally usable human-verified benchmark items
- 30+ real images across clear, handwritten, diagram and poor-quality categories
- zero unresolved S4 failures
- zero high-confidence invented critical fields
- at least 95% critical-field accuracy on clear printed items
- at least 90% verified final value-and-unit accuracy for enabled deterministic families
- clarification on every materially unreadable benchmark item
- measured live-provider latency and cost
- human English, Tamil and Tamil-English preservation review

These thresholds must not be weakened simply to begin Phase 3.

## Deliverables

- `src/lab/image-normalizer.ts`
- `src/lab/repository.ts`
- `src/lab/service.ts`
- `src/lab/batch.ts`
- `src/lab/calculators.ts`
- `src/lab/reporting.ts`
- `src/lab/contracts.ts`
- `src/ui/validation-lab.ts`
- `supabase/migrations/202607140001_validation_lab.sql`
- Phase 2 scripts, tests and fixture report
- `PHASE_2.md`

## Rollback and repair

- migration forward-repair guidance is in `docs/phase-2-migration-repair.md`
- all batch writes are idempotent by manifest ID
- original image records are never overwritten by normalization
- calculator disagreement blocks downstream teaching
- every future S4 must become a committed regression test or a merge blocker

## Next-phase entry

Phase 3 can be implemented technically after this phase is merged, but student-visible problem families remain gated by real Phase 2 benchmark evidence. The repository must continue to describe Phase 2 as `implemented_pending_validation` until the evidence gate passes.
