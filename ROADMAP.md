# Doubtsnap Remaining-Phase Roadmap

Status: **committed execution plan**

Phase 0 established the product thesis and risk boundaries. Phase 1 implemented the internal truth-engine foundation. Six phases remain before Doubtsnap can be treated as a production-ready, commercially testable product.

## Phase count

| Phase | Name | Purpose | Status |
|---|---|---|---|
| 0 | Product foundation | Define wedge, constitution, risks, metrics, and benchmark design | Implemented; evidence still pending |
| 1 | Internal truth engine | Make transcription, solving, verification, teaching, and transfer observable | Implemented; empirical validation pending |
| 2 | Validation lab | Turn the truth engine into a measurable, human-reviewable reliability system | Planned |
| 3 | Student MVP | Deliver the verified snap-to-learning loop in a mobile-first product | Planned |
| 4 | Learning memory | Remember misconceptions, mastery, interventions, and revision needs | Planned |
| 5 | Production trust | Harden privacy, authorization, security, reliability, and compliance | Planned |
| 6 | Monetization and controlled beta | Add entitlements, quotas, billing, cost controls, and a limited beta | Planned |
| 7 | Distribution and expansion | Build repeatable acquisition, curriculum expansion, and platform readiness | Planned |

**Remaining after Phase 1: six phases, numbered 2 through 7.**

## Dependency chain

```text
Phase 2: Validation lab
  ↓
Phase 3: Student MVP
  ↓
Phase 4: Learning memory
  ↓
Phase 5: Production trust
  ↓
Phase 6: Monetization and controlled beta
  ↓
Phase 7: Distribution and expansion
```

A later phase may be implemented only when its predecessor is merged into `main` and its mandatory technical gate is satisfied. Evidence-dependent gates may leave a phase in `implemented_pending_validation`; that status must not be misrepresented as complete.

## Why this order

### Reliability before interface

A polished camera experience cannot repair incorrect transcription, hidden assumptions, or correlated solver errors. Phase 2 makes failures measurable and correctable before the student-facing surface multiplies them.

### Learning loop before personalization

Phase 3 proves the core student journey. Phase 4 adds memory only after the system can reliably record what happened in a single learning interaction.

### Trust before money

Phase 5 protects minors’ data, account boundaries, stored images, and operational reliability before Phase 6 introduces billing and broader beta use.

### Evidence before expansion

Phase 7 expands languages, curricula, partnerships, and distribution only from measured success. It must not turn Doubtsnap into an unsupported “all subjects” product.

## Phase documents

- [`plans/phase-2-validation-lab.md`](plans/phase-2-validation-lab.md)
- [`plans/phase-3-student-mvp.md`](plans/phase-3-student-mvp.md)
- [`plans/phase-4-learning-memory.md`](plans/phase-4-learning-memory.md)
- [`plans/phase-5-production-trust.md`](plans/phase-5-production-trust.md)
- [`plans/phase-6-monetization-beta.md`](plans/phase-6-monetization-beta.md)
- [`plans/phase-7-distribution-expansion.md`](plans/phase-7-distribution-expansion.md)

The autonomous execution rules are in [`BUILD_PROTOCOL.md`](BUILD_PROTOCOL.md).

## Definition of phase completion

A phase is complete only when all of these are true:

1. Its committed plan was read and checked before implementation.
2. The implementation stayed inside the documented scope.
3. Required tests, type checks, migrations, security checks, and dry-runs passed.
4. The plan was updated with actual evidence and unresolved limitations.
5. A feature branch was pushed to this repository.
6. A pull request was created against `main`.
7. The pull request was mergeable and merged.
8. The latest `main` commit was verified as the merge result.
9. The final report included branch, implementation commit, PR, merge commit, validation, and remaining evidence gaps.

## Status vocabulary

- `planned`: no implementation has started.
- `implementing`: a feature branch exists and work is in progress.
- `implemented_pending_validation`: code is merged, but real users, external providers, security review, or measured evidence remain.
- `complete`: all mandatory technical and evidence gates are satisfied.
- `blocked`: a documented external dependency prevents safe completion.
- `superseded`: a later decision replaced the phase plan.

## Default interpretation of “build”

When the user says **“build”** without naming a phase:

1. Read `BUILD_PROTOCOL.md`.
2. Select the lowest-numbered phase whose plan status is `planned` or `implemented_pending_validation` with an explicitly buildable next slice.
3. Verify the preceding phase is present on `main`.
4. Implement one phase only.
5. Commit, push, open a PR, merge to `main`, verify the merge, and report the exact result.

When the user says **“build phase N”**, that explicit phase takes precedence, but dependency and safety gates still apply.

## Product-ready boundary

Phase 7 completion does not mean every school subject, language, or institution is supported. It means Doubtsnap has:

- a verified core learning engine
- a usable student experience
- durable learning memory
- production trust controls
- sustainable entitlements and cost accounting
- measured distribution loops
- a controlled framework for expansion

Expansion beyond that boundary should be governed by new roadmap decisions rather than silently enlarging the current scope.
