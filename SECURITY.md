# SmartSwap Security Layer

Security model, production requirements, and deployment guidance.

**Live:** [https://smartswap-8yvv.onrender.com](https://smartswap-8yvv.onrender.com)

---

## What Was Fixed

Earlier versions had fake frontend-only auth, open history access by email query param, and no rate limiting. The current security layer addresses all of these.

---

## Authentication

| Feature | Implementation |
|---------|---------------|
| Login | Email only → backend returns signed JWT (7-day expiry) |
| Storage | `localStorage` (`smartswap_auth`) + React state |
| Transport | `Authorization: Bearer <token>` on protected requests |
| Expiry handling | Frontend clears auth and reloads on 401/403 |

Production requires `JWT_SECRET` — the server **exits on startup** if it is missing when `NODE_ENV=production`.

---

## Authorization

| Endpoint | Auth | Rule |
|----------|------|------|
| `POST /api/auth/login` | No | Validates email format |
| `POST /api/optimize` | Optional | Uses token email if present; accepts body email for guests |
| `GET /api/history` | **Required** | Returns only records matching token email |
| `DELETE /api/history/:id` | **Required** | Token email must match record owner |
| `GET /api/history/:id` | No | Public — powers share links |
| `GET /api/health` | No | Liveness probe |

---

## Middleware & Hardening

| Layer | Details |
|-------|---------|
| **Helmet** | Standard security HTTP headers |
| **compression** | gzip — reduces response size |
| **CORS** | See below |
| **Rate limiting** | Optimize: 25 req / 15 min per IP; History: 60 req / 10 min per IP |
| **Body limit** | JSON payloads capped at 1 MB |
| **Input validation** | Email format, plan min 3 chars |
| **Trust proxy** | `app.set('trust proxy', 1)` for correct IP behind Render load balancer |
| **Production env gates** | Hard exit without `JWT_SECRET` and `GEMINI_API_KEY` |

---

## CORS Policy

Implemented in `backend/lib/cors.js` (unit-tested).

Allowed origins:
- Any `localhost` / `127.0.0.1` port (development)
- `FRONTEND_ORIGIN` env var (split hosting)
- `RENDER_EXTERNAL_URL` (set automatically by Render)
- **Same-host matching** — when `Origin` matches the request `Host` header (same-origin Docker deploy)

Rejected: all other external origins.

### Render same-origin deploy

When the Docker container serves both the built frontend and the API, the browser sends `Origin: https://your-app.onrender.com` on fetch requests. Same-host matching allows this without manual configuration.

For split hosting (frontend on Vercel, API on Render), set:

```env
FRONTEND_ORIGIN=https://your-frontend-domain.com
```

---

## Environment Variables

### Required in production

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API access |
| `JWT_SECRET` | Signs and verifies JWT tokens (32+ random characters) |
| `NODE_ENV` | Must be `production` on Render |

### Optional

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas — omit for local file fallback |
| `FRONTEND_ORIGIN` | Extra CORS origin for split deploys |
| `PORT` | Set automatically by Render |

### Never commit

- `.env` files with real keys
- API keys in source code or documentation examples

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/optimize` | 25 requests | 15 minutes per IP |
| `GET /api/history` | 60 requests | 10 minutes per IP |

Limits protect Gemini quota and reduce abuse on the free Render tier.

---

## Client-Side Hardening

- Checks `Content-Type: application/json` before parsing responses
- Clears `localStorage` auth on 401/403 during protected calls
- Does not expose API keys or JWT secrets in frontend code
- External action links use `rel="noopener noreferrer"`

---

## Production Checklist (Render)

- [ ] `JWT_SECRET` set to a strong random value
- [ ] `GEMINI_API_KEY` set and valid
- [ ] `NODE_ENV=production` (set by Blueprint)
- [ ] `MONGODB_URI` set if using Atlas (recommended for persistent data)
- [ ] Runtime = **Docker** (not Node)
- [ ] HTTPS enforced (automatic on Render)
- [ ] Health check passing at `/api/health`

---

## Known Limitations (By Design)

| Limitation | Notes |
|------------|-------|
| Email-only login | No password or email verification — suitable for demo/education scope |
| No refresh tokens | 7-day JWT expiry; users re-login when expired |
| Public share links | Anyone with the ID can view a shared result |
| Rate limits per IP | Shared NAT IPs may hit limits faster |
| Offline fallback | Returns estimated data when Gemini is unavailable — not real AI output |

For a production product beyond demo scope, consider: email verification, password or OAuth, refresh tokens, per-user rate limits, and audit logging.

---

## Reporting Security Issues

If you discover a vulnerability, please open a GitHub issue with minimal reproduction steps. Do not post exploit details publicly before a fix is available.

This security layer provides credible "Secure Private Accounts" while keeping the tool fast and delightful to use.