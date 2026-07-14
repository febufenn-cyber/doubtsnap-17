# Phase 2 migration and forward repair

The migration is additive. Apply it to a staging Supabase project before any production use. Phase 2 uses the service role only; every table has RLS enabled and no public client policies.

## Apply

1. Export any existing validation data.
2. Apply `supabase/migrations/202607140001_validation_lab.sql`.
3. Confirm the four tables, indexes, generated status column, raw-image retention columns and RLS state.
4. Run the repository integration smoke test with a staging service-role key.
5. Keep `LAB_STORE_RAW_IMAGES=false` until retention and deletion operations are operationally reviewed.

## Forward repair

The migration uses `create table/index if not exists` and can be re-run for missing objects. If a database already has `validation_runs` without the retention fields, apply:

```sql
alter table public.validation_runs
  add column if not exists raw_image_stored boolean not null default false,
  add column if not exists raw_image_expires_at timestamptz;

create index if not exists validation_runs_raw_image_expiry_idx
  on public.validation_runs(raw_image_expires_at)
  where raw_image_stored;
```

If a generated `status` column is unavailable on an older Postgres version, add a normal text status column, backfill it from `payload->'run'->>'status'`, and update it through the server repository.

## Rollback

For an unused staging deployment, drop `evaluation_events`, `batch_manifests`, `benchmark_items`, then `validation_runs`. Never drop reviewed benchmark evidence without exporting payloads and audit events first.
