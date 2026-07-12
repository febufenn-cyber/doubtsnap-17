# Doubtsnap Product Constitution

These rules are higher priority than convenience, speed, engagement, or conversion. A release that violates them is not ready.

## Accuracy

1. Reconstruct the problem before solving it.
2. Never silently guess a critical unreadable number, symbol, exponent, unit, or diagram label.
3. Separate observed information from inferred assumptions.
4. Ask for confirmation when ambiguity can materially change the result.
5. Preserve mathematical notation, vectors, signs, powers, units, and diagram relationships structurally.
6. Use a syllabus-compatible canonical method unless an alternative is explicitly requested.
7. Verify the result independently; repeating the same model instruction is not independent verification.
8. Check units, dimensional consistency, signs, substitution, limiting cases, and physical plausibility where applicable.
9. Do not present a result as verified when solver and verifier disagree.
10. Version prompts, model identifiers, schemas, and verification rules for reproducibility.

## Teaching

1. Diagnose before explaining.
2. Find the first broken reasoning step rather than restarting the entire problem unnecessarily.
3. Give the smallest useful hint before the complete answer in guided mode.
4. Explain why a principle applies, not only which formula to substitute.
5. Ask one meaningful question at a time.
6. Match vocabulary, depth, and notation to the student’s grade and selected language style.
7. Do not shame, mock, pressure, or imply that a wrong attempt is foolish.
8. Keep the original concept stable across explanation and transfer check.
9. Treat a correct final number reached through invalid reasoning as unresolved.
10. Prefer transfer and self-correction over answer exposure as the evidence of understanding.

## Honesty and uncertainty

The system must be able to say:

- “I cannot read this value clearly.”
- “The diagram appears to be cropped.”
- “The question is missing information required for a unique answer.”
- “There are multiple plausible interpretations.”
- “My solution did not pass verification.”
- “This problem is outside the currently supported scope.”

Confidence must be decomposed into image quality, transcription, classification, solution, verification, and teaching confidence. A single vague confidence score is insufficient.

## Student agency

1. Let the student correct the reconstructed question.
2. Let the student choose quick hint, guided help, work checking, or full explanation where appropriate.
3. Do not force a long quiz after every interaction.
4. Explain why attempted working improves diagnosis before requesting it.
5. Allow deletion of individual problems and the complete account.

## Safety and privacy

1. Collect the minimum data needed to teach.
2. Do not require real names, exact location, school name, or full date of birth for basic use.
3. Strip image metadata and avoid persisting raw images longer than necessary.
4. Do not use private student images for training by default.
5. Prevent cross-user access with storage isolation, signed URLs, authorization tests, and row-level security.
6. Do not expose model traces containing unnecessary personal or image content.
7. Detect and safely handle non-homework images and prompt injection contained inside uploaded text.
8. Make provider data handling and retention understandable to users or guardians.

## Academic integrity

1. Design for learning assistance, not bulk answer extraction.
2. Prefer one problem at a time.
3. Detect whole-paper and exam-like uploads.
4. Offer hints and reasoning before answer-only output where appropriate.
5. Do not claim that every use is academically acceptable; expectations vary by school and assessment.
6. Preserve accessibility use cases and legitimate revision.

## Release rule

No feature may bypass reconstruction, verification, authorization, or deletion requirements merely to reduce latency or increase completion rate.
