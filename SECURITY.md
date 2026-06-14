# SmartSwap Security Layer

This document describes the "intact security layer" added for a smooth experience.

## What Was Broken Before
- Authentication was completely fake (frontend-only email + hardcoded password field that did nothing).
- Any client could read anyone's history by guessing `?email=`.
- Anyone could delete any history item by knowing its `_id` (no ownership checks).
- Wide-open CORS.
- No rate limiting on the expensive Gemini calls.
- No security headers.
- All "private accounts" claims in the UI were not backed by anything.

## What The Security Layer Provides Now

### Authentication
- Real stateless JWT tokens (7-day expiry).
- Lightweight login: user enters only email → backend returns signed JWT.
- Token is stored in localStorage for session persistence across refreshes.
- Frontend automatically sends `Authorization: Bearer <token>` on protected routes.

### Protected Operations
- `GET /api/history` — requires valid token. Always returns **only the authenticated user's** data (ignores any client-supplied email).
- `DELETE /api/history/:id` — requires valid token **and** the history item must belong to that email. Returns 403 otherwise.
- `POST /api/optimize` — prefers authenticated email from token for saving history. Falls back gracefully so guests can still try the tool.

### Public (by design)
- `GET /api/history/:id` — intentionally public. This powers the share links (`/share/:id`). No change in behavior.

### Additional Hardening
- Helmet.js security headers
- CORS restricted to localhost dev origins + optional FRONTEND_ORIGIN env
- Rate limiting:
  - Optimize: 25 requests / 15 min per IP
  - History: 60 requests / 10 min per IP
- Input validation on key fields
- JSON body size limit (1mb)
- Token expiry handling on frontend with graceful re-login prompt

## Environment Variables (backend/.env)
See `.env.example`. Most important new one:

JWT_SECRET=long-random-string-here   # Strongly recommended for production

## Smooth Experience Notes
- Users still log in with a single email field (no password to remember or manage).
- No extra steps compared to the previous fake login.
- Share links continue to work without requiring login.
- If a token expires, the app detects 401/403 and prompts a clean re-login.

## Recommendations for Production
- Set a strong JWT_SECRET
- Put the backend behind HTTPS
- Consider adding email verification / magic links later if you want stronger identity proof
- Rotate JWT_SECRET periodically (existing users will simply log in again)
- Add a real database + proper user collection if you scale beyond the current email+history model

This gives you credible "Secure Private Accounts" while keeping the tool fast and delightful to use.
