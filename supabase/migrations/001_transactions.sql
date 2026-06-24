-- Ledger: transactions table for SMS ingest
-- Run in Supabase SQL Editor or via migration

create table if not exists transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  raw_message text not null,
  received_at timestamptz not null default now()
);

alter table transactions enable row level security;

create policy "select own" on transactions
  for select using (auth.uid() = user_id);

create policy "insert own" on transactions
  for insert with check (auth.uid() = user_id);

create policy "delete own" on transactions
  for delete using (auth.uid() = user_id);

-- Service role bypasses RLS for the /api/ingest webhook
