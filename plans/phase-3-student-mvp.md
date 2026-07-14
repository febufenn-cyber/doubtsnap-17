---
phase: 3
name: Student MVP
status: planned
depends_on: [2]
branch: agent/phase-3-student-mvp
implementation_commit: Implement Phase 3 student MVP
pr_title: Implement Phase 3 student MVP
---

# Phase 3 — Student MVP

## Objective

Deliver the smallest mobile-first student product that turns a photographed or typed supported physics problem into a verified learning interaction. The product must preserve the Phase 1 and Phase 2 truth gates instead of hiding them behind a polished interface.

## Primary journey

```text
open app
→ capture or upload one problem
→ crop/rotate and inspect quality
→ confirm reconstructed question when required
→ choose Guide Me, Quick Hint, Check My Work, or Explain Fully
→ complete one guided reasoning step
→ receive verified explanation
→ answer one near-transfer question
→ see a simple outcome and save or discard the session
```

## Included scope

### Mobile-first web application

- responsive PWA suitable for common Android and iOS browsers
- camera capture, gallery upload, text input, crop, rotate, and retake
- clear upload progress and recovery
- offline-safe draft state before submission where practical
- accessibility: keyboard navigation, labels, focus states, readable contrast, and screen-reader status messages

### Guest-first onboarding

- immediate use without forced account creation
- optional grade, curriculum, and language selection
- anonymous session identifier with clear storage limits
- sign-in offered after a successful learning interaction
- safe migration of guest history when an account is created

### Learning interaction modes

- `Guide Me` as provisional default
- `Quick Hint`
- `Check My Work`
- `Explain Fully`
- one verified transfer check

The interface must never present blocked, ambiguous, or unverified output as a valid solution.

### Clarification UI

- highlight uncertain value or diagram region
- allow direct correction of reconstructed text and quantities
- show what was observed versus inferred
- require confirmation only for material ambiguity
- preserve the original and corrected reconstruction separately

### Minimal history

- recent sessions with topic, status, and date
- delete individual session
- delete all guest data
- do not introduce mastery scores or personalization yet

### Authentication boundary

- Supabase-compatible authentication adapter
- optional email magic link or OTP behind configuration
- no password collection unless separately justified
- no social login requirement
- account deletion and guest-to-account migration tests

### Product analytics

Record privacy-minimized events for:

- capture started/completed
- reconstruction confirmed/corrected
- interaction mode selected
- first useful intervention time
- guided step attempted
- transfer question attempted/correct
- still-confused feedback
- session saved/deleted
- second-doubt return

Do not log raw problem images or full student text into analytics payloads.

## Explicit exclusions

- billing and subscriptions
- referrals or viral rewards
- parent monitoring
- teacher dashboards
- broad curriculum expansion
- native iOS/Android apps
- streaks, leaderboards, or manipulative gamification
- unverified instant-answer mode

## Architecture expectations

- keep truth-engine API contracts versioned
- isolate UI state from provider-specific data
- use feature flags for unvalidated problem families and languages
- support test fixtures without external provider calls
- make guest data retention configurable
- use signed or short-lived image access when persistence is enabled
- design API errors as student-safe states: clarify, unsupported, retry, or temporarily unavailable

## Required automated checks

- component and route tests
- camera/upload validation tests
- crop/rotate and correction-flow tests
- guest-session lifecycle tests
- guest-to-account migration tests
- account and session deletion tests
- ambiguity and unsupported-scope end-to-end tests
- solver/verifier disagreement UI test
- transfer-question verification UI test
- responsive viewport tests for representative mobile sizes
- accessibility smoke checks
- analytics payload privacy tests
- existing truth-engine regression suite
- production build and deployment dry-run

## Acceptance gate

### Technical merge gate

The phase may merge as `implemented_pending_validation` when:

- a student can complete the full supported journey on mobile web
- guest use works without sign-in
- account creation does not lose or cross-link history
- ambiguity and unverified states are clearly blocked
- session deletion works end to end in test environments
- analytics exclude raw sensitive content
- supported problem families are controlled by feature flags
- all required automated checks pass

### Evidence gate for `complete`

- usability sessions with at least 15 target students
- at least 80% can capture and confirm a clear problem without assistance
- median time to first useful intervention is measured and acceptable for the test environment
- no student is shown an unverified final answer in the observed sample
- guided or check-my-work interaction demonstrates lower still-confused rate or better transfer than complete-answer baseline
- language preference and comprehension are measured rather than assumed
- major abandonment points are documented and addressed or explicitly accepted

## Deliverables

- mobile-first PWA
- camera and correction experience
- guest-first session model
- optional authentication adapter
- four interaction modes
- verified transfer flow
- minimal history and deletion
- privacy-minimized product analytics
- end-to-end tests
- implementation report and updated roadmap

## Rollback and failure policy

- student-facing feature flags default off for unvalidated families
- provider or verification failures degrade to a safe retry/unsupported state
- guest data migration must be idempotent
- no UI shortcut may bypass critical-field confirmation or verification gates
- a known high-confidence S3/S4 student-facing path blocks merge

## Next-phase entry

Phase 4 may start after Phase 3 is merged and the event model can reliably distinguish problem, attempt, misconception, intervention, and transfer outcome without collecting unnecessary personal data.
