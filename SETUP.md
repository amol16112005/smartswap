# SmartSwap Environment Setup & Checklist

Complete step-by-step guide to run SmartSwap locally, run tests, and verify a production deploy.

**Live app:** [https://smartswap-8yvv.onrender.com](https://smartswap-8yvv.onrender.com)

---

## Prerequisites

- Node.js **18+** (20 recommended)
- npm (bundled with Node)
- A modern browser
- Google Gemini API key — [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- (Optional) MongoDB Atlas free cluster for cloud persistence

---

## Step 1: Open the Project

```bash
git clone https://github.com/amol16112005/smartswap.git
cd smartswap
```

Or open the folder directly in your editor.

---

## Step 2: Backend Setup

### 2.1 Navigate and create `.env`

```bash
cd backend
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

### 2.2 Edit `.env`

Minimum required for local development:

```env
GEMINI_API_KEY=your_actual_key_here

# Recommended before sharing or deploying
# JWT_SECRET=a-long-random-string-at-least-32-characters

# Optional — MongoDB Atlas
# MONGODB_URI=<paste-your-atlas-connection-string-here>

PORT=5000
```

Never commit your real `.env` file.

### 2.3 Install and start

```bash
npm install
npm start
```

Expected output:

```
No MONGODB_URI provided in .env. Operating in LOCAL FALLBACK MODE (history_db.json).
SmartSwap Backend operating seamlessly on port 5000
Environment: development | frontend build: missing
```

Leave this terminal running.

---

## Step 3: Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Expected output:

```
VITE v8.x  ready
➜  Local:   http://localhost:5173/
```

Vite proxies `/api` requests to `http://localhost:5000` automatically.

If port 5173 is busy, Vite falls back to 5174, 5175, etc. — CORS allows all common localhost ports.

---

## Step 4: Verify the App

1. Open `http://localhost:5173`
2. Click **Access Your Personal Space**
3. Enter any email (e.g. `test@example.com`) → **Authenticate Identity**
4. On the Dashboard, submit a plan:
   - `buy a new phone from amazon`
   - `train trip from mumbai to delhi`
5. Click **Evaluate** — structured results should appear
6. Check the left sidebar — your query appears in history
7. Click a history item to reload it
8. Click **Share Link** — open in incognito (works without login)
9. Delete the item (owner only)

Backend terminal should show request logs:

```
[2026-06-18T...] POST /api/auth/login
[2026-06-18T...] POST /api/optimize
[2026-06-18T...] GET /api/history
```

---

## Step 5: Run Tests

From the **project root** (`smartswap/`):

```bash
# Install root dev dependency (cross-env) if not done
npm install

# Run all 41 tests
npm test
```

Or individually:

```bash
npm run test:backend    # 25 tests — API, CORS, offline fallback
npm run test:frontend   # 16 tests — components, hooks, axe a11y
npm run test:ci         # Tests + production frontend build
```

All tests should pass before pushing to `main` (CI enforces this automatically).

---

## Verification Checklist

- [ ] Backend starts on port 5000 without errors
- [ ] Frontend loads at localhost (5173 or fallback port)
- [ ] Login with any email succeeds
- [ ] Optimize returns AI suggestions (or offline fallback if key missing)
- [ ] History appears in sidebar after optimization
- [ ] Share link works in incognito without login
- [ ] Delete only works for your own items
- [ ] `npm test` passes (41/41)
- [ ] No CORS or `Unexpected token '<'` errors

---

## MongoDB Atlas (Optional)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user and allow network access (`0.0.0.0/0` for dev)
3. Add to `backend/.env`:

   ```env
   MONGODB_URI=<paste-your-atlas-connection-string-here>
   ```

4. Restart the backend — you should see:

   ```
   Successfully connected to MongoDB Atlas cloud database.
   ```

Existing local data stays in `history_db.json`. New entries go to MongoDB.

---

## Production Deploy (Render)

### One-time setup

1. Go to [render.com](https://render.com) → **New Blueprint** or connect the repo
2. Repo: `https://github.com/amol16112005/smartswap`
3. Render reads `render.yaml` and creates a Docker web service
4. In **Environment**, set:
   - `GEMINI_API_KEY` — your Gemini key
   - `JWT_SECRET` — strong random string (or let Blueprint generate it)
   - `MONGODB_URI` — optional Atlas connection string

### Deploy

Push to `main` — Render auto-deploys via `autoDeploy: true` in `render.yaml`.

Monitor **Events** in the Render dashboard. A successful deploy shows:

```
==> Your service is live 🎉
```

Verify:

```bash
curl https://smartswap-8yvv.onrender.com/api/health
```

Expected:

```json
{
  "status": "ok",
  "environment": "production",
  "database": "mongodb",
  "frontend": "built"
}
```

### If deploy fails

- Confirm **Runtime = Docker** in Render Settings (not Node)
- Use **Clear build cache & deploy**
- Roll back to the last successful commit in Events
- Check build logs for missing env vars (`JWT_SECRET`, `GEMINI_API_KEY`)

---

## Stopping Servers

Press `Ctrl + C` in each terminal.

To kill all Node processes (Windows):

```powershell
taskkill /F /IM node.exe
```

---

## Common Problems

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| Port 5000 in use | Old backend still running | Kill node processes or change `PORT` |
| `Unexpected token '<'` | Wrong server on port 5000 | Restart backend first, then frontend |
| Login fails | Backend down or CORS issue | Check backend logs; pull latest code |
| AI fails / demo mode | Invalid `GEMINI_API_KEY` | Verify key in `.env` or Render env |
| CORS on Render | Split-origin or stale config | Use same-origin Docker deploy |
| Tests fail | Missing `npm install` | Run `npm ci` in `backend/` and `frontend/` |
| Deploy internal error | Runtime switched to Node | Revert `render.yaml` to `runtime: docker` |

---

## Root Scripts Reference

From `smartswap/`:

| Command | Description |
|---------|-------------|
| `npm test` | Run all backend + frontend tests |
| `npm run test:ci` | Tests + frontend production build |
| `npm run build` | Build frontend only |
| `npm start` | Start backend in production mode |
| `npm run dev:backend` | Start backend (dev) |
| `npm run dev:frontend` | Start Vite dev server |

---

You should now have a fully working local SmartSwap environment with real authentication, AI integration, automated tests, and a clear path to production on Render.