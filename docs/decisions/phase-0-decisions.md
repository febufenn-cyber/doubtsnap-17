# Phase 0 Decision Log

Decisions are provisional until their evidence requirement is met. A future change should update the status, evidence, alternatives, and revisit trigger rather than silently overwriting the rationale.

## D-001 Opening wedge

- Status: proposed
- Decision: Tamil Nadu State Board Class 11 Physics, mechanics first
- Rationale: narrow curriculum, objective verification, local user access, and potential Tamil-English differentiation
- Alternatives: CBSE Class 11 Physics, NEET Physics, Class 9–10 foundational physics
- Evidence required: student and teacher interviews, question-volume review, benchmark coverage, distribution access
- Revisit trigger: weak access, insufficient recurring doubt volume, or no advantage from curriculum/language specialization

## D-002 Primary mechanism

- Status: proposed
- Decision: identify the first incorrect reasoning step and provide a minimal intervention
- Alternatives: instant complete solution, generic explanation, answer checking only
- Evidence required: concierge comparison of full solution, guide-me, and check-my-work
- Revisit trigger: no improvement in transfer success or still-confused rate

## D-003 Default interaction

- Status: proposed
- Decision: Guide Me, with Quick Hint and Explain Fully available
- Evidence required: completion, satisfaction, and transfer data
- Revisit trigger: excessive abandonment before useful help

## D-004 Language

- Status: experiment
- Decision: test English, Tamil, and Tamil-English rather than assuming full localization
- Evidence required: comprehension, speed, preference, credibility, and transfer performance
- Revisit trigger: scientific meaning drifts or one style strongly dominates

## D-005 Raw image retention

- Status: unresolved
- Decision needed: retention duration and deletion architecture
- Constraints: debugging value, privacy, provider policy, storage cost, minors’ data
- Required before: public beta

## D-006 Monetization

- Status: hypothesis
- Decision: freemium with ₹149/month as the initial modeling price, not a committed launch price
- Evidence required: cost per resolved doubt, willingness to pay, usage distribution, payment overhead
- Revisit trigger: unsustainable inference cost or stronger parent/institutional buyer

## D-007 Architecture boundary

- Status: accepted for planning
- Decision: keep model providers behind adapters and use versioned structured contracts
- Rationale: benchmarks should select providers; business logic must not depend on one model name
- Revisit trigger: none unless complexity outweighs demonstrated provider-switching value

## D-008 Phase 1 entry

- Status: binding
- Decision: Phase 1 must build an internal truth engine, not billing, native apps, referrals, or broad subject support
- Entry requirement: Phase 0 evidence and benchmark gate in `docs/metrics-economics-and-exit-gates.md`
