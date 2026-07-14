# Doubtsnap

> snap any physics problem, get a patient step-by-step explanation, then a two-question check so you actually learned it, not just copied.

**Alternative to the product-shape pioneered by Studdy (YC S23)** — rank #17 of 500 in the [YC-500 Fable 5 Venture Blueprint](https://github.com/) (score 7.05/10).

## Current status

The **Phase 1 internal truth-engine foundation is implemented**. Start with [`PHASE_1.md`](PHASE_1.md), then read [`docs/phase-1-architecture.md`](docs/phase-1-architecture.md).

The repository now contains:

- a Cloudflare Worker and Hono internal console
- a gated image/text-to-teaching pipeline
- versioned runtime contracts
- deterministic run and item identifiers
- mock and Anthropic provider adapters
- critical-ambiguity and unsupported-scope stops
- independent answer and unit comparison
- misconception, teaching, and verified transfer stages
- stage-level provider, model, prompt, latency, usage, and cost traces
- automated tests, CI, and a starter plumbing evaluation

Phase 1 is **implemented but not empirically validated**. The Phase 0 real-user research, benchmark expansion, real-model baselines, bilingual evaluation, and measured cost work remain required. The mock provider's starter result is not a model-accuracy claim.

## Remaining roadmap

Six phases remain after Phase 1:

1. Phase 2 — Validation Lab
2. Phase 3 — Student MVP
3. Phase 4 — Learning Memory and Personalization
4. Phase 5 — Production Trust, Security, and Reliability
5. Phase 6 — Monetization and Controlled Beta
6. Phase 7 — Distribution, Expansion, and Platform Readiness

Read [`ROADMAP.md`](ROADMAP.md) for the dependency chain and [`BUILD_PROTOCOL.md`](BUILD_PROTOCOL.md) for the binding autonomous implementation, validation, Git push, pull request, merge, and post-merge confirmation process.

When the user says **`build`**, the next eligible phase is selected from the committed roadmap, implemented on a feature branch, validated, pushed, merged into `main`, and verified according to the build protocol. One plain `build` instruction builds one phase.

## Run locally

```bash
npm install
npm run check
npm run dev
```

The Worker defaults to `MODEL_PROVIDER=mock`. Copy `.dev.vars.example` to `.dev.vars` and configure your own provider secrets and model names to run the Anthropic adapter.

## Why this exists

Snap-to-help is a high-intent homework behavior. Doubtsnap's intended wedge is not answer generation alone: it reconstructs the problem, identifies the first broken reasoning step, gives the smallest useful intervention, verifies the solution, and checks transfer.

## Current supported boundary

- Tamil Nadu State Board hypothesis
- Class 11 Physics
- mechanics first
- one printed or clearly handwritten English problem at a time
- teaching variants in English, Tamil, or Tamil-English
- internal evaluation use, not a public production service

See [`PHASE_0.md`](PHASE_0.md) for the unresolved evidence gate and [`plans/phase-1-engine.md`](plans/phase-1-engine.md) for the implementation boundary.

## Architecture

`Cloudflare Workers + Hono + provider adapters` — the Phase 1 Worker exposes an internal UI and structured API. The Anthropic adapter uses the Messages API through standard `fetch`; provider model names and token pricing are environment configuration. Supabase, production authentication, billing, Razorpay, push notifications, and native applications remain intentionally excluded from Phase 1 and are introduced only by their committed later-phase gates.

## MVP product scope

- [ ] production photo capture
- [x] internal image/text intake contract
- [x] structured step explanation pipeline
- [x] concept recap contract
- [x] verified follow-up question pipeline
- [ ] production saved history and learning memory
- [ ] student-facing authentication and billing

## Business hypothesis

| | |
|---|---|
| Monetization | Freemium; ₹149/month remains a modeling hypothesis |
| First customer | High-school physics students; opening wedge still requires validation |
| GTM wedge | Free snaps, syllabus SEO, study demos, and referrals remain untested |
| Competition risk | High: generic multimodal assistants and specialist homework tools |
| Regulatory/trust risk | High: minors' education data, images, academic integrity, and confident model error |
| India angle | Curriculum-specific physics help with tested English/Tamil/Tamil-English teaching |

---
*Built from the Fable 5 venture blueprint. Product inspiration: a visual AI tutor that turns homework help into verified comprehension.*
