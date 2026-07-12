# Safety, Trust, and Threat Model

## Data minimization

Required educational profile fields should be limited to curriculum, grade, subject, and explanation preference. Real name, exact age, school, address, contacts, and precise location are not required for the core loop.

## Image handling proposal

- strip EXIF and location metadata before persistence
- reject unsupported formats and oversized uploads
- use private storage with short-lived signed access
- separate raw image retention from permanent learning records
- provide per-problem and account-level deletion
- avoid logging complete images or raw provider payloads
- do not use private images for model training by default
- detect visible personal documents or faces and warn or refuse where unrelated to learning

The exact retention duration remains a Phase 0 decision requiring provider and operational review.

## Technical threats

| Threat | Severity | Required mitigation |
|---|---|---|
| Cross-user image or history access | Critical | RLS, authorization tests, private buckets, signed URLs, object ownership checks |
| Leaked service credentials | Critical | server-side secrets, rotation, least privilege, environment separation |
| Malicious or oversized uploads | High | MIME inspection, decode validation, size and pixel limits, rate limits |
| Prompt injection inside an image | High | treat image text as untrusted problem content, never as system instruction |
| Replay and automated abuse | High | quotas, idempotency, anomaly detection, per-user and per-device controls |
| Sensitive content in logs | High | structured redaction, trace sampling, access controls, retention limits |
| Dependency or provider outage | Medium | bounded retries, timeouts, fallbacks, user-visible recovery state |

## Model threats

### Invented transcription

The model may fabricate a number, exponent, vector, sign, unit, or diagram relationship. Critical-field uncertainty must trigger confirmation.

### Confident wrong solution

A fluent explanation may hide an invalid method. Solver output must be independently verified and disagreements surfaced.

### False teaching

A numerically correct result may teach a wrong principle or use methods outside the syllabus. Evaluation must score method validity and teaching quality separately.

### Broken follow-up question

Generated practice may be unsolvable, test a different concept, or have the wrong answer. Follow-up items require the same verification contract as original problems.

### Translation drift

Tamil or Tamil-English wording may change scientific meaning. Equations, symbols, units, and formal keywords must remain invariant and terminology should be reviewed.

## Academic-integrity threats

- live assessment assistance
- bulk whole-paper solving
- answer-only extraction
- automated submission to other systems
- repeated high-volume use inconsistent with individual learning

Initial mitigations:

- one problem at a time
- detect multi-question and exam-like images
- guided reasoning as the default learning path
- no bulk export of answer keys
- fair-use and anomaly controls
- clear communication that school rules may differ

## Child and family trust

Parent-facing analytics, if later built, should focus on concepts and progress rather than surveillance. Avoid exposing every private doubt, full conversation, or emotional signal by default.

## Incident classes

- P0: cross-account exposure, credential compromise, or harmful content delivered to a minor
- P1: repeated high-confidence false teaching or deletion failure
- P2: isolated incorrect answer, unsupported content accepted, or material translation error
- P3: latency, formatting, or non-material explanation issue

P0 and P1 incidents block release expansion until root cause and regression coverage exist.
