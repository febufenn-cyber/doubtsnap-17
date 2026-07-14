---
phase: 4
name: Learning Memory
status: planned
depends_on: [3]
branch: agent/phase-4-learning-memory
implementation_commit: Implement Phase 4 learning memory
pr_title: Implement Phase 4 learning memory
---

# Phase 4 — Learning Memory and Personalization

## Objective

Transform isolated doubt sessions into a privacy-conscious learning model that remembers concepts, recurring misconceptions, successful interventions, and revision needs. The system must personalize from evidence rather than from opaque personality labels or unsupported model guesses.

## Core learning record

The durable unit is:

```text
student
→ problem and concept
→ attempted step
→ misconception evidence
→ intervention
→ immediate response
→ transfer result
→ later retention result
```

A chronological image history is insufficient.

## Included scope

### Learning-event model

Add versioned records for:

- concept exposure
- problem attempt
- stated stuck point
- first incorrect step
- misconception hypothesis and confidence
- human or student correction
- intervention type
- guided-step response
- transfer-question result
- still-confused feedback
- later review result
- model, prompt, schema, and content version provenance

### Concept and prerequisite graph

- formalize the current mechanics concept graph
- link prerequisite concepts
- map problem families and misconceptions to concepts
- support curriculum versioning
- avoid changing historic records when the current taxonomy evolves

### Mastery and uncertainty

Implement an explainable, bounded mastery model that:

- uses observed attempts and transfer outcomes
- tracks uncertainty and evidence count
- decays or schedules review without pretending to know exact ability
- does not punish students for image or model failures
- distinguishes missing evidence from low mastery
- allows recomputation from immutable events

### Personalized tutoring inputs

Use memory to choose:

- explanation depth
- whether to revisit a prerequisite
- likely recurring misconception candidates
- transfer-question difficulty
- language and terminology preference
- whether a previous successful intervention should be reused

Memory may influence teaching only after the current problem is independently verified.

### Weak-topic and revision experience

- weak concepts with evidence and confidence
- recent recurring mistakes
- short revision queue
- “practice something similar” from verified templates
- spaced review scheduling
- clear explanation of why an item was recommended
- dismiss, snooze, and reset controls

### User controls

- inspect stored learning profile
- correct grade, curriculum, and language
- remove a misconception label from future personalization while preserving necessary audit history
- reset personalization
- export learning records
- delete learning records and account data

## Explicit exclusions

- parent surveillance dashboards
- ranking students against peers
- opaque “IQ,” personality, or intelligence scores
- high-stakes grading
- teacher-facing class analytics
- engagement manipulation through streak loss
- curriculum or subject expansion

## Architecture expectations

- event-sourced or replayable learning state
- idempotent event ingestion
- versioned concept taxonomy
- clear separation between raw events, derived state, and UI summaries
- authorization scoped to the owning student
- no vector-memory system as the sole source of truth
- embeddings, when used, must reference authorized records and be deletable
- deterministic fixture clock for spaced-repetition tests

## Required automated checks

- event validation and idempotency
- mastery recomputation from event history
- taxonomy-version migration tests
- no mastery penalty for pipeline/image failure
- prerequisite recommendation tests
- recurrence detection tests
- spaced-review scheduling tests
- user correction/reset/export/delete tests
- cross-user isolation tests
- personalization prompt-input minimization tests
- regression tests ensuring memory cannot bypass current-run verification
- end-to-end student history and revision tests

## Acceptance gate

### Technical merge gate

The phase may merge as `implemented_pending_validation` when:

- learning state can be rebuilt from immutable or auditable events
- misconception and mastery outputs include evidence and confidence
- memory cannot cause unverified content to be taught
- reset, export, and deletion work in tests
- cross-user isolation is enforced
- revision recommendations are deterministic under fixture inputs
- personalization can be disabled without breaking the core product

### Evidence gate for `complete`

- repeated-use pilot with enough students to observe multiple sessions per user
- recurring-misconception detection reviewed against human labels
- evidence that personalized interventions or revision improve transfer/retention versus generic behavior
- false weak-topic labeling and over-personalization rates measured
- students understand and can control the memory profile
- no material increase in still-confused or abandonment rates caused by personalization

## Deliverables

- learning-event contracts and migrations
- curriculum concept/prerequisite graph service
- explainable mastery and misconception state
- personalization context builder
- revision queue and weak-topic UI
- profile inspection, correction, reset, export, and deletion
- tests and evaluation report
- updated roadmap and implementation report

## Rollback and failure policy

- derived learning state must be rebuildable after algorithm changes
- personalization must be feature-flagged and disableable
- historic events must retain their original taxonomy/model versions
- suspected false memory should reduce confidence or request confirmation, not silently become fact
- any cross-user memory leakage is S4 and blocks merge

## Next-phase entry

Phase 5 may start after durable student identity, learning records, images, and deletion flows exist in testable form. Those assets define the security and privacy surface that Phase 5 must harden before public beta or billing.
