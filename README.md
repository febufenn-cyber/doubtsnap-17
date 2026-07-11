# Doubtsnap

> snap any physics problem, get a patient step-by-step explanation, then a two-question check so you actually learned it, not just copied.

**Alternative to the product-shape pioneered by Studdy (YC S23)** — rank #17 of 500 in the [YC-500 Fable 5 Venture Blueprint](https://github.com/) (score 7.05/10).

## Why this exists
Snap-to-help is the highest-intent, most-viral homework behavior. The buildable wedge: snap-and-explain tutor for one subject with a follow-up quiz.

## MVP scope
- [ ] Photo capture
- [ ] step explanation
- [ ] concept recap
- [ ] follow-up quiz
- [ ] saved history

## Architecture
`Workers+Supabase+Claude vision` — Cloudflare Workers + Hono API, Supabase (Postgres + RLS + Auth + pgvector), Claude API via Agent SDK (claude-fable-5 for agent reasoning, claude-haiku-4-5 for volume), wrangler deploys.

**Integrations:** Claude vision; Razorpay; push
**Data:** Problem images, explanations, quiz results
**Agent core:** Agent explains, then quizzes to convert copying into comprehension.

## Business
| | |
|---|---|
| Monetization | Freemium; 149 INR/mo |
| First customer | High-school physics/chem students |
| GTM wedge | Free snaps; SEO and TikTok study demos; referral unlocks. |
| Competition risk | High: Studdy, Photomath, many |
| Regulatory/trust risk | High: stores minors' homework photos and quiz history (education/PII data, COPPA territory) plus academic-integrity exposure |
| India angle | Board-syllabus physics/chemistry help in English + Hindi explanations. |
| Difficulty / build time | Low / 2-3 weeks |

## 30-day plan
- **W1:** core loop — Photo capture + step explanation
- **W2:** concept recap + follow-up quiz + saved history + auth + billing
- **W3:** polish, instrument events, seed first users via: Free snaps; SEO and TikTok study demos; referral unlocks.
- **W4:** launch + first revenue; kill/scale decision

---
*Built with Fable 5 (Claude Code). Blueprint row: inspired by Studdy — "AI tutor: snap a photo for instant help across subjects."*