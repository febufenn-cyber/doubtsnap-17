# Phase 1 Boundary — Internal Truth Engine

Status: **implementation foundation complete; acceptance evidence pending**

This document defines the Phase 1 boundary. Phase 1 must not expand into the full consumer application before the Phase 0 evidence gate is satisfied.

## Objective

Create an internal tool that exposes every stage from image intake to verified tutoring output so failures are visible, classifiable, and reproducible.

## Implemented pipeline

1. payload and image validation
2. transcription with uncertainty spans and diagram elements
3. student-confirmed transcription override and critical-ambiguity gate
4. curriculum and problem-type classification
5. canonical structured solving
6. independent answer generation plus local value/unit comparison
7. misconception or first-error diagnosis
8. teaching transformation by interaction mode and language
9. near-transfer question generation
10. independent transfer-answer verification
11. trace, cost, latency, prompt, model, and schema recording

## Required properties

- provider adapters rather than model-specific business logic — implemented
- versioned JSON contracts — implemented
- deterministic run and item identifiers — implemented
- stage-level confidence — implemented in stage outputs
- original and student-corrected transcription stored separately — implemented
- solver and verifier disagreement visible — implemented and blocking
- prompt injection inside images treated as data — implemented in provider prompts
- no public billing, referrals, push notifications, or native application work — preserved

## Internal interface

The internal Hono console and structured API expose:

- source request and optional image payload metadata
- extracted text, quantities, units, diagram elements, and uncertainty
- selected topic and problem type
- canonical method and assumptions
- verifier checks and disagreements
- likely misconception and supporting evidence
- requested English, Tamil, or Tamil-English teaching result
- follow-up problem and verification state
- per-stage latency and estimated cost

Human correction controls and persistent evaluator labels remain pending.

## Acceptance targets

Implemented as invariants:

- no silent continuation after critical ambiguity
- clarification on ambiguous starter cases
- independent comparison of final values and units
- explicit unsupported-scope behavior
- regression test for solver/verifier disagreement
- reproducible traces by provider, model, prompt, schema, and pipeline version

Still required for validated completion:

- 100+ human-verified benchmark cases
- real-model baseline and comparison reports
- regression tests for every real S3 and S4 failure
- image preprocessing and real handwriting/diagram evaluation
- human evaluation of diagnosis and bilingual teaching
- measured cost and latency distributions

## Excluded

- production authentication and billing
- parent or teacher dashboards
- broad multi-subject support
- unlimited free usage
- referral systems
- polished native apps
- autonomous agents with unrestricted tools
