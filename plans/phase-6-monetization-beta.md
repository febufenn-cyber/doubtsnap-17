---
phase: 6
name: Monetization and Controlled Beta
status: planned
depends_on: [5]
branch: agent/phase-6-monetization-beta
implementation_commit: Implement Phase 6 monetization and controlled beta
pr_title: Implement Phase 6 monetization and controlled beta
---

# Phase 6 — Monetization and Controlled Beta

## Objective

Introduce sustainable usage limits, entitlements, billing, cost controls, and a limited real-user beta without allowing payment state to weaken privacy, correctness, or account boundaries.

The purpose is not to maximize revenue immediately. It is to learn whether verified doubt resolution creates enough recurring value to support its actual cost.

## Included scope

### Entitlements and quotas

- free and paid entitlement definitions
- monthly or rolling resolved-doubt allowance
- separate attempted, verified, and resolved usage counters
- provider-cost and heavy-use protection
- fair-use behavior and transparent limits
- grace periods and read-only access after entitlement loss
- feature flags for plan experiments
- server-authoritative entitlement checks

### Billing integration

Use Razorpay or the selected India-compatible provider behind a billing adapter:

- checkout/session creation
- subscription activation, renewal, pause, cancellation, and failure states
- signed webhook verification
- idempotent event processing
- replay-safe billing ledger
- entitlement reconciliation job
- receipt/invoice references where provider-supported
- test/sandbox configuration only in repository examples
- no secret or live credential commits

### Cost controls

- actual per-stage provider usage recording
- cost per attempted, verified, and resolved doubt
- model-routing policy by difficulty and confidence
- cache/reuse policy for verified public templates only
- budget alarms and emergency provider disablement
- account and system-level spend ceilings
- outlier and abuse review queue

### Controlled beta operations

- invite codes or allowlist
- feature flags by cohort
- support/contact workflow
- wrong-answer and privacy incident escalation
- feedback collection tied to run identifiers, not raw analytics text
- beta status page and known-limitations notice
- release and rollback checklist

### Product and business analytics

Measure:

- activation to first verified doubt
- learning-loop completion
- second-doubt and weekly return
- free allowance consumption
- upgrade prompt exposure and conversion
- paid retention and cancellation reasons
- resolved doubts per paying user
- cost and gross-margin distribution
- support, refund, and wrong-answer incidence

Analytics must remain privacy-minimized and must not expose private problem content.

### Packaging experiment

Start from the existing ₹149/month hypothesis but treat it as configurable. Candidate packaging may compare:

- limited free verified doubts
- paid higher allowance
- extended learning history and revision
- deeper explanation modes
- additional validated language or curriculum packs

Do not make correctness or basic deletion controls paid-only.

## Explicit exclusions

- unrestricted public launch
- advertising
- selling user data
- dark patterns or forced annual plans
- pay-to-remove safety restrictions
- referrals before unit economics and abuse controls are understood
- broad teacher/institutional billing
- unsupported curriculum expansion

## Required automated checks

- entitlement state-machine tests
- quota atomicity and concurrency tests
- webhook signature and replay tests
- duplicate/out-of-order billing event tests
- subscription reconciliation tests
- cancellation and grace-period tests
- cross-user entitlement isolation
- spend ceiling and emergency shutoff tests
- billing failure without data loss
- analytics privacy tests
- refund/support traceability tests
- staging provider sandbox end-to-end test
- existing authorization, deletion, and truth-gate regression suites

## Acceptance gate

### Technical merge gate

The phase may merge as `implemented_pending_validation` when:

- entitlements are server-authoritative and tested
- billing events are signed, idempotent, and auditable
- quotas count verified/resolved use correctly
- payment failure does not delete learning history
- cancellation and account deletion behave independently and correctly
- spend ceilings and emergency controls exist
- sandbox billing flow passes end to end
- all monetization surfaces are feature-flagged for controlled cohorts

### Evidence gate for `complete`

- limited beta with an explicitly capped cohort
- measured cost per attempted, verified, and resolved doubt
- evidence that the selected allowance and price can support target margin or a documented pivot
- real conversion, retention, cancellation, and support reasons
- no material billing/entitlement S4 incidents
- refund and wrong-answer policy tested operationally
- decision log records continue, change price/package, change buyer, or stop

A small beta may reveal that parents, tutors, or institutions are the better payer. That is a valid pivot, not a reason to fabricate consumer willingness to pay.

## Deliverables

- entitlement and quota service
- billing-provider adapter and webhook ledger
- reconciliation and spend-control jobs
- invite/cohort beta controls
- billing and unit-economics dashboards
- support and escalation workflow
- packaging feature flags
- tests, runbooks, and implementation report
- updated roadmap status

## Rollback and failure policy

- billing can be disabled independently from free product access
- entitlement discrepancies default to safe investigation, not destructive account changes
- webhook replay must never duplicate charges or allowances
- payment state must not affect data ownership or deletion rights
- any cross-user billing or entitlement leak is S4 and blocks merge

## Next-phase entry

Phase 7 may start after the beta produces a credible retention, cost, safety, and buyer signal. Distribution should not be scaled before the product knows which users learn, return, and pay sustainably.
