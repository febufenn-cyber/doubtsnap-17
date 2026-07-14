import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import type { LabEnv } from "./lab/env";
import { createProvider } from "./providers/factory";
import { INTERNAL_UI_HTML } from "./ui/internal";
import { VALIDATION_LAB_HTML } from "./ui/validation-lab";
import { createLabRepository } from "./lab/repository";
import { ValidationLabService } from "./lab/service";
import { BenchmarkItemSchema } from "./lab/contracts";
import { runBatch } from "./lab/batch";
import { buildValidationReport } from "./lab/reporting";

function service(env: LabEnv) {
  const repository = createLabRepository(env);
  return {
    repository,
    lab: new ValidationLabService(createProvider(env), repository, env),
  };
}
export function createApp() {
  const app = new Hono<{ Bindings: LabEnv }>();
  app.use("*", secureHeaders());
  app.get("/health", (c) =>
    c.json({
      ok: true,
      service: "doubtsnap-truth-engine",
      pipelineVersion: c.env.PIPELINE_VERSION ?? "phase2-0.1.0",
      provider: c.env.MODEL_PROVIDER ?? "mock",
      labRepository: c.env.LAB_REPOSITORY ?? "memory",
    }),
  );
  app.get("/", (c) => c.html(INTERNAL_UI_HTML));
  app.get("/lab", (c) => c.html(VALIDATION_LAB_HTML));
  app.post("/api/runs", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Request body must be valid JSON." }, 400);
    }
    try {
      const record = await service(c.env).lab.run(body);
      return c.json(record.run, record.run.status === "error" ? 422 : 200);
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : String(error) },
        500,
      );
    }
  });
  app.get("/api/lab/runs", async (c) => {
    const { lab } = service(c.env),
      status = c.req.query("status"),
      topic = c.req.query("topic");
    return c.json(
      await lab.list({
        ...(status ? { status } : {}),
        ...(topic ? { topic } : {}),
        limit: Number(c.req.query("limit") ?? 100),
      }),
    );
  });
  app.get("/api/lab/runs/:runId", async (c) => {
    const { lab } = service(c.env),
      run = await lab.get(c.req.param("runId"));
    return run ? c.json(run) : c.json({ error: "Run not found" }, 404);
  });
  app.get("/api/lab/runs/:runId/export", async (c) => {
    try {
      return c.json(
        await service(c.env).lab.exportCorrected(c.req.param("runId")),
      );
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : String(error) },
        404,
      );
    }
  });
  app.post("/api/lab/evaluations", async (c) => {
    try {
      return c.json(await service(c.env).lab.evaluate(await c.req.json()), 201);
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : String(error) },
        400,
      );
    }
  });
  app.get("/api/lab/evaluations", async (c) =>
    c.json(await service(c.env).lab.evaluations(c.req.query("runId"))),
  );
  app.post("/api/lab/batches", async (c) => {
    try {
      const body = (await c.req.json()) as {
        items: unknown[];
        benchmarkVersion: string;
        providerConfigId: string;
        promptSetVersion: string;
        concurrency?: number;
      };
      if (!Array.isArray(body.items) || body.items.length > 25)
        throw new Error("Batch API accepts 1-25 items per request.");
      const items = body.items.map((item) => BenchmarkItemSchema.parse(item));
      const { lab, repository } = service(c.env);
      return c.json(
        await runBatch(
          items,
          {
            benchmarkVersion: body.benchmarkVersion,
            providerConfigId: body.providerConfigId,
            promptSetVersion: body.promptSetVersion,
            ...(body.concurrency ? { concurrency: body.concurrency } : {}),
          },
          lab,
          repository,
        ),
        201,
      );
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : String(error) },
        400,
      );
    }
  });
  app.get("/api/lab/reports", async (c) => {
    const { lab } = service(c.env),
      runs = await lab.list({ limit: 1000 }),
      evaluations = await lab.evaluations();
    return c.json(
      buildValidationReport(
        runs,
        evaluations,
        (c.req.query("evidenceClass") as
          "synthetic" | "mock" | "internal" | "real") ?? "internal",
      ),
    );
  });
  app.notFound((c) => c.json({ error: "Not found" }, 404));
  return app;
}
