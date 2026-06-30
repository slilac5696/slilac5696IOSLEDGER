-- Ledger: shared (community) merchant -> category mapping
-- Each user casts one vote per merchant. Automated ingest picks the majority
-- category for a merchant, so a single wrong assignment cannot mis-categorize
-- for everyone. Run after 003_budget.sql.

create table if not exists merchant_category_votes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  merchant_key text not null,
  category_name text not null,
  updated_at timestamptz not null default now(),
  unique(user_id, merchant_key)
);

alter table merchant_category_votes enable row level security;

-- A user may only read/write their OWN votes. The ingest webhook reads all
-- votes via the service role (which bypasses RLS) to compute the majority, so
-- no global read policy is exposed to clients (keeps other users' ids private).
create policy "own merchant votes" on merchant_category_votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists merchant_votes_key_idx
  on merchant_category_votes (merchant_key);
