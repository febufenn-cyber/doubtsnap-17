import {
  LAB_SCHEMA_VERSION,
  ValidationReportSchema,
  type EvaluationEvent,
  type ValidationReport,
  type ValidationRunRecord,
} from "./contracts";
function quantile(values: number[], q: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b),
    index = Math.min(
      sorted.length - 1,
      Math.max(0, Math.ceil(q * sorted.length) - 1),
    );
  return sorted[index] ?? 0;
}
function counts(values: string[]) {
  return values.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {});
}
export function buildValidationReport(
  runs: ValidationRunRecord[],
  evaluations: EvaluationEvent[],
  evidenceClass: ValidationReport["evidenceClass"] = "internal",
): ValidationReport {
  const severityCounts = counts(evaluations.map((e) => e.severity)),
    statusCounts = counts(runs.map((r) => r.run.status)),
    costs = runs
      .map((r) => r.run.totals.estimatedCostUsd)
      .filter((v): v is number => v !== null),
    latencies = runs.map((r) => r.run.totals.durationMs),
    supported = runs.filter((r) => r.deterministicVerification.supported),
    clusterMap = new Map<string, number>();
  for (const event of evaluations) {
    const run = runs.find((r) => r.runId === event.runId);
    const key = [
      event.stage ?? "run",
      run?.run.classification?.topic ?? "unknown",
      event.severity,
    ].join(":");
    clusterMap.set(key, (clusterMap.get(key) ?? 0) + 1);
  }
  return ValidationReportSchema.parse({
    schemaVersion: LAB_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    evidenceClass,
    totals: {
      runs: runs.length,
      evaluations: evaluations.length,
      s4: severityCounts.S4 ?? 0,
      highConfidenceS3: evaluations.filter(
        (e) =>
          e.severity === "S3" &&
          (runs.find((r) => r.runId === e.runId)?.run.solution?.confidence ??
            0) >= 0.8,
      ).length,
    },
    statusCounts,
    severityCounts,
    calculator: {
      supported: supported.length,
      agreements: supported.filter(
        (r) => r.deterministicVerification.agreesWithModel === true,
      ).length,
      disagreements: supported.filter(
        (r) => r.deterministicVerification.agreesWithModel === false,
      ).length,
    },
    latencyMs: {
      p50: quantile(latencies, 0.5),
      p95: quantile(latencies, 0.95),
      max: latencies.length ? Math.max(...latencies) : 0,
    },
    estimatedCostUsd: {
      total: costs.reduce((a, b) => a + b, 0),
      p50: quantile(costs, 0.5),
      p95: quantile(costs, 0.95),
    },
    clusters: [...clusterMap]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count),
    limitations: [
      evidenceClass !== "real"
        ? "This report does not represent a legally usable human-verified production benchmark."
        : "",
      "Metrics depend on evaluator coverage and configured providers.",
    ].filter(Boolean),
  });
}
