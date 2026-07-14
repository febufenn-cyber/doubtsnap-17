# Doubtsnap

> snap any physics problem, get a patient step-by-step explanation, then a two-question check so you actually learned it, not just copied.

**Alternative to the product-shape pioneered by Studdy (YC S23)** — rank #17 of 500 in the [YC-500 Fable 5 Venture Blueprint](https://github.com/) (score 7.05/10).

## Current status

The **Phase 2 Validation Lab is implemented pending real-world validation**. Start with [`PHASE_2.md`](PHASE_2.md), then read [`plans/phase-2-validation-lab.md`](plans/phase-2-validation-lab.md).

The repository now contains:

- the staged Phase 1 truth engine and safety gates
- deterministic image normalization with metadata removal and quality signals
- memory and Supabase validation repositories
- append-only evaluator corrections and S0–S4 labels
- raw-image minimization, expiry and purge controls
- a human validation console at `/lab`
- resumable benchmark batches and deterministic manifests
- five deterministic mechanics calculator families
- aggregate latency, cost, severity and failure-cluster reports
- automated tests, CI and mock-only fixture reports

Phase 2 is **not an accuracy claim**. Mock and synthetic checks validate the engineering system. The legally usable 100-item benchmark, real-image corpus, live-provider measurements and bilingual human review remain pending.

## Remaining roadmap

Five phases remain after the Phase 2 implementation:

1. Phase 3 — Student MVP
2. Phase 4 — Learning Memory and Personalization
3. Phase 5 — Production Trust, Security, and Reliability
4. Phase 6 — Monetization and Controlled Beta
5. Phase 7 — Distribution, Expansion, and Platform Readiness

Read [`ROADMAP.md`](ROADMAP.md) for the dependency chain and [`BUILD_PROTOCOL.md`](BUILD_PROTOCOL.md) for the autonomous implementation, validation, Git publication, merge and confirmation process.

A plain **`build`** selects the next eligible phase. Phase 3 may only expose problem families that have passed the Phase 2 evidence gate; unvalidated families stay hidden or unsupported.

## Run locally

```bash
npm install
npm run check
npm run dev
```

Open `/` for the Phase 1 trace console and `/lab` for the Phase 2 evaluation console.

The Worker defaults to `MODEL_PROVIDER=mock` and `LAB_REPOSITORY=memory`. Copy `.dev.vars.example` to `.dev.vars` to configure provider models or the server-only Supabase repository. Raw image persistence is off by default.

## Validation tools

```bash
npm run eval:starter
npm run eval:phase2
npm run normalize:image -- path/to/problem.jpg
```

The native image normalizer is an internal Node ingestion tool; it is kept outside the Cloudflare Worker bundle.

## Why this exists

Snap-to-help is a high-intent homework behavior. Doubtsnap's intended wedge is not answer generation alone: it reconstructs the problem, identifies the first broken reasoning step, gives the smallest useful intervention, verifies the solution, and checks transfer.

## Current supported boundary

- Tamil Nadu State Board hypothesis
- Class 11 Physics
- mechanics first
- one printed or clearly handwritten English problem at a time
- teaching variants in English, Tamil or Tamil-English
- internal validation use, not a public production service

## Architecture

`Cloudflare Workers + Hono + provider adapters + validation repositories` — the Worker runs the truth engine and lab API. A provider-neutral boundary supports mock and Anthropic adapters. Phase 2 adds a server-side Supabase REST repository and a Node image-normalization ingestion path. Authentication, billing, referrals, push notifications and native applications remain later-phase work.

## MVP product scope

- [ ] production student photo capture
- [x] internal image/text intake contract
- [x] structured step explanation pipeline
- [x] concept recap contract
- [x] verified follow-up question pipeline
- [x] validation persistence and human review
- [x] deterministic mechanics verification for selected families
- [ ] production saved history and learning memory
- [ ] student-facing authentication and billing

## Business hypothesis

| | |
|---|---|
| Monetization | Freemium; ₹149/month remains a modeling hypothesis |
| First customer | High-school physics students; opening wedge still requires validation |
| GTM wedge | Free snaps, syllabus SEO, study demos and referrals remain untested |
| Competition risk | High: generic multimodal assistants and specialist homework tools |
| Regulatory/trust risk | High: minors' education data, images, academic integrity and confident model error |
| India angle | Curriculum-specific physics help with tested English/Tamil/Tamil-English teaching |

---
*Built from the Fable 5 venture blueprint. Product inspiration: a visual AI tutor that turns homework help into verified comprehension.*
