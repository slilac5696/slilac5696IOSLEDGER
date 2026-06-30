# Ledger — Setup

Ledger is a zero-based budgeting PWA. You set a monthly income and assign every
unit of currency to a category before spending. Bank-SMS transactions captured
through the webhook (iOS Shortcut / Android automation) auto-fill each
category's spent amount in real time.

```
Income − All Category Budgets = 0
```

## 1. Environment variables

Set these in `.env` (local) and in Railway (production):

```
VITE_SUPABASE_URL=...            # required (must be set BEFORE the build)
VITE_SUPABASE_ANON_KEY=...       # required (must be set BEFORE the build)
SUPABASE_SERVICE_ROLE_KEY=...    # server-only, used by the ingest webhook
```

## 2. Run locally

```
npm install
cp .env.example .env   # then fill in the values above
npm run dev            # Express + Vite on http://localhost:3000
```

Production: `npm run build` then `npm start`.

## 3. Database schema (Supabase SQL Editor)

Run the migrations in order. They live in `supabase/migrations/`.

### 001 — transactions

```sql
create table if not exists transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  raw_message text not null,
  received_at timestamptz not null default now()
);

alter table transactions enable row level security;

create policy "select own" on transactions for select using (auth.uid() = user_id);
create policy "insert own" on transactions for insert with check (auth.uid() = user_id);
create policy "delete own" on transactions for delete using (auth.uid() = user_id);
```

### 002 — ingest_tokens (personal webhook URL per user)

```sql
create table if not exists ingest_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table ingest_tokens enable row level security;
-- Only the service role reads/writes this table (no client policies).
```

### 003 — budgeting tables (NEW)

```sql
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

alter table monthly_income enable row level security;
alter table budget_categories enable row level security;

create policy "own income" on monthly_income
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own categories" on budget_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Existing users — run this ALTER once

The transactions table gains two columns that link each transaction to a budget
category. **If your `transactions` table already exists, run this once** (new
installs get it automatically via migration 003):

```sql
alter table transactions
  add column if not exists category_id bigint references budget_categories(id),
  add column if not exists category_name text;
```

If you skip this, ingest will fail because the webhook writes `category_name`.

## 4. SMS capture (the core advantage)

Each user copies their **personal webhook URL** from Settings → iPhone Shortcut
setup (`/api/i/{token}`). No secret keys or headers are needed.

- **iOS Shortcut:** Automation → Message → Text = blue *Shortcut Input* →
  Get Contents of URL (POST) → Request Body **Form** → key `raw_message` =
  Shortcut Input. Delete all headers.
- **Android (MacroDroid/Tasker):** SMS-received trigger → HTTP POST to the
  webhook URL → form field `raw_message` = the SMS body.

### 004 — shared merchant→category map (NEW)

```sql
create table if not exists merchant_category_votes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  merchant_key text not null,
  category_name text not null,
  updated_at timestamptz not null default now(),
  unique(user_id, merchant_key)
);

alter table merchant_category_votes enable row level security;

create policy "own merchant votes" on merchant_category_votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists merchant_votes_key_idx
  on merchant_category_votes (merchant_key);
```

## 5. Category auto-matching

When a bank SMS is ingested, the server parses the merchant name with
`parseMessage()` and decides a category in this order:

1. **Shared merchant map (community).** The merchant is normalized
   (`normalizeMerchant()` — uppercased, whitespace-collapsed, trailing 2-letter
   location code stripped) and looked up in `merchant_category_votes`. The
   **majority** category across all users wins.
2. **Keyword matcher (`matchCategory()`).** Static fallback when no votes exist.

The result is stored in `transactions.category_name`. Matched transactions
immediately count toward that category's spent amount; unmatched ones show as
**Uncategorized** until you tap to assign them.

### How the shared merchant map learns

Whenever a user assigns a transaction to a category, the app records **one vote
per (user, merchant)** in `merchant_category_votes` (re-assigning overwrites
that user's previous vote). Because ingest uses the **majority** vote, a single
wrong assignment can't mis-categorize a merchant for everyone — the crowd
corrects it. Clients can only read/write their own votes (RLS); the ingest
webhook tallies all votes via the service role, so other users' ids are never
exposed to clients.

### Customizing the keyword map

Edit `CATEGORY_KEYWORDS` in `src/lib/parseMessage.js`. It maps a regex of
keywords to a category name:

```js
export const CATEGORY_KEYWORDS = [
  { pattern: /market|grocery|supermart|mart|veggie/i, category: 'Groceries' },
  { pattern: /caf[eé]|restaurant|pizza|burger|coffee|dining/i, category: 'Dining Out' },
  { pattern: /petrol|shell|fuel|filling|taxi|transport/i, category: 'Transport' },
  // add your own...
]
```

`matchCategory(merchant)` returns the first matching category name, or `null`.
The category name must match a category you created that month for the spend to
roll up; otherwise the transaction stays Uncategorized and can be assigned by
tapping it.

## 6. App structure

- **Budget tab** — income vs spent, zero-based progress bar, category list with
  planned/actual, tap a category to see its transactions.
- **Transactions tab** — every transaction, auto-captured badges, category
  pills, tap an uncategorized row to assign a category.
- **Reports tab** — spending donut, budget-vs-actual bars, 6-month trend.

First-time users (no income for the current month) see a two-step onboarding:
set income, then divide it into categories.
