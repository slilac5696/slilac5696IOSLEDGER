# iOS Shortcut + Supabase Setup

## 1. Run the database migration

The `transactions` table is not created yet on your new project.

**Option A — Supabase Dashboard (fastest)**  
Open [SQL Editor](https://supabase.com/dashboard/project/ezebgtcajtvypgovfbph/sql/new) and paste the contents of `supabase/migrations/001_transactions.sql`, then click **Run**.

**Option B — Supabase MCP in Cursor**  
Approve the Supabase plugin auth prompt when it appears (use your **new** Supabase login), then ask the agent to apply the migration.

---

## 2. Create your Ledger login

In [Authentication → Users](https://supabase.com/dashboard/project/ezebgtcajtvypgovfbph/auth/users), click **Add user** → email + password.  
Use these credentials in the Ledger PWA login screen.

Copy your **User UID** — the iOS Shortcut needs it.

**Ledger account (created):**
- Email: `slilac756@gmail.com`
- User ID: `655c1ad8-1ce2-48a1-95b4-2163fbfa70f4`

---

## 3. iOS Shortcut (SMS → Ledger) — correct wiring

Message automations use the **Message** variable, not typed "Shortcut Input".

### Actions (in order)

| # | Action | Setting |
|---|--------|---------|
| 1 | **Text** | Tap field → select blue **Message** (from automation trigger) |
| 2 | **Get Contents of URL** | See below |

### Get Contents of URL

| Field | Value |
|-------|--------|
| URL | `https://slilac5696iosledger-production.up.railway.app/api/ingest` |
| Method | POST |
| Headers | `Content-Type` = `application/json` |
| Headers | `x-service-key` = your `SUPABASE_SERVICE_ROLE_KEY` |
| Request Body | JSON |

**JSON fields** (tap each value → pick variable, never type placeholder text):

| Key | Value |
|-----|--------|
| `user_id` | Text: `655c1ad8-1ce2-48a1-95b4-2163fbfa70f4` |
| `raw_message` | Select **Text** from step 1 (the action output pill) |

### Alternative: Form body (easier on some iPhones)

Request Body → **Form**:
- `user_id` → your UUID (text)
- `raw_message` → **Text** action from step 1

---

## 4. Environment variables (already in `.env`)

| Variable | Used by |
|----------|---------|
| `VITE_SUPABASE_URL` | Ledger PWA (browser) |
| `VITE_SUPABASE_ANON_KEY` | Ledger PWA login + data |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/ingest` webhook only — never put in the Shortcut URL; only in the `x-service-key` header on your server |

---

## 5. Verify

```bash
npm run dev
```

1. Sign in at http://localhost:3000 with your Supabase user  
2. Paste a sample SMS via **Add transaction manually**  
3. Or POST to `/api/ingest` with your service key and `user_id`

**Sample SMS:**
```
Transaction from 4172 on 21/06/26 at 19:13:35 for MVR351.10 at OLIVE TREE MARKET MA was processed. Reference No:008636294270, Approval Code:309909.
```
