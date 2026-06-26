-- Ledger: zero-based budgeting tables
-- Run in Supabase SQL Editor after 001_transactions.sql and 002_ingest_tokens.sql

-- Monthly income per user (month format: "2026-06")
create table if not exists monthly_income (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  month text not null,
  amount numeric(12,2) not null default 0,
  unique(user_id, month)
);

-- Budget categories per user per month
create table if not exists budget_categories (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  month text not null,
  name text not null,
  icon text not null default 'circle',
  budgeted numeric(12,2) not null default 0,
  sort_order int not null default 0
);

-- Link transactions to categories
alter table transactions
  add column if not exists category_id bigint references budget_categories(id),
  add column if not exists category_name text;

-- RLS for new tables (same pattern as transactions)
alter table monthly_income enable row level security;
alter table budget_categories enable row level security;

create policy "own income" on monthly_income
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own categories" on budget_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helpful indexes for month lookups
create index if not exists monthly_income_user_month_idx on monthly_income (user_id, month);
create index if not exists budget_categories_user_month_idx on budget_categories (user_id, month);
create index if not exists transactions_category_idx on transactions (category_id);
