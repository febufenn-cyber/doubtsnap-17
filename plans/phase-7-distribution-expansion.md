---
phase: 7
name: Distribution and Expansion
status: planned
depends_on: [6]
branch: agent/phase-7-distribution-expansion
implementation_commit: Implement Phase 7 distribution and expansion
pr_title: Implement Phase 7 distribution and expansion
---

# Phase 7 — Distribution, Expansion, and Platform Readiness

## Objective

Turn a validated controlled-beta product into a repeatable growth and expansion system without abandoning the narrow reliability discipline that created trust. Phase 7 builds measurable acquisition loops, curriculum/language expansion infrastructure, and operational scale.

## Included scope

### Distribution loops

#### Syllabus search

- indexable concept and worked-example pages using verified, non-private content
- curriculum/chapter/topic metadata
- structured data and canonical URLs
- clear path from concept page to “upload your version”
- content provenance and review status
- no publication of private student images or text

#### Shareable learning artifacts

- privacy-safe concept cards
- common misconception summary
- verified diagram or equation where licensed/original
- one transfer question
- no student identity or original private problem by default
- revocable share links where personalized content is involved

#### Referral experiments

- feature-flagged referral codes
- abuse-resistant rewards based on completed learning actions
- no contact scraping
- transparent reward limits
- cost and retention measurement by cohort

#### Teacher/tutor pilot

- class or cohort codes
- teacher-created verified practice sets
- aggregated misconception trends with minimum-group privacy thresholds
- no unrestricted access to individual private doubt content
- role and consent boundaries
- institution pilot configuration without making it the default buyer prematurely

### Curriculum and language expansion framework

- curriculum packs with versioned concepts, prerequisites, terminology, problem families, calculators, and benchmarks
- language packs with invariant equations, symbols, values, units, and official terminology
- provider prompts and evaluator rubrics per pack
- per-pack feature flags and release gates
- explicit unsupported behavior outside validated packs

Expansion candidates must be chosen from evidence, likely sequence:

1. complete the validated mechanics scope
2. add remaining Class 11 physics chapters
3. add one evidence-supported curriculum or exam alignment
4. add one validated language style
5. add chemistry only after new contracts, calculators, benchmark, and safety review

### Scaling and platform readiness

- model routing based on measured quality/cost
- verified-template caching and deduplication
- queue and worker scaling
- database/index optimization
- provider fallback based on benchmarked capability, not availability alone
- public/internal API separation
- partner API keys, quotas, and audit logs only if a real partner path exists
- native application decision based on PWA evidence, not assumption

### Growth and expansion analytics

Measure:

- acquisition source to resolved doubt
- learning-loop completion by source
- seven- and thirty-day retention by cohort
- referral quality and abuse
- SEO page to upload conversion
- teacher-pilot activation and recurring use
- curriculum/language pack accuracy and support burden
- marginal cost and latency at scale
- paid retention by acquisition source

## Explicit exclusions

- unsupported “all subjects” launch
- automatic publication of AI-generated educational content without review gates
- public leaderboards of students or schools
- individual teacher surveillance of private doubts without consent and product justification
- native apps solely for marketing optics
- partner APIs without authorization, quotas, and privacy boundaries
- growth tactics that obscure pricing, data use, or cancellation

## Required automated checks

- SEO content provenance and privacy tests
- share-card redaction tests
- referral idempotency, fraud, and quota tests
- role and cohort authorization tests
- minimum-group aggregation privacy tests
- curriculum-pack schema and compatibility tests
- language-invariant tests
- pack-specific benchmark gates
- provider-routing regression tests
- cache privacy-boundary tests
- load and queue scaling tests
- API-key and partner quota tests when applicable
- existing truth, authorization, deletion, billing, and cost-control suites

## Acceptance gate

### Technical merge gate

The phase may merge as `implemented_pending_validation` when:

- distribution features are independently feature-flagged
- published educational artifacts have provenance and privacy checks
- referrals resist duplicate and obvious abuse paths
- teacher/tutor roles cannot access unauthorized individual data
- curriculum/language packs have versioned schemas and independent release gates
- provider routing uses measured configuration and preserves verification requirements
- scaling tests pass at the documented target load

### Evidence gate for `complete`

- at least one acquisition loop produces retained users at an acceptable cost or organic effort
- referral users complete learning loops rather than only consuming rewards
- teacher/tutor pilot demonstrates recurring value without privacy harm
- each released curriculum/language pack passes its benchmark and human review
- scale tests and actual beta traffic remain within SLO and cost envelopes
- expansion decision log identifies what to scale, pause, or kill
- product-level safety and trust metrics do not degrade materially with growth

## Deliverables

- verified SEO/content pipeline
- privacy-safe sharing
- referral experiment system
- teacher/tutor pilot roles and aggregate insights
- curriculum and language pack framework
- measured model routing and caching
- scale and partner-readiness controls
- acquisition/retention dashboards
- final implementation and launch-readiness report
- updated roadmap with post-Phase-7 decisions

## Rollback and failure policy

- every growth loop needs an independent kill switch
- expansion packs default off until benchmarked
- published content can be withdrawn and traced to source/version
- referral abuse cannot consume unbounded provider budget
- teacher roles are least-privilege and revocable
- growth never bypasses verification, deletion, authorization, or cost ceilings

## Completion boundary

Phase 7 completion means Doubtsnap has a controlled, measurable path to production growth. It does not mean every subject, board, language, school, or country should be added. Future expansion requires new decision records and plans using the same benchmark-first method.
