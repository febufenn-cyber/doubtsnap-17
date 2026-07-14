import type { Answer, RunResult } from "../contracts";
import { answersAgree } from "../core/answer";
import {
  DeterministicVerificationSchema,
  type DeterministicVerification,
} from "./contracts";
function answer(
  value: number,
  unit: string,
  direction: string | null = null,
): Answer {
  return { value, unit, tolerance: 0.01, direction };
}
function numbers(text: string) {
  return [...text.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
}
export function deterministicCheck(run: RunResult): DeterministicVerification {
  const topic = run.classification?.topic ?? "",
    text = run.transcription?.effectiveText ?? run.request.problemText ?? "",
    l = text.toLowerCase();
  let expected: Answer | null = null,
    family: DeterministicVerification["family"] = null,
    assumptions: string[] = [],
    reason = "No supported deterministic family matched.";
  if (topic === "unit_conversion" && l.includes("km/h") && l.includes("m/s")) {
    const v = Number(text.match(/(-?\d+(?:\.\d+)?)\s*km\/h/i)?.[1]);
    if (Number.isFinite(v)) {
      family = "unit_conversion";
      expected = answer((v * 5) / 18, "m/s");
      assumptions = ["Direct conversion from km/h to m/s."];
      reason = "Converted with factor 5/18.";
    }
  } else if (
    (topic === "net_force" || l.includes("friction")) &&
    l.includes("kg") &&
    l.includes("n")
  ) {
    const mass = Number(text.match(/(\d+(?:\.\d+)?)\s*kg/i)?.[1]);
    const forceMatches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*N/gi)].map((m) =>
      Number(m[1]),
    );
    if (Number.isFinite(mass) && forceMatches.length >= 2) {
      family = "net_force";
      const net = Math.abs(forceMatches[0]! - forceMatches[1]!);
      expected = answer(net / mass, "m/s²");
      assumptions = ["Two horizontal collinear opposing forces."];
      reason = "Subtracted opposing forces and applied a=Fnet/m.";
    }
  } else if (topic === "acceleration") {
    const m = text.match(
      /from\s*(-?\d+(?:\.\d+)?)\s*m\/s\s*to\s*(-?\d+(?:\.\d+)?)\s*m\/s\s*in\s*(\d+(?:\.\d+)?)\s*s/i,
    );
    if (m) {
      family = "uniform_acceleration";
      expected = answer((Number(m[2]) - Number(m[1])) / Number(m[3]), "m/s²");
      assumptions = ["Uniform acceleration."];
      reason = "Applied a=(v-u)/t.";
    }
  } else if (topic === "kinetic_energy") {
    const mass = Number(text.match(/(\d+(?:\.\d+)?)\s*kg/i)?.[1]),
      speed = Number(
        text.match(
          /(?:moving at|speed(?: of)?)[^\d]*(\d+(?:\.\d+)?)\s*m\/s/i,
        )?.[1],
      );
    if (Number.isFinite(mass) && Number.isFinite(speed)) {
      family = "kinetic_energy";
      expected = answer(0.5 * mass * speed ** 2, "J");
      assumptions = ["Classical non-relativistic motion."];
      reason = "Applied K=1/2 mv².";
    }
  } else if (topic === "motion_graphs") {
    const graph = text.match(
      /(?:at|velocity[^0-9]*)(-?\d+(?:\.\d+)?)\s*m\/s.*?(?:from\s*-?\d+(?:\.\d+)?\s*s\s*to|for)\s*(\d+(?:\.\d+)?)\s*s/i,
    );
    if (graph) {
      family = "graph_area";
      expected = answer(Number(graph[1]) * Number(graph[2]), "m");
      assumptions = [
        "Horizontal velocity-time segment over the stated interval.",
      ];
      reason = "Calculated rectangular area under the velocity-time graph.";
    }
  }
  const model = run.solution?.finalAnswer ?? null;
  return DeterministicVerificationSchema.parse({
    family,
    supported: expected !== null,
    assumptions,
    answer: expected,
    agreesWithModel: expected && model ? answersAgree(expected, model) : null,
    reason,
  });
}
export function applyDeterministicGate(
  run: RunResult,
  check: DeterministicVerification,
): RunResult {
  if (!check.supported || check.agreesWithModel !== false) return run;
  return {
    ...run,
    status: "verification_failed",
    teaching: null,
    transferQuestion: null,
    blockingReasons: [
      ...run.blockingReasons,
      `Deterministic ${check.family} calculator disagreed with the model answer.`,
    ],
  };
}
