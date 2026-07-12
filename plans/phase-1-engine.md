# Phase 1 Boundary — Internal Truth Engine

This document defines the next build only. Phase 1 must not expand into the full consumer application before the Phase 0 evidence gate is satisfied.

## Objective

Create an internal tool that exposes every stage from image intake to verified tutoring output so failures are visible, classifiable, and reproducible.

## Pipeline

1. image validation, safety, crop, orientation, and quality assessment
2. transcription with uncertainty spans and diagram extraction
3. student confirmation for critical ambiguity
4. curriculum and problem-type classification
5. canonical structured solving
6. independent numerical and physics verification
7. misconception or first-error diagnosis
8. teaching transformation by interaction mode and language
9. verified near-transfer question generation
10. trace, cost, latency, and evaluation recording

## Required properties

- provider adapters rather than model-specific business logic
- versioned JSON contracts
- deterministic run and item identifiers
- stage-level confidence
- original and student-corrected transcription stored separately
- solver and verifier disagreement visible
- prompt injection inside images treated as data
- no public billing, referrals, push notifications, or native application work

## Internal interface

The interface should show:

- source image and normalized crop
- extracted text, quantities, units, diagram elements, and uncertainty
- selected topic and problem type
- canonical method and assumptions
- verifier checks and disagreements
- likely misconception and supporting evidence
- English, Tamil, and Tamil-English teaching variants where enabled
- follow-up problem and verified answer
- per-stage latency and estimated cost
- evaluator labels and human correction controls

## Phase 1 acceptance targets

Targets must be finalized from the Phase 0 benchmark. At minimum:

- no silent critical-field guessing
- clarification on ambiguous benchmark cases
- independently verified final values and units
- explicit unsupported-scope behavior
- regression tests for every S3 and S4 failure found
- reproducible evaluation reports by model, prompt, and schema version

## Excluded

- production authentication and billing
- parent or teacher dashboards
- broad multi-subject support
- unlimited free usage
- referral systems
- polished native apps
- autonomous agents with unrestricted tools
