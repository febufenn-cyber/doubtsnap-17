import type {
  IndependentVerification,
  Solution,
  TransferQuestion,
  Verification,
  VerificationCheck,
} from '../contracts'
import { answersAgree, normalizeUnit } from './answer'

const EXPECTED_UNIT_PATTERNS: Array<{ quantity: RegExp; units: string[] }> = [
  { quantity: /acceleration/i, units: ['m/s²', 'm/s^2'] },
  { quantity: /velocity|speed/i, units: ['m/s', 'km/h'] },
  { quantity: /displacement|distance/i, units: ['m', 'km', 'cm'] },
  { quantity: /force/i, units: ['N'] },
  { quantity: /energy|work/i, units: ['J'] },
]

function expectedUnitCheck(requiredQuantities: string[], unit: string | null): VerificationCheck {
  const joined = requiredQuantities.join(' ')
  const match = EXPECTED_UNIT_PATTERNS.find((candidate) => candidate.quantity.test(joined))
  if (!match) {
    return {
      name: 'expected_unit',
      status: 'not_applicable',
      evidence: 'No deterministic expected-unit rule matched the requested quantity.',
    }
  }
  const normalized = normalizeUnit(unit)
  const allowed = match.units.map((candidate) => normalizeUnit(candidate))
  return allowed.includes(normalized)
    ? { name: 'expected_unit', status: 'pass', evidence: `Final unit ${unit} matches the requested quantity.` }
    : {
        name: 'expected_unit',
        status: 'fail',
        evidence: `Final unit ${unit ?? 'null'} does not match expected units: ${match.units.join(', ')}.`,
      }
}

export function combineVerification(args: {
  solution: Solution
  independent: IndependentVerification
  requiredQuantities: string[]
}): Verification {
  const checks: VerificationCheck[] = []
  const disagreements: string[] = []

  const hasMethod = args.solution.method.length > 0 && args.solution.steps.length > 0
  checks.push({
    name: 'method_present',
    status: hasMethod ? 'pass' : 'fail',
    evidence: hasMethod ? 'Canonical method and steps are present.' : 'Canonical method or steps are missing.',
  })

  const valueNeedsUnit = typeof args.solution.finalAnswer.value === 'number'
  const unitPresent = !valueNeedsUnit || Boolean(args.solution.finalAnswer.unit)
  checks.push({
    name: 'unit_present',
    status: unitPresent ? 'pass' : 'fail',
    evidence: unitPresent ? 'Unit requirement is satisfied.' : 'A numerical final answer has no unit.',
  })

  checks.push(expectedUnitCheck(args.requiredQuantities, args.solution.finalAnswer.unit))

  const agreement = answersAgree(args.solution.finalAnswer, args.independent.answer)
  if (!agreement) {
    disagreements.push(
      `Solver answer ${String(args.solution.finalAnswer.value)} ${args.solution.finalAnswer.unit ?? ''} disagrees with independent answer ${String(args.independent.answer.value)} ${args.independent.answer.unit ?? ''}.`.trim(),
    )
  }
  checks.push({
    name: 'independent_agreement',
    status: agreement ? 'pass' : 'fail',
    evidence: agreement ? 'Canonical and independent answers agree within tolerance.' : disagreements[0] ?? 'Answers disagree.',
  })

  const failed = checks.some((check) => check.status === 'fail')
  return {
    status: failed ? 'fail' : 'pass',
    checks,
    independent: args.independent,
    disagreements,
    confidence: failed ? Math.min(args.independent.confidence, 0.45) : Math.min(args.solution.confidence, args.independent.confidence),
  }
}

export function verifyTransferAgreement(
  transfer: TransferQuestion,
  independent: IndependentVerification,
): { verified: boolean; notes: string[] } {
  const verified = transfer.answer.value !== null && answersAgree(transfer.answer, independent.answer)
  return {
    verified,
    notes: verified
      ? ['Generated answer agrees with an independent solution.']
      : [
          `Generated answer ${String(transfer.answer.value)} ${transfer.answer.unit ?? ''} did not agree with independent answer ${String(independent.answer.value)} ${independent.answer.unit ?? ''}.`.trim(),
        ],
  }
}
