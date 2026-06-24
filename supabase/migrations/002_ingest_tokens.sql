-- Personal webhook token per user (for iOS Shortcut — no secret headers needed)
create table if not exists ingest_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table ingest_tokens enable row level security;

-- Only service role accesses this table (no client policies)
