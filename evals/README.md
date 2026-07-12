# Doubtsnap Evaluation Set

This directory is the truth source for Phase 0 and Phase 1 quality evaluation. It must measure stages independently rather than awarding one vague overall score.

## Starter data

`starter-dataset.jsonl` contains original synthetic items that exercise the annotation format. It is not a production benchmark and should not be used to claim product accuracy.

## Required benchmark composition

Before Phase 1 is accepted, expand to at least 100 human-verified items with clear rights or original creation:

- clear printed questions
- legible and difficult handwriting
- free-body diagrams and graphs
- poor lighting, skew, crop, glare, and blur
- student attempts containing a first incorrect step
- incomplete or ambiguous questions where clarification is the correct behavior
- inconsistent units, impossible values, misleading diagrams, and incorrect printed answers

Avoid copying commercial guidebook corpora without permission. Record source and usage rights for every non-synthetic item.

## Evaluation dimensions

### Reconstruction

- exact critical numbers and symbols
- units and powers
- vector direction
- diagram labels and relationships
- no invented content
- correct ambiguity detection

### Solution

- governing principle
- assumptions
- intermediate steps
- final value and unit
- dimensions, signs, and plausibility
- accepted alternative methods

### Teaching

- addresses the likely stuck point
- suitable for grade and selected language
- minimum useful intervention
- clear notation
- no unnecessary jargon
- transfer check tests the same concept

### Confidence

- low-quality input leads to clarification
- solver/verifier disagreement is disclosed
- unsupported scope is identified
- confidence correlates with observed accuracy

## Error severity

- S0 cosmetic
- S1 weak pedagogy
- S2 recoverable misunderstanding
- S3 wrong result or method
- S4 confident fabrication, false teaching, or data exposure

## Baseline protocol

Use a frozen prompt and recorded model version. Capture latency, token/image usage, estimated cost, structured output, evaluator decision, and human rationale. Compare generic full-solution output with guided diagnosis and check-my-work variants.
