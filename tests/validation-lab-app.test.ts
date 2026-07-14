import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
const env = {
  MODEL_PROVIDER: "mock" as const,
  PIPELINE_VERSION: "phase2-test",
  LAB_REPOSITORY: "memory" as const,
};
describe("Hono validation lab", () => {
  it("reports health", async () => {
    const r = await createApp().request("/health", {}, env);
    expect(await r.json()).toMatchObject({ ok: true, labRepository: "memory" });
  });
  it("runs, stores, reviews, and exports a problem", async () => {
    const runResponse = await createApp().request(
        "/api/runs",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ problemText: "Convert 72 km/h into m/s." }),
        },
        env,
      ),
      run = (await runResponse.json()) as any;
    expect(run.status).toBe("complete");
    const list = await createApp().request("/api/lab/runs", {}, env);
    expect(
      ((await list.json()) as any[]).some((x) => x.runId === run.runId),
    ).toBe(true);
    const evaluation = await createApp().request(
      "/api/lab/evaluations",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: run.runId,
          evaluator: "tester",
          stage: "verification",
          decision: "accept",
          severity: "S0",
          corrections: [],
          notes: "verified",
        }),
      },
      env,
    );
    expect(evaluation.status).toBe(201);
    const exp = await createApp().request(
      `/api/lab/runs/${run.runId}/export`,
      {},
      env,
    );
    expect(((await exp.json()) as any).evaluations).toHaveLength(1);
  });
});
