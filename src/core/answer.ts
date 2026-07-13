import type { Answer } from '../contracts'

export function normalizeUnit(unit: string | null): string {
  return (unit ?? '')
    .replace('^2', '²')
    .replaceAll(' ', '')
    .toLowerCase()
}

export function answersAgree(left: Answer, right: Answer): boolean {
  if (typeof left.value === 'number' && typeof right.value === 'number') {
    const tolerance = left.tolerance ?? right.tolerance ?? 0.01
    return Math.abs(left.value - right.value) <= tolerance && normalizeUnit(left.unit) === normalizeUnit(right.unit)
  }
  return (
    String(left.value).toLowerCase() === String(right.value).toLowerCase() &&
    normalizeUnit(left.unit) === normalizeUnit(right.unit)
  )
}
