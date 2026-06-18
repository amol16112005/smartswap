# SmartSwap

**SmartSwap** is an intelligent pre-consumption intervention engine. It intercepts everyday consumer plans (shopping, travel, sourcing) and instantly generates smarter, lower-cost, lower-carbon alternatives using generative AI.

The goal is simple but powerful: help people make better decisions *before* they spend money, instead of tracking damage afterward.

**Live demo:** [https://smartswap-8yvv.onrender.com](https://smartswap-8yvv.onrender.com)

---

## What Makes This Project Special

SmartSwap is more than a typical "carbon calculator". It is a **full-stack AI application** with deliberate architectural choices that make it educational, robust, and production-ready:

### 1. AI with Strict Structured Output
- Powered by **Google Gemini** (2.5 Flash, with model fallbacks)
- Highly engineered system prompt forces **exact JSON** matching a defined schema
- Carbon impact surfaces as a hidden `carbonSavedPercent` metric — not preachy user-facing text
- Offline fallback when the API is unavailable or quota is exhausted
- Returns `isAlreadyOptimal: true` when the user's plan is already the best option

### 2. Real (but Smooth) Authentication
- Login with **just an email** — no password friction
- Backend issues a real **JWT** (7-day expiry)
- Protected history list and delete operations with ownership checks
- Public share links (`/share/:id`) work without authentication
- Tokens stored in `localStorage`, sent via `Authorization: Bearer` headers

### 3. Resilient Database Strategy
- **MongoDB Atlas** via Mongoose when `MONGODB_URI` is set
- Automatic fallback to `history_db.json` if MongoDB is missing or unreachable
- Same API surface in both modes

### 4. Security & Production Hardening
- **Helmet.js** — security HTTP headers
- **express-rate-limit** — protects AI and history endpoints
- **compression** — gzip responses in production
- **CORS** — localhost dev ports, same-origin Render deploys, optional `FRONTEND_ORIGIN`
- Production env validation for `JWT_SECRET` and `GEMINI_API_KEY`
- Input validation, JSON body limits, request logging

### 5. Public Sharing + Private Data
- Every analysis can become a shareable link
- `/share/:id` is intentionally public
- Dashboard, list, and delete are JWT-protected and user-scoped

### 6. Modern Full-Stack Practices
- **Modular React frontend** — lazy-loaded routes, reusable components
- **Extracted backend libs** — CORS and offline fallback logic in `backend/lib/`
- **Same-origin production deploy** — Docker image serves built frontend + API from one service
- **41 automated tests** — API, unit, component, and axe accessibility audits
- **GitHub Actions CI** — tests, lint, and build on every push to `main`

### 7. Accessibility
- Skip link, semantic landmarks, labelled forms
- `aria-live` regions for errors and loading states
- Keyboard-accessible history controls
- Automated axe-core checks in the test suite

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 8, React Router 7, Lucide React, Vitest, Testing Library, vitest-axe |
| **Backend** | Node.js 20, Express 5, `@google/genai`, Mongoose, JWT, Helmet, compression |
| **Database** | MongoDB Atlas (optional) + `history_db.json` fallback |
| **Deploy** | Docker, Render (Blueprint + auto-deploy), GitHub Actions CI |
| **AI** | Gemini with strict JSON mode + offline fallback engine |

---

## Project Structure

```
smartswap/
├── .github/workflows/ci.yml   # GitHub Actions: test, lint, build
├── backend/
│   ├── lib/
│   │   ├── cors.js            # CORS origin policy (unit-tested)
│   │   └── offlineFallback.js # Demo-mode AI fallback (unit-tested)
│   ├── tests/
│   │   ├── api.test.js        # API integration tests (supertest)
│   │   ├── cors.test.js
│   │   └── offlineFallback.test.js
│   ├── server.js              # Express app entry point
│   ├── history_db.json        # Local fallback database
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SharedSwapPage.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── OptimizationResult.jsx
│   │   ├── hooks/
│   │   │   └── useDocumentTitle.js
│   │   ├── App.jsx            # Router shell + lazy-loaded pages
│   │   └── config.js          # API URL helper (same-origin aware)
│   ├── package.json
│   └── vite.config.js
│
├── Dockerfile                 # Multi-stage: build frontend → serve from backend
├── render.yaml                # Render Blueprint (Docker, auto-deploy)
├── Procfile
├── package.json               # Root scripts: test, build, start
│
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── SECURITY.md
├── SETUP.md
└── README.md
```

---

## Quick Start (Local)

### Prerequisites
- Node.js **18+** (20 recommended)
- npm
- Google Gemini API key — [get one here](https://aistudio.google.com/app/apikey)
- (Optional) MongoDB Atlas connection string

### 1. Backend

```bash
cd backend
cp .env.example .env    # Windows: Copy-Item .env.example .env
# Edit .env — add GEMINI_API_KEY at minimum
npm install
npm start
```

Expected output: `SmartSwap Backend operating seamlessly on port 5000`

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`). Vite proxies `/api` to port 5000.

### 3. Run tests

From the project root:

```bash
npm test                  # All 41 tests (backend + frontend)
npm run test:backend      # 25 backend tests only
npm run test:frontend     # 16 frontend tests only
npm run test:ci           # Tests + production frontend build
```

---

## Deploy to Render

The app is configured for **Docker-based deployment** on Render via `render.yaml`.

1. Connect the GitHub repo: `https://github.com/amol16112005/smartswap`
2. Render detects `render.yaml` and creates a Docker web service
3. Set these environment variables in the Render dashboard:
   - `GEMINI_API_KEY` — required
   - `JWT_SECRET` — required in production (Blueprint can auto-generate)
   - `MONGODB_URI` — optional (uses file fallback if omitted)
4. Push to `main` — auto-deploy triggers on each commit

Health check: `GET /api/health` → `{ "status": "ok", "frontend": "built" }`

**Important:** Keep `runtime: docker` in `render.yaml`. Switching an existing service to native Node runtime can break deploys.

---

## Key User Flows

1. **Landing** — Mission page with feature overview
2. **Login** — Enter email → receive JWT → stored in localStorage
3. **Dashboard** — Submit a consumer plan → AI returns structured alternatives
4. **History** — Past analyses listed in sidebar; click to re-open
5. **Share** — Copy link to any saved result; viewable without login
6. **Delete** — Owner-only, enforced by JWT + backend ownership check

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | No | Health check + environment info |
| `POST` | `/api/auth/login` | No | Email login → JWT |
| `POST` | `/api/optimize` | Optional | AI optimization (+ save if email/token present) |
| `GET` | `/api/history` | Yes | User's history list |
| `GET` | `/api/history/:id` | No | Public share view |
| `DELETE` | `/api/history/:id` | Yes | Delete own history item |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes (prod) | Google Gemini API key |
| `JWT_SECRET` | Yes (prod) | Signs JWT tokens — use 32+ random chars |
| `MONGODB_URI` | No | MongoDB Atlas connection string |
| `PORT` | No | Default `5000` (Render sets this automatically) |
| `FRONTEND_ORIGIN` | No | Extra CORS origin for split frontend/API hosting |
| `NODE_ENV` | No | `development` locally, `production` on Render |

See `backend/.env.example` for a template.

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Port 5000 in use | Kill old node processes or change `PORT` in `.env` |
| `Unexpected token '<'` | Backend not running on 5000, or wrong server responding |
| CORS errors on Render | Ensure same-origin deploy (one service serves both); check `RENDER_EXTERNAL_URL` is allowed |
| AI returns demo/fallback data | Gemini key invalid or quota exhausted — check Render env vars |
| Deploy fails after runtime change | Revert to `runtime: docker` in `render.yaml` and redeploy |

---

## Documentation

| File | Contents |
|------|----------|
| [SETUP.md](./SETUP.md) | Step-by-step local setup checklist |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Data flow, diagrams, design decisions |
| [SECURITY.md](./SECURITY.md) | Auth model, CORS, rate limits, production guidance |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute, test requirements, PR checklist |

---

## Why This Is a Strong Full-Stack Example

SmartSwap demonstrates real-world concerns in one coherent application:

- Authentication & authorization (JWT + ownership)
- AI integration with strict output contracts and graceful fallback
- Resilient data layer (cloud DB + local file fallback)
- Security (Helmet, rate limits, CORS, compression, env validation)
- Public vs private data patterns
- Modular frontend with lazy loading and accessibility
- Automated testing (API, unit, component, axe a11y) + CI pipeline
- Production deployment (Docker, Render, health checks)

---

**SmartSwap** — intercept decisions at the source, before the spend.