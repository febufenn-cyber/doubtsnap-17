-- Phase 2 validation lab. Apply in a non-production environment first.
create table if not exists public.validation_runs (
  run_id text primary key,
  item_id text not null,
  status text generated always as ((payload->'run'->>'status')) stored,
  payload jsonb not null,
  raw_image_stored boolean not null default false,
  raw_image_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists validation_runs_status_created_idx on public.validation_runs(status, created_at desc);
create index if not exists validation_runs_raw_image_expiry_idx on public.validation_runs(raw_image_expires_at) where raw_image_stored;

create table if not exists public.evaluation_events (
  event_id text primary key,
  run_id text not null references public.validation_runs(run_id) on delete cascade,
  revision integer not null check (revision > 0),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique(run_id, revision)
);

create table if not exists public.benchmark_items (
  version text not null,
  item_id text not null,
  payload jsonb not null,
  primary key(version, item_id)
);

create table if not exists public.batch_manifests (
  manifest_id text primary key,
  status text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.validation_runs enable row level security;
alter table public.evaluation_events enable row level security;
alter table public.benchmark_items enable row level security;
alter table public.batch_manifests enable row level security;

-- No client policies are added in Phase 2. Access is server-side through the service role only.
