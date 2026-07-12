# Phase 0 — Prove the Position Before Building

Status: **implemented foundation; evidence collection pending**

Phase 0 exists to decide whether Doubtsnap can become materially better at diagnosing and teaching a narrow category of student doubts than a generic multimodal chatbot.

## Provisional product thesis

Doubtsnap is a visual misconception-diagnosis tutor for school physics. A student photographs a question or their attempted working. The system reconstructs the problem, identifies the first broken reasoning step, gives the smallest useful intervention, verifies the completed solution, and checks transfer with a related question.

The provisional opening wedge is:

- Tamil Nadu State Board
- Class 11 Physics
- Mechanics first
- printed and clearly handwritten English questions
- explanations in English, Tamil, or Tamil-English
- individual numerical and short conceptual questions

This wedge is a hypothesis, not a permanent commitment. The decision log defines the evidence required to retain or change it.

## Why Doubtsnap should exist

The product must not be a camera wrapper around a generic model. Its intended advantage is a controlled learning loop:

1. Reconstruct the question without silently guessing.
2. Ask where the student is stuck or inspect their working.
3. Identify the first misconception or invalid step.
4. Give a minimal hint before revealing the complete solution.
5. Solve with a syllabus-compatible method.
6. Verify values, units, signs, dimensions, and plausibility.
7. Ask a near-transfer question tied to the same misconception.
8. Record whether the misconception was corrected.

## Phase 0 hypotheses

- H1: Students are frequently blocked by question interpretation, formula selection, force diagrams, sign conventions, units, or algebra rather than by the entire chapter.
- H2: Detecting the first incorrect reasoning step is more useful than returning a complete solution immediately.
- H3: Tamil-English explanations improve comfort or comprehension for a meaningful segment of the opening wedge.
- H4: Students will upload attempted working when the product explains why it helps.
- H5: Mechanics questions can be solved and independently verified with acceptably low high-confidence error rates.
- H6: The average cost per resolved doubt can fit a ₹149/month product with fair-use limits.
- H7: A meaningful share of students will complete a short transfer check after receiving help.

## Phase 0 workstreams

### 1. Wedge and user evidence

Interview at least 15 students, 5 teachers or tutors, and 5 parents. Use recent real behavior rather than hypothetical purchase questions.

Required outputs:

- last real doubt and how it was handled
- most common point of failure
- preferred explanation language
- tolerance for guided hints versus immediate answers
- willingness to upload attempted working
- current substitutes and their failures
- buyer and payment expectations

### 2. Concierge experiment

Run at least 20 real doubt sessions manually. Compare:

- generic complete solution
- guided hint workflow
- check-my-work workflow

Record the actual misconception, number of interventions, time to resolution, transfer-question result, still-confused status, language preference, and willingness to use the product again.

### 3. Benchmark

Expand the starter eval set to at least 100 human-verified questions before Phase 1 is considered complete. Target composition:

- 30 clear printed questions
- 15 handwritten questions
- 15 diagram or graph questions
- 10 poor-image questions
- 10 questions containing student working
- 10 ambiguous or incomplete questions
- 10 adversarial or inconsistent questions

Each item must include canonical transcription, accepted assumptions, method, final answer, units, misconception tags, clarification requirement, and error severity expectations.

### 4. Generic-model baseline

Run a consistent baseline prompt against at least 30 benchmark items. Measure transcription fidelity, method validity, final-answer correctness, unit correctness, unsupported assumptions, confidence calibration, teaching quality, latency, and estimated cost.

### 5. Trust and economics

Validate image-retention policy, academic-integrity boundaries, provider data handling, per-stage model costs, expected usage, and fair-use limits before billing work begins.

## Unit of value

The primary unit is a **resolved doubt**, not an uploaded image or generated answer.

A doubt is resolved only when:

- the problem was reconstructed correctly or confirmed by the student
- the method and final result were verified
- uncertainty and assumptions were disclosed
- the student reports improved understanding or demonstrates it
- the transfer check targets the original concept

North-star candidate: **verified doubts resolved per active student per week**.

## Candidate interaction modes

- **Quick Hint:** one clue, no final answer by default
- **Guide Me:** one step at a time; provisional default
- **Check My Work:** find the first incorrect step in a student attempt
- **Explain Fully:** complete structured solution after an attempt or request
- **Exam Revision:** concise method, common mistake, and one transfer question

Phase 0 must determine which mode creates the best learning outcome without causing unnecessary friction.

## Go, pivot, or stop gate

Proceed to Phase 1 implementation only when all of the following exist:

- one accepted opening wedge and explicit unsupported scope
- evidence from real students and teachers
- a benchmark with verified annotations and error taxonomy
- a measured generic-model baseline
- a product constitution and confidence policy
- documented privacy and academic-integrity rules
- a defensible cost-per-resolved-doubt range
- evidence that guided or check-my-work interaction improves transfer or reduces confusion

Pivot or stop when generic models perform equivalently, students reject the teaching interaction, image ambiguity cannot be handled safely, costs cannot support the price, or access to the target segment is insufficient.

## Phase 0 deliverables in this repository

- `docs/product-constitution.md`
- `docs/scope-users-and-language.md`
- `docs/safety-trust-and-threat-model.md`
- `docs/metrics-economics-and-exit-gates.md`
- `docs/decisions/phase-0-decisions.md`
- `curriculum/physics-foundation.yaml`
- `schemas/phase0-contracts.schema.json`
- `evals/README.md`
- `evals/starter-dataset.jsonl`
- `plans/phase-1-engine.md`
