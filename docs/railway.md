# Deploy Ledger to Railway

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Ledger app"
git remote add origin https://github.com/YOUR_USER/ledger.git
git push -u origin main
```

## 2. Create Railway project

1. Go to [railway.app](https://railway.app) and sign in
2. **New Project** → **Deploy from GitHub repo**
3. Select your `ledger` repository
4. Railway auto-detects Node and runs `npm run build` then `npm start`

## 3. Set environment variables

In Railway → your service → **Variables**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://ezebgtcajtvypgovfbph.supabase.co` | Required at **build** time |
| `VITE_SUPABASE_ANON_KEY` | your anon key from `.env` | Required at **build** time |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key from `.env` | Runtime only (webhook) |

Copy values from your local `.env` file. Do not commit `.env` to GitHub.

## 4. Generate a public URL

1. Railway → service → **Settings** → **Networking**
2. Click **Generate Domain**
3. You’ll get something like `https://ledger-production-xxxx.up.railway.app`

Redeploy after adding variables (Railway usually redeploys automatically).

## 5. Install on iPhone

1. Open your Railway URL in **Safari**
2. **Share** → **Add to Home Screen**
3. Sign in:
   - Email: `slilac756@gmail.com`
   - Password: your Supabase password

## 6. iOS Shortcut URL

Update your SMS automation **Get Contents of URL** action:

| Setting | Value |
|---------|--------|
| **URL** | `https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/ingest` |
| **Method** | POST |
| **Header** | `Content-Type` → `application/json` |
| **Header** | `x-service-key` → your `SUPABASE_SERVICE_ROLE_KEY` |

**JSON body:**
```json
{
  "user_id": "655c1ad8-1ce2-48a1-95b4-2163fbfa70f4",
  "raw_message": "<Shortcut Input>"
}
```

## 7. Verify

```bash
curl -X POST https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/ingest \
  -H "Content-Type: application/json" \
  -H "x-service-key: YOUR_SERVICE_ROLE_KEY" \
  -d '{"user_id":"655c1ad8-1ce2-48a1-95b4-2163fbfa70f4","raw_message":"Transaction from 4172 on 21/06/26 at 19:13:35 for MVR351.10 at OLIVE TREE MARKET MA was processed. Reference No:008636294270, Approval Code:309909."}'
```

Expected response: `{"ok":true}`

Then open Ledger on your phone — the transaction should appear.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page after deploy | Ensure `VITE_*` vars were set **before** build; trigger a redeploy |
| 401 on `/api/ingest` | Check `SUPABASE_SERVICE_ROLE_KEY` matches `.env` |
| Shortcut doesn’t fire | Enable automation, disable “Ask Before Running”, filter correct sender |
| PWA won’t install | Use Safari, not Chrome |
