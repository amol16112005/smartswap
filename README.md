# SmartSwap

**SmartSwap** is an intelligent pre-consumption intervention engine. It intercepts everyday consumer plans (shopping, travel, sourcing) and instantly generates smarter, lower-cost, lower-carbon alternatives using generative AI.

The goal is simple but powerful: help people make better decisions *before* they spend money, instead of tracking damage afterward.

---

## What Makes This Project Special

SmartSwap is more than a typical "carbon calculator". It is a **full-stack AI application** with several deliberate architectural choices that make it educational, robust, and production-like:

### 1. AI with Strict Structured Output
- Powered by **Google Gemini 2.5 Flash**
- Uses a highly engineered system prompt that forces the model to return **exact JSON** matching a defined schema
- The AI is instructed **not to mention carbon** in the user-facing text — it only surfaces as a hidden "carbonSavedPercent" metric (a "bonus" the user discovers)
- If the user's original plan is already optimal, the AI returns `isAlreadyOptimal: true` and an empty alternatives array

This pattern (constrained generation + hidden metrics) is a common real-world technique when building AI products that must feel human and non-preachy.

### 2. Real (but Smooth) Authentication Layer
One of the most important recent additions is a **proper security layer** while preserving a frictionless user experience:

- Users log in with **just an email** — no password required
- The backend issues a real **JWT token** (7-day expiry)
- All sensitive operations are protected:
  - History listing only returns data belonging to the token's email
  - Deleting a history item requires both a valid token **and** ownership verification
- Public share links (`/share/:id`) remain accessible without authentication
- Tokens are stored in `localStorage` and sent via `Authorization: Bearer` headers

This demonstrates modern token-based auth, protected routes, and ownership checks in a full-stack context — without the usual login friction.

### 3. Resilient Database Strategy
- Supports **MongoDB Atlas** via Mongoose when `MONGODB_URI` is provided
- Automatically falls back to a local `history_db.json` file if no database is configured or if the connection fails
- The same data models and API surface work in both modes
- This makes the project extremely easy to run locally while still being cloud-ready

### 4. Security & Production Hardening
The backend includes several production-grade practices:

- **Helmet.js** – sets important security HTTP headers
- **express-rate-limit** – protects expensive AI calls and data endpoints
- **Tightened CORS** – allows common localhost ports + configurable production origin
- **Request logging middleware** – every API call is logged with timestamp and method
- **Input validation** + body size limits
- **Defensive client-side parsing** – the frontend checks `Content-Type` before calling `.json()` and provides clear error messages if the backend returns HTML or text

### 5. Public Sharing + Private Data Model
This is a nice architectural pattern:
- Every analysis can be turned into a shareable link
- The `/share/:id` route is intentionally public (no auth required)
- The personal dashboard and mutations (save, delete, list) are fully protected and filtered by the authenticated user
- Demonstrates the common real-world pattern of "public read for sharing, private write for owners"

### 6. Modern Full-Stack Practices
- **Frontend**: React 19 + Vite + React Router 7. Clean component-based structure with no heavy CSS framework (inline styles for speed).
- **Backend**: Express 5 + structured AI calls + JWT + graceful degradation.
- **Client-server contract**: Strict JSON shapes on both sides. The frontend has defensive parsing so the app degrades gracefully if something goes wrong on the backend.
- **SPA + API separation**: The frontend is a pure client application. The backend only serves JSON APIs (no server-side rendering).

### 7. Developer Experience & Observability
- Easy to run without any external services (just a Gemini API key)
- Real-time request logs appear while developing
- Clear separation between public share experience and authenticated personal workspace
- History sidebar allows instant re-opening of previous analyses

---

## Tech Stack

### Frontend (`frontend/`)
- React 19 + Vite
- React Router 7
- Lucide React (icons)
- Pure JavaScript + inline CSS (deliberately lightweight)

### Backend (`backend/`)
- Node.js + Express 5
- `@google/genai` (Gemini 2.5 Flash)
- Mongoose (optional MongoDB)
- `jsonwebtoken` (real JWT auth)
- `helmet`, `express-rate-limit`, `cors`
- dotenv + local JSON fallback

