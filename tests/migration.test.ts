import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
describe("validation lab migration", () => {
  it("is additive, idempotent, and enables RLS without client policies", async () => {
    const sql = await readFile(
      new URL(
        "../supabase/migrations/202607140001_validation_lab.sql",
        import.meta.url,
      ),
      "utf8",
    );
    for (const table of [
      "validation_runs",
      "evaluation_events",
      "benchmark_items",
      "batch_manifests",
    ]) {
      expect(sql).toContain(`create table if not exists public.${table}`);
      expect(sql).toContain(
        `alter table public.${table} enable row level security`,
      );
    }
    expect(sql).toContain("raw_image_stored boolean not null default false");
    expect(sql).toContain("raw_image_expires_at timestamptz");
    expect(sql.toLowerCase()).not.toContain("create policy");
  });
});
