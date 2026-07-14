# Doubtsnap Autonomous Build Protocol

Status: **binding execution contract for future phase builds**

This document defines what the assistant must do when the user says `build` or `build phase N`.

## Core promise

One `build` instruction executes one eligible phase from preflight through verified merge into `main`. The work must happen in the current interaction. The assistant must not claim that work is running in the background or promise a later result.

The expected end state is:

```text
read plan
→ verify prerequisites
→ create feature branch
→ implement scoped phase
→ run required validation
→ inspect diff
→ commit and push
→ open pull request
→ verify mergeability
→ merge into main
→ verify main merge commit
→ report exact evidence
```

## Command semantics

### `build`

Build the next eligible phase in numerical order.

### `build phase N`

Build Phase N, provided its dependencies and safety gates are satisfied.

### `build next slice`

Continue the documented buildable slice of a phase marked `implemented_pending_validation`.

### `build all`

Not the default. It may execute phases sequentially only when each preceding phase passes its merge and gate before the next starts. A failure stops the sequence; later phases must not be forced through a broken dependency.

## Preflight checklist

Before changing code, the assistant must:

1. Read `ROADMAP.md`, this protocol, and the selected phase plan.
2. Read current `README.md`, relevant architecture documents, contracts, migrations, tests, and CI.
3. Resolve the latest commit on `main` without assuming the previous conversation state is current.
4. Confirm the selected phase is the next eligible phase or explain why an explicit override is safe.
5. Inspect open pull requests and avoid conflicting phase branches.
6. Identify required external inputs such as API secrets, provider accounts, domains, payment credentials, production data, or human evidence.
7. Separate what can be implemented deterministically from what requires external validation.
8. Write or update a concise implementation checklist inside the phase plan when the plan no longer matches the repository.

The assistant must not fabricate credentials, real-user research, benchmark labels, security review, legal approval, revenue, or deployment success.

## Branch and publication rules

Each phase uses:

- Branch: `agent/phase-N-short-name`
- Implementation commit: `Implement Phase N short name`
- PR title: `Implement Phase N short name`
- Base: `main`
- Merge method: merge commit unless repository policy requires otherwise

Direct implementation commits to `main` are prohibited. Documentation-only corrections may still use the same branch/PR/merge flow.

## Implementation rules

1. Stay inside the phase’s included scope.
2. Do not add excluded features merely because they are convenient.
3. Preserve provider boundaries and versioned contracts.
4. Add migrations with rollback or forward-repair instructions.
5. Add tests for new behavior and for every discovered S3/S4 failure.
6. Keep mock, fixture, and synthetic results clearly separated from real evidence.
7. Never weaken an existing ambiguity, verification, privacy, or authorization gate to make a test pass.
8. Prefer reversible architecture and feature flags for externally visible behavior.
9. Record assumptions and unresolved risks in the phase document.
10. Update README status only to what the evidence supports.

## Required validation layers

Every phase must run the applicable layers below.

### Static correctness

- dependency installation from the committed manifest
- TypeScript or language type checking
- formatting or linting when configured
- schema and migration validation

### Automated behavior

- unit tests
- API or integration tests
- regression tests
- deterministic evaluation fixtures

### Deployment safety

- Cloudflare/Wrangler dry-run where applicable
- database migration dry-run or local migration test
- environment-variable completeness check
- build artifact generation

### Security and privacy

- secret scan
- authorization/RLS tests for data-bearing phases
- input-size and content-type checks
- deletion and retention tests when storage is introduced
- dependency vulnerability review when available

### Product evidence

- benchmark or usability metrics required by the phase
- explicit distinction between synthetic, mock, internal, and real-user evidence
- failure report with S0–S4 classification where relevant

A phase plan may add stricter checks. It may not remove these categories without documenting why they do not apply.

## Merge gate

A PR may be merged only when:

- the branch is based on the current `main` or is conflict-free
- the complete diff matches the selected phase
- required local checks pass
- available CI checks pass, or the absence/delay of status is reported honestly
- no known S4 issue is introduced
- secrets and private credentials are absent
- migrations and destructive actions are documented
- README and phase status are accurate

If an external service prevents full validation, the implementation may be merged only as `implemented_pending_validation` when the code has safe mocks/adapters, tests pass, and the unvalidated boundary is prominent.

## Post-merge verification

After merging, the assistant must:

1. Re-read the PR state and confirm `merged: true`.
2. Capture the feature branch head SHA.
3. Capture the merge commit SHA.
4. Query the latest commits on `main` and confirm the merge commit is present.
5. Check available CI status for the merge commit.
6. Fetch at least one critical changed file from `main` to verify the content is reachable from the default branch.
7. Report any status that is pending or unavailable rather than treating it as successful.

## Final confirmation format

Every autonomous build must finish with:

```text
Phase:
Status:
Branch:
Implementation commit:
Pull request:
Merge commit:
Main verification:
Checks passed:
Checks pending/unavailable:
External evidence still required:
Next eligible phase:
```

## Decision rules without clarification

When implementation details are unspecified, use these defaults:

- choose the least irreversible design
- preserve the current Cloudflare Worker + Hono + provider-adapter direction
- use Supabase for product identity and durable learning data when persistence is required, behind repository interfaces for tests
- keep guest-first onboarding until evidence supports forced sign-in
- keep student teaching blocked behind verification
- protect minors’ data through minimization and short retention
- use feature flags for billing, referrals, experiments, and expansion
- support the current Tamil Nadu Class 11 mechanics wedge before broader curricula

The assistant should make a best-effort implementation rather than interrupting for minor choices. It must stop or mark blocked when proceeding would require fabricated secrets, destructive production access, unsafe legal assumptions, or bypassing a critical safety control.

## Status updates inside phase documents

At build start:

```yaml
status: implementing
started_from_main: <sha>
branch: agent/phase-N-short-name
```

Before merge:

```yaml
status: implemented_pending_validation
implementation_commit: <sha>
validation:
  passed: [...]
  pending: [...]
```

After all technical and evidence gates pass:

```yaml
status: complete
merge_commit: <sha>
completed_at: <ISO date>
```

A phase with merged code but unmet real-world evidence remains `implemented_pending_validation`.

## Failure and rollback behavior

- Do not merge a failing branch.
- Fix failures on the same phase branch and rerun checks.
- If a safe fix cannot be completed, leave the PR open or close it and mark the phase `blocked`.
- If a merged change causes a critical regression, create a dedicated revert/fix branch and merge the correction before starting the next phase.
- Never hide failing checks by deleting tests or weakening acceptance thresholds without a documented roadmap decision.
