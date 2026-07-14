---
phase: 5
name: Production Trust
status: planned
depends_on: [4]
branch: agent/phase-5-production-trust
implementation_commit: Implement Phase 5 production trust
pr_title: Implement Phase 5 production trust
---

# Phase 5 — Production Trust, Security, and Reliability

## Objective

Harden Doubtsnap for a controlled public beta involving minors’ educational data. This phase focuses on authorization, privacy, retention, operational reliability, abuse controls, and incident readiness. It does not add monetization.

## Included scope

### Identity and authorization

- production-ready Supabase authentication configuration
- row-level security for every user-owned table
- service-role isolation from public clients
- explicit ownership tests for runs, images, attempts, learning events, and exports
- short-lived signed image access
- safe guest-to-account migration
- session revocation and account recovery boundaries

### Data minimization and retention

- strip metadata before durable storage
- avoid real-name, school, location, and exact-age requirements
- configurable raw-image retention
- scheduled deletion jobs
- per-session and account deletion
- export workflow
- provider data-handling register
- logs and analytics redaction
- deletion propagation to derived records, embeddings, caches, and storage

### Security controls

- rate limiting by IP, session, account, and expensive operation
- upload content-type, size, decompression, and malware-safe handling
- prompt-injection and adversarial-content regression tests
- secret management and secret scanning
- dependency vulnerability checks
- CSRF/CORS/cookie review where applicable
- webhook signature infrastructure for later billing
- audit logs for privileged actions

### Academic-integrity and abuse controls

- one-problem-at-a-time limits
- bulk assessment detection signals
- hint-first policy controls
- suspicious automation and scraping limits
- documented accessibility and legitimate-use exceptions
- user-facing explanation of learning assistance boundaries
- moderator/admin review tools with least privilege

### Reliability and operations

- staging and production environments
- structured logs, metrics, traces, and alerting
- SLOs for availability, latency, and error rate
- provider timeout, retry, and circuit-breaker policies
- queue or asynchronous work where request limits require it
- database backups and restore test
- migration rollback/forward-repair runbooks
- feature flags and emergency kill switches
- incident severity model and response playbook

### Performance and load

- realistic upload and truth-engine load tests
- cost and rate-limit behavior under burst traffic
- cache policy for non-sensitive verified templates
- no caching across user-private content boundaries
- graceful degradation when a provider is unavailable

## Explicit exclusions

- paid subscriptions
- open public launch without beta controls
- teacher or parent dashboards
- broad subject expansion
- advertising
- sale or sharing of student data
- weakening truth gates for latency targets

## Required automated checks

- RLS policy tests for every table and operation
- cross-user read/write/delete denial tests
- signed URL expiration tests
- guest migration isolation tests
- full deletion propagation tests
- retention job tests
- secret and dependency scans
- rate-limit and abuse tests
- upload bomb/corrupt file tests
- prompt-injection regression suite
- backup and restore rehearsal
- provider outage and circuit-breaker tests
- load and latency baseline
- staging deployment smoke test
- production deployment dry-run

## Acceptance gate

### Technical merge gate

The phase may merge as `implemented_pending_validation` when:

- RLS and authorization tests cover all durable user data
- deletion and retention are automated and tested
- secrets are managed outside the repository
- staging is deployable from documented configuration
- rate limits and provider failure controls exist
- backups and restore procedures are documented and exercised in a non-production environment
- incident and rollback runbooks exist
- no known S4 security or privacy finding remains

### Evidence gate for `complete`

- independent or structured internal security review completed
- controlled penetration testing of authorization and upload surfaces
- privacy and data-flow review against actual provider terms and target jurisdictions
- staging load test meets documented SLO targets
- restore test meets recovery objectives
- deletion request completes across all systems within the documented window
- incident drill completed
- beta risk acceptance signed in the decision log

Legal review is external evidence. The repository must not claim legal compliance solely because technical controls exist.

## Deliverables

- production auth and RLS policies
- retention and deletion workers/jobs
- privacy-safe observability
- rate limiting and abuse controls
- staging/production environment configuration
- backup, restore, migration, and incident runbooks
- security and load test suites
- data-flow and provider register
- implementation report and updated roadmap

## Rollback and failure policy

- any cross-user access or deletion failure is S4 and blocks merge
- emergency feature flags must disable uploads, provider calls, billing hooks, or public access independently
- migrations must support forward repair
- provider outages must not produce fabricated answers
- reliability optimizations must not bypass verification or privacy controls

## Next-phase entry

Phase 6 may start only after the controlled-beta trust gate is satisfied. Billing must not be introduced while ownership, deletion, entitlement security, or cost instrumentation is unreliable.
