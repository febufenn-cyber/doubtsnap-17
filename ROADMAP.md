# Doubtsnap Remaining-Phase Roadmap

Status: **committed execution plan**

Phase 0 established the product thesis and risk boundaries. Phase 1 implemented the internal truth engine. Phase 2 has implemented the validation-lab technical foundation, while its real benchmark evidence remains pending.

## Phase count

| Phase | Name | Purpose | Status |
|---|---|---|---|
| 0 | Product foundation | Define wedge, constitution, risks, metrics, and benchmark design | Implemented; evidence still pending |
| 1 | Internal truth engine | Make transcription, solving, verification, teaching, and transfer observable | Implemented; empirical validation pending |
| 2 | Validation lab | Make the engine persistent, human-reviewable and batch-measurable | Implemented pending validation |
| 3 | Student MVP | Deliver the verified snap-to-learning loop in a mobile-first product | Planned; student-visible families require Phase 2 evidence |
| 4 | Learning memory | Remember misconceptions, mastery, interventions, and revision needs | Planned |
| 5 | Production trust | Harden privacy, authorization, security, reliability, and compliance | Planned |
| 6 | Monetization and controlled beta | Add entitlements, quotas, billing, cost controls, and a limited beta | Planned |
| 7 | Distribution and expansion | Build repeatable acquisition, curriculum expansion, and platform readiness | Planned |

**Remaining implementation phases after Phase 2: five, numbered 3 through 7.**

## Dependency chain

```text
Phase 2: Validation lab — implemented_pending_validation
  ↓ technical merge complete; evidence gates student-visible families
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

Phase 2 makes image, provider, calculator and evaluator failures measurable. Phase 3 must keep unvalidated problem families behind feature flags or unsupported-scope responses.

### Learning loop before personalization

Phase 3 proves the core student journey. Phase 4 adds memory only after the system can reliably record a single learning interaction.

### Trust before money

Phase 5 protects minors' data, account boundaries, stored images and operational reliability before Phase 6 introduces billing and broader beta use.

### Evidence before expansion

Phase 7 expands languages, curricula, partnerships and distribution only from measured success. It must not turn Doubtsnap into an unsupported all-subject product.

## Phase documents

- [`plans/phase-2-validation-lab.md`](plans/phase-2-validation-lab.md)
- [`plans/phase-3-student-mvp.md`](plans/phase-3-student-mvp.md)
- [`plans/phase-4-learning-memory.md`](plans/phase-4-learning-memory.md)
- [`plans/phase-5-production-trust.md`](plans/phase-5-production-trust.md)
- [`plans/phase-6-monetization-beta.md`](plans/phase-6-monetization-beta.md)
- [`plans/phase-7-distribution-expansion.md`](plans/phase-7-distribution-expansion.md)

The autonomous execution rules are in [`BUILD_PROTOCOL.md`](BUILD_PROTOCOL.md).

## Definition of phase completion

A phase is complete only when:

1. Its committed plan was checked before implementation.
2. Work stayed inside the documented scope.
3. Required checks and dry-runs passed.
4. The plan records actual evidence and limitations.
5. A feature branch and implementation commit were pushed.
6. A pull request was created against `main`.
7. The pull request was mergeable and merged.
8. The latest `main` commit was verified as the merge result.
9. The final report included branch, commit, PR, merge and evidence gaps.

## Status vocabulary

- `planned`: no implementation has started.
- `implementing`: a feature branch exists and work is in progress.
- `implemented_pending_validation`: code is merged but real-user, provider, security or measured evidence remains.
- `complete`: all mandatory technical and evidence gates are satisfied.
- `blocked`: an external dependency prevents safe completion.
- `superseded`: a later decision replaced the phase plan.

## Default interpretation of “build”

When the user says **build** without naming a phase:

1. Read `BUILD_PROTOCOL.md`.
2. Select the lowest-numbered phase with a buildable next slice.
3. Verify its predecessor is present on `main`.
4. Implement one phase only.
5. Commit, push, open a PR, merge into `main`, verify and report.

After the Phase 2 technical merge, the next implementation phase is Phase 3. The Student MVP must expose only families permitted by Phase 2 evidence and configuration.

## Product-ready boundary

Phase 7 completion means Doubtsnap has a verified core engine, usable student experience, durable learning memory, production trust controls, sustainable entitlements, measured distribution loops and a controlled expansion framework. It does not mean every subject, language or institution is supported.