### AI Layer
- Gemini 2.5 Flash with a very strict system instruction
- Forced JSON mode (`responseMimeType: 'application/json'`)
- Carefully designed output schema

---

## Project Structure

```
smartswap/
├── backend/
│   ├── server.js              # Main Express app (AI, auth, routes, DB logic)
│   ├── history_db.json        # Local fallback database
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Single-file React app (Landing, Login, Dashboard, Share)
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── ARCHITECTURE.md            # Deep architecture + specialties diagram
├── CONTRIBUTING.md            # Contribution guidelines
├── README.md                  # You are here
└── SETUP.md (see checklist in this file)
```

---

## Environment Setup Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm (comes with Node)
- [ ] A Google Gemini API key (free tier works)
- [ ] (Optional) MongoDB Atlas account for cloud database

### Backend Setup
1. `cd smartswap/backend`
2. `cp .env.example .env` (or copy manually)
3. Edit `.env` and add:
   ```
   GEMINI_API_KEY=your_actual_key_here
   # JWT_SECRET=optional_strong_secret_for_production
   # MONGODB_URI=optional_mongodb_connection_string
   ```
4. `npm install`
5. `npm start` or `node server.js`
6. You should see: `SmartSwap Backend operating seamlessly on port 5000`

### Frontend Setup
1. `cd smartswap/frontend`
2. `npm install`
3. `npm run dev`
4. Open the URL shown (usually http://localhost:5173 or 5174 etc.)

### Verification Steps
- [ ] Backend starts without errors
- [ ] Frontend loads at localhost port shown
- [ ] You can log in with any email
- [ ] Submitting a plan returns AI suggestions
- [ ] History is saved and visible in sidebar
- [ ] Request logs appear in backend console when using the app

### Common Issues
- **Port already in use**: Kill old node processes or let Vite use the next port.
- **"Unexpected token '<'" error**: Usually means an old/stale process is running on port 5000 instead of the real backend.
- **CORS errors**: Use the latest version of the code (CORS is now flexible for localhost ports).
- **AI not working**: Double-check your `GEMINI_API_KEY` in `.env`.

---

## Key User Flows

1. **Landing** → Beautiful marketing page explaining the mission.
2. **Login** → Just enter email → backend returns JWT → stored in localStorage.
3. **Dashboard** → Enter any consumer plan → AI analyzes it → shows original vs smart alternatives.
4. **History** → All past analyses are saved and listed on the left. Click to re-open.
5. **Sharing** → Click "Share Link" on any result → anyone with the link can view it (no login needed).
6. **Delete** → Only the owner (via JWT) can delete their own history items.

---

## How to Run (Quick)

See the full checklist above. Basic commands:

```bash
# Terminal 1 - Backend
cd smartswap/backend
npm install
node server.js

# Terminal 2 - Frontend
cd smartswap/frontend
npm install
npm run dev
```

---

## Why This Is a Strong Full-Stack Example

SmartSwap demonstrates many real-world full-stack concerns in one coherent application:

- **Authentication & Authorization** (JWT + ownership checks)
- **AI Integration** with strict output contracts
- **Graceful Degradation** (DB + error handling)
- **Security Best Practices** (headers, rate limits, CORS, token validation)
- **Public vs Private Data** patterns
- **Modern Frontend Architecture** (SPA + client-side routing)
- **Observability** (request logging)
- **Developer Experience** (easy local run, no mandatory external services)

It was also deliberately hardened with a proper security layer while keeping the experience extremely smooth (one-field login).

---

## Notes

- The AI is instructed to prioritize **cost savings** first. Carbon reduction is treated as a hidden benefit.
- All styling is inline on purpose — this keeps the focus on architecture and logic rather than CSS complexity.
- The project was actively improved with real JWT auth, defensive programming, and production middleware during development.

---

**SmartSwap** shows how to build a useful, secure, AI-powered full-stack application that feels modern and thoughtful — both for the end user and for the developer.

For deeper technical details (including diagrams), see:
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)