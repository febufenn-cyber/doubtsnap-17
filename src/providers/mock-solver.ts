import type { RunRequest, Solution } from '../contracts'
import { answer } from './mock-common'

function firstNumber(pattern: RegExp, text: string): number | null {
  const match = text.match(pattern)
  if (!match?.[1]) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

export function solveText(text: string, request: RunRequest): Solution {
  const lower = text.toLowerCase()

  if (lower.includes('book rests') && lower.includes('normal force')) {
    return {
      governingPrinciples: ["Newton's third law", 'Forces in an interaction pair act on different bodies'],
      method: ['Identify which body each force acts on', 'Compare with the definition of an action-reaction pair'],
      steps: [
        {
          id: 's1',
          expression: 'weight: Earth → book; normal: table → book',
          explanation: 'Both named forces act on the book, so they cannot be a third-law pair.',
          value: null,
          unit: null,
        },
        {
          id: 's2',
          expression: 'reaction to weight: book → Earth',
          explanation: "The reaction to Earth's pull on the book is the book's pull on Earth.",
          value: null,
          unit: null,
        },
      ],
      assumptions: ['The book is at rest on a horizontal table.'],
      finalAnswer: answer('No', null),
      confidence: 0.98,
    }
  }

  if (lower.includes('convert') && lower.includes('km/h')) {
    const speed = firstNumber(/([0-9]+(?:\.[0-9]+)?)\s*km\/h/i, text) ?? 72
    const converted = speed * (5 / 18)
    return {
      governingPrinciples: ['Unit conversion'],
      method: ['Multiply km/h by 1000/3600', 'Simplify to 5/18'],
      steps: [
        {
          id: 's1',
          expression: `${speed} × 5/18`,
          explanation: 'Convert kilometres to metres and hours to seconds.',
          value: converted,
          unit: 'm/s',
        },
      ],
      assumptions: [],
      finalAnswer: answer(converted, 'm/s'),
      confidence: 0.99,
    }
  }

  if (lower.includes('kinetic energy')) {
    const mass = firstNumber(/([0-9]+(?:\.[0-9]+)?)\s*kg/i, text) ?? 2
    const speed = firstNumber(/(?:moving at|speed(?: of)?)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*m\/s/i, text) ?? 3
    const kineticEnergy = 0.5 * mass * speed ** 2
    return {
      governingPrinciples: ['K = 1/2 mv²'],
      method: ['Identify mass and speed', 'Substitute into kinetic-energy equation'],
      steps: [
        {
          id: 's1',
          expression: `K = 1/2 × ${mass} × ${speed}²`,
          explanation: 'Use the kinetic energy equation.',
          value: kineticEnergy,
          unit: 'J',
        },
      ],
      assumptions: ['Classical, non-relativistic motion.'],
      finalAnswer: answer(kineticEnergy, 'J'),
      confidence: 0.99,
    }
  }

  if (lower.includes('velocity-time') || (lower.includes('graph') && lower.includes('displacement'))) {
    const velocity = firstNumber(/(?:at|velocity[^0-9]*)([0-9]+(?:\.[0-9]+)?)\s*m\/s/i, text) ?? 6
    const endTime = firstNumber(/(?:to|for)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*s/i, text) ?? 4
    const displacement = velocity * endTime
    return {
      governingPrinciples: ['Displacement is the signed area under a velocity-time graph'],
      method: ['Recognize the rectangular area', 'Multiply velocity by time interval'],
      steps: [
        {
          id: 's1',
          expression: `s = ${velocity} × ${endTime}`,
          explanation: 'The graph forms a rectangle.',
          value: displacement,
          unit: 'm',
        },
      ],
      assumptions: ['Velocity remains constant over the stated interval.'],
      finalAnswer: answer(displacement, 'm'),
      confidence: 0.97,
    }
  }

  if (lower.includes('increases its velocity') || (lower.includes('velocity from') && lower.includes('acceleration'))) {
    const match = text.match(/from\s*([0-9]+(?:\.[0-9]+)?)\s*m\/s\s*to\s*([0-9]+(?:\.[0-9]+)?)\s*m\/s\s*in\s*([0-9]+(?:\.[0-9]+)?)\s*s/i)
    const initial = Number(match?.[1] ?? 10)
    const finalVelocity = Number(match?.[2] ?? 25)
    const time = Number(match?.[3] ?? 5)
    const acceleration = (finalVelocity - initial) / time
    return {
      governingPrinciples: ['a = (v - u) / t'],
      method: ['Identify initial velocity, final velocity, and elapsed time', 'Calculate uniform acceleration'],
      steps: [
        {
          id: 's1',
          expression: `a = (${finalVelocity} - ${initial}) / ${time}`,
          explanation: 'Acceleration is change in velocity per unit time.',
          value: acceleration,
          unit: 'm/s²',
        },
      ],
      assumptions: ['Acceleration is uniform.'],
      finalAnswer: answer(acceleration, 'm/s²'),
      confidence: 0.99,
    }
  }

  const forceDirectionMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*N\s*(?:to the\s*)?right.*?([0-9]+(?:\.[0-9]+)?)\s*N\s*(?:to the\s*)?left/i)
  if (forceDirectionMatch) {
    const right = Number(forceDirectionMatch[1])
    const left = Number(forceDirectionMatch[2])
    const mass = firstNumber(/([0-9]+(?:\.[0-9]+)?)\s*kg/i, text) ?? 2
    const net = right - left
    const acceleration = net / mass
    return {
      governingPrinciples: ["Newton's second law", 'Opposing collinear forces subtract'],
      method: ['Choose right as positive', 'Find net force', 'Apply a = Fnet/m'],
      steps: [
        {
          id: 's1',
          expression: `Fnet = ${right} - ${left}`,
          explanation: 'The forces point in opposite directions.',
          value: net,
          unit: 'N',
        },
        {
          id: 's2',
          expression: `a = ${net} / ${mass}`,
          explanation: "Apply Newton's second law.",
          value: acceleration,
          unit: 'm/s²',
        },
      ],
      assumptions: ['Right is the positive direction.'],
      finalAnswer: answer(acceleration, 'm/s²', net >= 0 ? 'right' : 'left'),
      confidence: 0.98,
    }
  }

  if (lower.includes('friction') && lower.includes('acceleration')) {
    const mass = firstNumber(/([0-9]+(?:\.[0-9]+)?)\s*kg/i, text) ?? 5
    const applied = firstNumber(/(?:pulled|force)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*N/i, text) ?? 20
    const friction = firstNumber(/friction[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*N/i, text) ?? 5
    const net = applied - friction
    const acceleration = net / mass
    return {
      governingPrinciples: ["Newton's second law", 'Net force is the vector sum of forces'],
      method: ['Identify applied force and opposing friction', 'Calculate net force', 'Apply a = Fnet/m'],
      steps: [
        {
          id: 's1',
          expression: `Fnet = ${applied} - ${friction}`,
          explanation: 'Friction opposes the applied force.',
          value: net,
          unit: 'N',
        },
        {
          id: 's2',
          expression: `a = ${net} / ${mass}`,
          explanation: "Apply Newton's second law.",
          value: acceleration,
          unit: 'm/s²',
        },
      ],
      assumptions: ['The forces are horizontal and collinear.'],
      finalAnswer: answer(acceleration, 'm/s²'),
      confidence: 0.99,
    }
  }

  throw new Error(`Mock provider has no deterministic solver for: ${request.benchmarkId ?? text.slice(0, 80)}`)
}
